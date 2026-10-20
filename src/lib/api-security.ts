import { createHash, randomUUID } from "node:crypto";

export type ApiSecurityPolicy = {
  route: "assistant" | "assistant-transcription" | "enquiry";
  maxBodyBytes: number;
  allowedContentTypes: string[];
  rateLimit: number;
  windowMs: number;
};

export type ApiSecurityContext = {
  requestId: string;
  route: ApiSecurityPolicy["route"];
  clientKey: string;
  headers: Headers;
};

type RateEntry = { count: number; resetAt: number };
const rateEntries = new Map<string, RateEntry>();

export class RequestBodyError extends Error {
  constructor(
    message: string,
    readonly status: 400 | 413 | 415,
  ) {
    super(message);
    this.name = "RequestBodyError";
  }
}

const securityHeaders = {
  "Cache-Control": "no-store, max-age=0",
  "Content-Security-Policy":
    "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Permissions-Policy": "camera=(), geolocation=(), payment=(), usb=()",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
} as const;

const configuredOrigins = () =>
  new Set(
    (process.env.APP_ALLOWED_ORIGINS ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  );

const clientAddress = (request: Request) =>
  request.headers.get("x-real-ip")?.trim() ||
  request.headers.get("x-forwarded-for")?.split(",", 1)[0]?.trim() ||
  "unknown";

const clientHash = (request: Request) =>
  createHash("sha256")
    .update(
      `${process.env.API_RATE_LIMIT_SALT ?? "local-rate-limit"}:${clientAddress(request)}`,
    )
    .digest("hex")
    .slice(0, 24);

const responseHeaders = (context: ApiSecurityContext) => {
  const headers = new Headers(context.headers);
  for (const [name, value] of Object.entries(securityHeaders))
    headers.set(name, value);
  headers.set("X-Request-ID", context.requestId);
  return headers;
};

export const secureJson = (
  context: ApiSecurityContext,
  body: unknown,
  init: { status?: number; headers?: HeadersInit } = {},
) => {
  const headers = responseHeaders(context);
  if (init.headers) {
    for (const [name, value] of new Headers(init.headers))
      headers.set(name, value);
  }
  headers.set("Content-Type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers,
  });
};

const rejected = (
  requestId: string,
  route: ApiSecurityPolicy["route"],
  clientKey: string,
  status: number,
  error: string,
  headers: Headers,
) => {
  const context = {
    requestId,
    route,
    clientKey,
    headers,
  } satisfies ApiSecurityContext;
  return {
    ok: false as const,
    response: secureJson(context, { error, requestId }, { status }),
  };
};

export const enforceApiSecurity = (
  request: Request,
  policy: ApiSecurityPolicy,
  now = Date.now(),
) => {
  const requestId = randomUUID();
  const clientKey = `${policy.route}:${clientHash(request)}`;
  const headers = new Headers();
  const contentLength = request.headers.get("content-length");
  const parsedLength = contentLength === null ? null : Number(contentLength);

  if (
    parsedLength !== null &&
    (!Number.isFinite(parsedLength) || parsedLength < 0)
  ) {
    return rejected(
      requestId,
      policy.route,
      clientKey,
      400,
      "The request size is invalid.",
      headers,
    );
  }
  if (parsedLength !== null && parsedLength > policy.maxBodyBytes) {
    return rejected(
      requestId,
      policy.route,
      clientKey,
      413,
      "The request is larger than this service allows.",
      headers,
    );
  }

  const contentType = request.headers
    .get("content-type")
    ?.split(";", 1)[0]
    ?.trim()
    .toLowerCase();
  if (!contentType || !policy.allowedContentTypes.includes(contentType)) {
    return rejected(
      requestId,
      policy.route,
      clientKey,
      415,
      "The request content type is not supported.",
      headers,
    );
  }

  const fetchSite = request.headers.get("sec-fetch-site");
  const origin = request.headers.get("origin");
  const host =
    request.headers.get("host") || request.headers.get("x-forwarded-host");
  let originAllowed = fetchSite !== "cross-site";
  if (origin) {
    try {
      const parsedOrigin = new URL(origin);
      originAllowed =
        originAllowed &&
        (parsedOrigin.host === host ||
          configuredOrigins().has(parsedOrigin.origin));
    } catch {
      originAllowed = false;
    }
  }
  if (!originAllowed) {
    return rejected(
      requestId,
      policy.route,
      clientKey,
      403,
      "The request origin could not be verified.",
      headers,
    );
  }

  for (const [key, entry] of rateEntries) {
    if (entry.resetAt <= now) rateEntries.delete(key);
  }
  const entry = rateEntries.get(clientKey);
  const current =
    !entry || entry.resetAt <= now
      ? { count: 0, resetAt: now + policy.windowMs }
      : entry;
  current.count += 1;
  rateEntries.set(clientKey, current);
  const remaining = Math.max(0, policy.rateLimit - current.count);
  headers.set("RateLimit-Limit", String(policy.rateLimit));
  headers.set("RateLimit-Remaining", String(remaining));
  headers.set("RateLimit-Reset", String(Math.ceil(current.resetAt / 1000)));
  if (current.count > policy.rateLimit) {
    headers.set(
      "Retry-After",
      String(Math.max(1, Math.ceil((current.resetAt - now) / 1000))),
    );
    recordSecurityEvent(
      { requestId, route: policy.route, clientKey },
      "rate-limit-exceeded",
    );
    return rejected(
      requestId,
      policy.route,
      clientKey,
      429,
      "Too many requests. Please try again later.",
      headers,
    );
  }

  return {
    ok: true as const,
    context: {
      requestId,
      route: policy.route,
      clientKey,
      headers,
    } satisfies ApiSecurityContext,
  };
};

