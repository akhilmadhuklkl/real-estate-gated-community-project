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
import {
  assistantMessage,
  languageUnavailableMessage,
  resolveAssistantLanguage,
  targetLanguageInstruction,
  type AssistantLanguage,
} from "./assistant-language";
import type { RetrievalMatch } from "./vector-retrieval";

export const ASSISTANT_MODEL = "gemini-3.5-flash-lite";
export const ASSISTANT_FALLBACK_MODEL = "gemini-3.8-flash";
export const ASSISTANT_MODELS = [
  ASSISTANT_MODEL,
  ASSISTANT_FALLBACK_MODEL,
] as const;
export const ASSISTANT_MINIMUM_SCORE = 0.45;

export async function runWithModelFallback<T>(
  operation: (model: (typeof ASSISTANT_MODELS)[number]) => Promise<T>,
): Promise<T> {
  let finalError: unknown;
  for (const model of ASSISTANT_MODELS) {
    try {
      return await operation(model);
    } catch (error) {
      finalError = error;
    }
  }
  throw finalError ?? new Error("No assistant model is configured.");
}

const questionSchema = z.string().trim().min(2).max(500);
const sensitivePatterns = [
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  /(?:\+?\d[\s()-]*){9,}/,
  /\b\d{4}[ -]?\d{4}[ -]?\d{4}\b/,
];

export type AssistantCitation = {
  evidenceId: string;
  sourceId: string;
  documentId: string;
  sourceTitle: string;
  locator: {
    label: string;
    pageStart: number | null;
    pageEnd: number | null;
    sectionPath: string[];
  };
  effectiveDate: string | null;
  reviewedAt: string;
  validUntil: string | null;
  qualification: string;
  href: string | null;
  confidence: {
    level: "high" | "moderate" | "limited";
    score: number;
    basis: "retrieval-score";
  };
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
  evidence: {
    confidence: "high" | "moderate" | "limited" | "none";
    citationCount: number;
    minimumScore: number;
  };
};

export type AssistantRetriever = (args: {
  query: string;
  minimumScore: number;
  topK: number;
  language: AssistantLanguage;
}) => Promise<RetrievalMatch[]>;

export type AssistantGenerator = (args: {
  question: string;
  evidence: RetrievalMatch[];
  history: AssistantTurn[];
  language: AssistantLanguage;
}) => Promise<string>;

export type AssistantQueryTranslator = (args: {
  question: string;
  language: AssistantLanguage;
}) => Promise<string>;

export type AssistantTurn = {
  role: "user" | "assistant";
  text: string;
};

