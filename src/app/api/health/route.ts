import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function GET() {
  return NextResponse.json(
    {
      status: "ok",
      service: "glitz-pride-web",
      phase: "phase-1-mvp",
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
