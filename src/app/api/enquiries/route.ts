import {
  createEnquiryReference,
  enquirySchema,
  getFieldErrors,
  isLikelyAutomatedSubmission,
} from "@/lib/enquiry";
import {
  bodyErrorResponse,
  enforceApiSecurity,
  enquiryApiPolicy,
  readLimitedJson,
  recordSecurityEvent,
  secureJson,
} from "@/lib/api-security";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const security = enforceApiSecurity(request, enquiryApiPolicy);
  if (!security.ok) return security.response;
  const { context } = security;
  let body: unknown;

  try {
    body = await readLimitedJson(request, enquiryApiPolicy.maxBodyBytes);
  } catch (error) {
    return bodyErrorResponse(context, error);
  }

  const result = enquirySchema.safeParse(body);

  if (!result.success) {
    return secureJson(
      context,
      {
        message: "Please correct the highlighted fields.",
        fieldErrors: getFieldErrors(result.error),
        requestId: context.requestId,
      },
      { status: 400 },
    );
  }

  if (isLikelyAutomatedSubmission(result.data)) {
    recordSecurityEvent(context, "automated-enquiry-blocked");
    return secureJson(
      context,
      {
        message: "The request could not be accepted. Please try again.",
        requestId: context.requestId,
      },
      { status: 422 },
    );
  }

  return secureJson(context, {
    reference: createEnquiryReference(),
    deliveryState: "preview-only",
  });
}