export type AssistantRequest = {
  question: string;
  sessionId?: string;
  history?: AssistantTurn[];
  language?: AssistantLanguage;
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

export function evidenceConfidence(
  score: number,
): "high" | "moderate" | "limited" {
  if (score >= 0.8) return "high";
  if (score >= 0.6) return "moderate";
  return "limited";
}

function noEvidence() {
  return {
    confidence: "none" as const,
    citationCount: 0,
    minimumScore: ASSISTANT_MINIMUM_SCORE,
  };
}

export function containsSensitivePersonalData(value: string): boolean {
  return sensitivePatterns.some((pattern) => pattern.test(value));
}

export function buildGroundedPrompt(
  question: string,
  evidence: RetrievalMatch[],
  history: AssistantTurn[] = [],
  language: AssistantLanguage = "en",
): string {
  const sources = evidence
    .map(
      (item, index) =>
        `[E${index + 1}] Source: ${item.citation.sourceTitle} (${item.sourceId}); Locator: ${item.locator.label}; Reviewed: ${item.citation.reviewedAt}; Qualification: ${item.qualification}\n${item.text}`,
    )
    .join("\n\n");

  const recentConversation = history.length
    ? `Recent conversation for context only:\n${history
        .map((turn) => `${turn.role}: ${turn.text}`)
        .join("\n")}\n\n`
    : "";
  return `${targetLanguageInstruction(language)}\n\n${recentConversation}Question:\n${question}\n\nApproved evidence (canonical English source text):\n${sources}`;
}

export function createGeminiGenerator(apiKey: string): AssistantGenerator {
  if (!apiKey.trim()) {
    throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is required.");
  }
  const google = createGoogle({ apiKey });

  return async ({ question, evidence, history, language }) => {
    const { text } = await runWithModelFallback((model) =>
      generateText({
        model: google(model),
        instructions: ASSISTANT_SYSTEM_INSTRUCTIONS,
        prompt: buildGroundedPrompt(question, evidence, history, language),
        maxOutputTokens: 1600,
        temperature: 0.2,
        maxRetries: 0,
        abortSignal: AbortSignal.timeout(25_000),
        telemetry: { isEnabled: false },
      }),
    );
    return text.trim();
  };
}

export function createGeminiQueryTranslator(
  apiKey: string,
): AssistantQueryTranslator {
  if (!apiKey.trim()) {
    throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is required.");
  }
  const google = createGoogle({ apiKey });

  return async ({ question, language }) => {
    if (language === "en") return question;
    const { text } = await runWithModelFallback((model) =>
      generateText({
        model: google(model),
        instructions:
          "Translate the property question into concise English for semantic retrieval. Return only the translation. Preserve proper names, numbers, units, negation, uncertainty, and requested time scope. Do not answer the question or add facts.",
        prompt: question,
        maxOutputTokens: 500,
        temperature: 0,
        maxRetries: 0,
        abortSignal: AbortSignal.timeout(20_000),
        telemetry: { isEnabled: false },
      }),
    );
    const translated = text.trim();
    if (!translated) throw new Error("Query translation was empty.");
    return translated;
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
        evidence: noEvidence(),
      };
    }

    const question = parsed.data;
    const history = parsedHistory.data;
    const requestedLanguage = resolveAssistantLanguage(
      question,
      typeof request === "string" ? "en" : request.language,
    );
    if (
      containsSensitivePersonalData(question) ||
      history.some((turn) => containsSensitivePersonalData(turn.text))
    ) {
      return {
        sessionId,
        status: "blocked",
        answer: assistantMessage(requestedLanguage.code, "removePersonalData"),
        citations: [],
        model: null,
        policy: {
          ...defaultPolicy,
          reason: "private-data-request",
          riskTier: "R4",
        },
        evidence: noEvidence(),
      };
    }

    if (requestedLanguage.approvalState !== "approved") {
      return {
        sessionId,
        status: "insufficient-evidence",
        answer: languageUnavailableMessage(requestedLanguage),
        citations: [],
        model: null,
        policy: {
          ...defaultPolicy,
          reason: "translation-not-approved",
          riskTier: "R1",
          humanHandoffRequired: true,
        },
        evidence: noEvidence(),
      };
    }

    const policyDecision =
      [
        ...history.map(({ text }) => evaluateAssistantPolicy(text)),
        evaluateAssistantPolicy(question),
      ].find(({ action }) => action !== "allow") ??
      evaluateAssistantPolicy(question);
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
        answer: assistantMessage(
          requestedLanguage.code,
          policyDecision.action === "escalate"
            ? "humanConfirmation"
            : "policyBoundary",
        ),
        citations: [],
        model: null,
        policy,
        evidence: noEvidence(),
      };
    }

    let evidence: RetrievalMatch[];
    try {
      evidence = await dependencies.retrieve({
        query: question,
        minimumScore: ASSISTANT_MINIMUM_SCORE,
        topK: 3,
        language: requestedLanguage.code,
      });
    } catch {
      return {
        sessionId,
        status: "service-unavailable",
        answer: assistantMessage(requestedLanguage.code, "serviceUnavailable"),
        citations: [],
        model: null,
        policy,
        evidence: noEvidence(),
      };
    }
    if (!evidence.length) {
      return {
        sessionId,
        status: "insufficient-evidence",
        answer: assistantMessage(
          requestedLanguage.code,
          "insufficientEvidence",
        ),
        citations: [],
        model: null,
        policy: { ...policy, humanHandoffRequired: true },
        evidence: noEvidence(),
      };
    }

    let answer: string;
    try {
      answer = await dependencies.generate({
        question,
        evidence,
        history,
        language: requestedLanguage.code,
      });
    } catch {
      return {
        sessionId,
        status: "service-unavailable",
        answer: assistantMessage(requestedLanguage.code, "serviceUnavailable"),
        citations: [],
        model: null,
        policy,
        evidence: noEvidence(),
      };
    }
    if (!answer.trim()) {
      return {
        sessionId,
        status: "insufficient-evidence",
        answer: assistantMessage(requestedLanguage.code, "unsupportedAnswer"),
        citations: [],
        model: null,
        policy: { ...policy, humanHandoffRequired: true },
        evidence: noEvidence(),
      };
    }
    return {
      sessionId,
      status: "answered",
      answer,
      citations: evidence.map((item) => ({
        evidenceId: item.id,
        sourceId: item.sourceId,
        documentId: item.documentId,
        sourceTitle: item.citation.sourceTitle,
        locator: item.locator,
        effectiveDate: item.citation.effectiveDate,
        reviewedAt: item.citation.reviewedAt,
        validUntil: item.citation.validUntil,
        qualification: item.qualification,
        href: item.citation.href,
        confidence: {
          level: evidenceConfidence(item.score),
          score: Number(item.score.toFixed(3)),
          basis: "retrieval-score",
        },
      })),
      model: dependencies.model ?? ASSISTANT_MODEL,
      policy,
      evidence: {
        confidence: evidenceConfidence(
          Math.min(...evidence.map(({ score }) => score)),
        ),
        citationCount: evidence.length,
        minimumScore: ASSISTANT_MINIMUM_SCORE,
      },
    };
  };
}