const readLimitedBytes = async (request: Request, maximum: number) => {
  if (!request.body) return new Uint8Array();
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maximum) {
      await reader.cancel().catch(() => undefined);
      throw new RequestBodyError(
        "The request is larger than this service allows.",
        413,
      );
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
};

export const readLimitedJson = async (request: Request, maximum: number) => {
  const bytes = await readLimitedBytes(request, maximum);
  try {
    return JSON.parse(
      new TextDecoder("utf-8", { fatal: true }).decode(bytes),
    ) as unknown;
  } catch {
    throw new RequestBodyError("The JSON request could not be read.", 400);
  }
};

export const readLimitedFormData = async (
  request: Request,
  maximum: number,
) => {
  const bytes = await readLimitedBytes(request, maximum);
  const clone = new Request(request.url, {
    method: "POST",
    headers: request.headers,
    body: new Blob([bytes]),
  });
  try {
    return await clone.formData();
  } catch {
    throw new RequestBodyError(
      "The uploaded recording could not be read.",
      400,
    );
  }
};

export const bodyErrorResponse = (
  context: ApiSecurityContext,
  error: unknown,
) => {
  if (error instanceof RequestBodyError) {
    return secureJson(
      context,
      { error: error.message, requestId: context.requestId },
      { status: error.status },
    );
  }
  return secureJson(
    context,
    { error: "The request could not be read.", requestId: context.requestId },
    { status: 400 },
  );
};

export const recordSecurityEvent = (
  context: Pick<ApiSecurityContext, "requestId" | "route" | "clientKey">,
  event: string,
  error?: unknown,
) => {
  console.warn(
    JSON.stringify({
      type: "security-event",
      event,
      route: context.route,
      requestId: context.requestId,
      client: context.clientKey.slice(-12),
      errorType:
        error instanceof Error ? error.name : error ? "unknown" : undefined,
    }),
  );
};

export const resetApiSecurityStateForTests = () => rateEntries.clear();

export const assistantApiPolicy: ApiSecurityPolicy = {
  route: "assistant",
  maxBodyBytes: 16_384,
  allowedContentTypes: ["application/json"],
  rateLimit: 12,
  windowMs: 60_000,
};

export const transcriptionApiPolicy: ApiSecurityPolicy = {
  route: "assistant-transcription",
  maxBodyBytes: 4_500_000,
  allowedContentTypes: ["multipart/form-data"],
  rateLimit: 6,
  windowMs: 60_000,
};

export const enquiryApiPolicy: ApiSecurityPolicy = {
  route: "enquiry",
  maxBodyBytes: 16_384,
  allowedContentTypes: ["application/json"],
  rateLimit: 5,
  windowMs: 600_000,
};
