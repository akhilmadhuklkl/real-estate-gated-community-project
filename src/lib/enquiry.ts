import { z } from "zod";

import { handoffRouteSchema } from "./human-handoff";

export const enquiryIntentValues = ["general-enquiry", "site-visit"] as const;

const optionalText = (maximum: number) =>
  z
    .string()
    .trim()
    .max(maximum)
    .optional()
    .transform((value) => value || undefined);

export const enquirySchema = z
  .object({
    intent: z.enum(enquiryIntentValues),
    fullName: z.string().trim().min(2).max(80),
    email: optionalText(120).pipe(z.email().optional()),
    phone: optionalText(24).refine(
      (value) => !value || /^[+\d][\d\s()-]{6,23}$/.test(value),
      "Enter a valid phone number.",
    ),
    preferredDate: optionalText(10).refine(
      (value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value),
      "Choose a valid date.",
    ),
    timeWindow: z.enum(["morning", "afternoon", "any-time"]).optional(),
    handoffRoute: handoffRouteSchema.optional(),
    villaInterest: optionalText(100),
    message: optionalText(1000),
    consent: z.boolean().refine((value) => value, {
      message: "Confirm consent before preparing the request.",
    }),
    sourcePath: z.string().trim().max(200).default("/contact"),
    website: z.string().max(0).default(""),
    startedAt: z.number().int().positive(),
  })
  .superRefine((value, context) => {
    if (!value.email && !value.phone) {
      const message = "Provide an email address or phone number.";
      context.addIssue({ code: "custom", path: ["email"], message });
      context.addIssue({ code: "custom", path: ["phone"], message });
    }

    if (value.intent === "site-visit" && !value.preferredDate) {
      context.addIssue({
        code: "custom",
        path: ["preferredDate"],
        message: "Choose a preferred visit date.",
      });
    }
  });

export type EnquiryInput = z.infer<typeof enquirySchema>;

export function getFieldErrors(error: z.ZodError<EnquiryInput>) {
  const errors: Record<string, string> = {};

  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === "string" && !errors[field]) {
      errors[field] = issue.message;
    }
  }

  return errors;
}

export function isLikelyAutomatedSubmission(
  input: Pick<EnquiryInput, "website" | "startedAt">,
  now = Date.now(),
) {
  return input.website.length > 0 || now - input.startedAt < 3_000;
}

export function createEnquiryReference(
  now = new Date(),
  random = crypto.randomUUID(),
) {
  const date = now.toISOString().slice(0, 10).replaceAll("-", "");
  return `GP-${date}-${random.slice(0, 8).toUpperCase()}`;
}
