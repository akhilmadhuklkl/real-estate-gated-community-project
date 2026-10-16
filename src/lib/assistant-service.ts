import { createGoogle } from "@ai-sdk/google";
import { generateText } from "ai";
import { z } from "zod";

import {
  ASSISTANT_POLICY_VERSION,
  ASSISTANT_SYSTEM_INSTRUCTIONS,
  evaluateAssistantPolicy,
  type AssistantPolicyReason,
  type AssistantRiskTier,
} from "./assistant-policy";
import type { RetrievalMatch } from "./vector-retrieval";

export const ASSISTANT_MODEL = "gemini-3.8-flash";
export const ASSISTANT_MINIMUM_SCORE = 0.45;

const questionSchema = z.string().trim().min(2).max(500);
const sensitivePatterns = [
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  /(?:\+?\d[\s()-]*){9,}/,
  /\b\d{4}[ -]?\d{4}[ -]?\d{4}\b/,
];

export type AssistantCitation = {
  evidenceId: string;
  sourceId: string;
  locator: string;
  qualification: string;
};

export type AssistantAnswer = {
  sessionId: string;
  status:
    | "answered"
    | "blocked"
    | "human-confirmation-required"
    | "insufficient-evidence"
    | "service-unavailable";
  answer: string;
  citations: AssistantCitation[];
  model: string | null;
  policy: {
    version: string;
    reason: AssistantPolicyReason;
    riskTier: AssistantRiskTier;
    humanHandoffRequired: boolean;
  };
};

export type AssistantRetriever = (args: {
  query: string;
  minimumScore: number;
  topK: number;
}) => Promise<RetrievalMatch[]>;

export type AssistantGenerator = (args: {
  question: string;
  evidence: RetrievalMatch[];
  history: AssistantTurn[];
}) => Promise<string>;

export type AssistantTurn = {
  role: "user" | "assistant";
  text: string;
};

export type AssistantRequest = {
  question: string;
  sessionId?: string;
  history?: AssistantTurn[];
};

const historySchema = z
  .array(
    z.object({
      role: z.enum(["user", "assistant"]),
      text: z.string().trim().min(1).max(500),
    }),
  )
  .max(6)
  .default([]);

function createSessionId(): string {
  return `session-${crypto.randomUUID()}`;
}

export function containsSensitivePersonalData(value: string): boolean {
  return sensitivePatterns.some((pattern) => pattern.test(value));
}

export function buildGroundedPrompt(
  question: string,
  evidence: RetrievalMatch[],
  history: AssistantTurn[] = [],
): string {
  const sources = evidence
    .map(
      (item, index) =>
        `[E${index + 1}] Source: ${item.sourceId}; Locator: ${item.locator.label}; Qualification: ${item.qualification}\n${item.text}`,
    )
    .join("\n\n");

  const recentConversation = history.length
    ? `Recent conversation for context only:\n${history
        .map((turn) => `${turn.role}: ${turn.text}`)
        .join("\n")}\n\n`
    : "";
  return `${recentConversation}Question:\n${question}\n\nApproved evidence:\n${sources}`;
}

export function createGeminiGenerator(apiKey: string): AssistantGenerator {
  if (!apiKey.trim()) {
    throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is required.");
  }
  const google = createGoogle({ apiKey });

  return async ({ question, evidence, history }) => {
    const { text } = await generateText({
      model: google(ASSISTANT_MODEL),
      instructions: ASSISTANT_SYSTEM_INSTRUCTIONS,
      prompt: buildGroundedPrompt(question, evidence, history),
      maxOutputTokens: 350,
      temperature: 0.2,
      telemetry: { isEnabled: false },
    });
    return text.trim();
  };
}

export function createAssistantService(dependencies: {
  retrieve: AssistantRetriever;
  generate: AssistantGenerator;
  model?: string;
}) {
  return async (
    request: string | AssistantRequest,
  ): Promise<AssistantAnswer> => {
    const rawQuestion =
      typeof request === "string" ? request : request.question;
    const sessionId =
      typeof request === "string" || !request.sessionId
        ? createSessionId()
        : request.sessionId;
    const parsedHistory = historySchema.safeParse(
      typeof request === "string" ? [] : request.history,
    );
    const parsed = questionSchema.safeParse(rawQuestion);
    const defaultPolicy = {
      version: ASSISTANT_POLICY_VERSION,
      reason: "allowed" as const,
      riskTier: "R0" as const,
      humanHandoffRequired: false,
    };
    if (!parsed.success || !parsedHistory.success) {
      return {
        sessionId,
        status: "blocked",
        answer: "Please ask a short, specific question about Glitz Pride.",
        citations: [],
        model: null,
        policy: defaultPolicy,
      };
    }

    const question = parsed.data;
    const history = parsedHistory.data;
    if (
      containsSensitivePersonalData(question) ||
      history.some((turn) => containsSensitivePersonalData(turn.text))
    ) {
      return {
        sessionId,
        status: "blocked",
        answer:
          "For privacy, please remove phone numbers, email addresses, or personal identifiers before asking your question.",
        citations: [],
        model: null,
        policy: {
          ...defaultPolicy,
          reason: "private-data-request",
          riskTier: "R4",
        },
      };
    }

    const policyDecision = evaluateAssistantPolicy(question);
    const policy = {
      version: ASSISTANT_POLICY_VERSION,
      reason: policyDecision.reason,
      riskTier: policyDecision.riskTier,
      humanHandoffRequired: policyDecision.action === "escalate",
    };
    if (policyDecision.action !== "allow") {
      return {
        sessionId,
        status:
          policyDecision.action === "escalate"
            ? "human-confirmation-required"
            : "blocked",
        answer: policyDecision.response ?? "That request cannot be completed.",
        citations: [],
        model: null,
        policy,
      };
    }

    let evidence: RetrievalMatch[];
    try {
      evidence = await dependencies.retrieve({
        query: question,
        minimumScore: ASSISTANT_MINIMUM_SCORE,
        topK: 3,
      });
    } catch {
      return {
        sessionId,
        status: "service-unavailable",
        answer:
          "The property guide is temporarily unavailable. Please try again shortly or contact the project representative.",
        citations: [],
        model: null,
        policy,
      };
    }
    if (!evidence.length) {
      return {
        sessionId,
        status: "insufficient-evidence",
        answer:
          "That information is not confirmed in the approved project material. Please contact the project representative for an update.",
        citations: [],
        model: null,
        policy: { ...policy, humanHandoffRequired: true },
      };
    }

    let answer: string;
    try {
      answer = await dependencies.generate({ question, evidence, history });
    } catch {
      return {
        sessionId,
        status: "service-unavailable",
        answer:
          "The property guide could not complete that response. Please try again shortly or contact the project representative.",
        citations: [],
        model: null,
        policy,
      };
    }
    return {
      sessionId,
      status: "answered",
      answer,
      citations: evidence.map((item) => ({
        evidenceId: item.id,
        sourceId: item.sourceId,
        locator: item.locator.label,
        qualification: item.qualification,
      })),
      model: dependencies.model ?? ASSISTANT_MODEL,
      policy,
    };
  };
}
