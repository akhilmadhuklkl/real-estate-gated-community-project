import { z } from "zod";

import {
  assistantFeedbackRatingValues,
  recordFeedbackObservation,
} from "@/lib/ai-observability";
import { assistantLanguageSchema } from "@/lib/assistant-language";
import {
  assistantFeedbackApiPolicy,
  bodyErrorResponse,
  enforceApiSecurity,
  readLimitedJson,
  secureJson,
} from "@/lib/api-security";

export const runtime = "nodejs";

const feedbackSchema = z
  .object({
    rating: z.enum(assistantFeedbackRatingValues),
    language: assistantLanguageSchema,
    answerStatus: z.enum([
      "answered",
      "blocked",
      "human-confirmation-required",
      "insufficient-evidence",
      "service-unavailable",
    ]),
    riskTier: z.enum(["R0", "R1", "R2", "R3", "R4"]),
    previewKind: z.enum([
      "none",
      "villa",
      "floor-plan",
      "gallery",
      "map",
      "comparison",
      "contact",
      "document",
      "recommendation",
      "enquiry-summary",
    ]),
  })
  .strict();

export async function POST(request: Request) {
  const security = enforceApiSecurity(request, assistantFeedbackApiPolicy);
  if (!security.ok) return security.response;
  const { context } = security;

  let body: unknown;
  try {
    body = await readLimitedJson(
      request,
      assistantFeedbackApiPolicy.maxBodyBytes,
    );
  } catch (error) {
    return bodyErrorResponse(context, error);
  }
  const parsed = feedbackSchema.safeParse(body);
  if (!parsed.success) {
    return secureJson(
      context,
      { error: "The feedback could not be accepted." },
      { status: 400 },
    );
  }

  recordFeedbackObservation(parsed.data);
  return secureJson(context, { accepted: true });
}
