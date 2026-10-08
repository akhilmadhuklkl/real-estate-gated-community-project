import { NextResponse } from "next/server";

import {
  createEnquiryReference,
  enquirySchema,
  getFieldErrors,
  isLikelyAutomatedSubmission,
} from "@/lib/enquiry";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  const contentLength = Number(request.headers.get("content-length") ?? 0);

  if (origin && host && new URL(origin).host !== host) {
    return NextResponse.json(
      { message: "The request origin could not be verified." },
      { status: 403 },
    );
  }

  if (contentLength > 16_384) {
    return NextResponse.json(
      { message: "The request is larger than the form allows." },
      { status: 413 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "The request could not be read. Please review the form." },
      { status: 400 },
    );
  }

  const result = enquirySchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        message: "Please correct the highlighted fields.",
        fieldErrors: getFieldErrors(result.error),
      },
      { status: 400 },
    );
  }

  if (isLikelyAutomatedSubmission(result.data)) {
    return NextResponse.json(
      { message: "The request could not be accepted. Please try again." },
      { status: 422 },
    );
  }

  return NextResponse.json({
    reference: createEnquiryReference(),
    deliveryState: "preview-only",
  });
}
