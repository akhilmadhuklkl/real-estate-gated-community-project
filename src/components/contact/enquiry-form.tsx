"use client";

import Link from "next/link";
import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  LEAD_DRAFT_STORAGE_KEY,
  leadDraftSchema,
  type LeadDraft,
} from "../../lib/lead-qualification";

type Intent = "general-enquiry" | "site-visit";
type FieldErrors = Record<string, string>;

type SubmissionState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "error"; message: string; fieldErrors: FieldErrors }
  | { status: "success"; reference: string };

const intentLabels: Record<Intent, string> = {
  "general-enquiry": "Ask a question",
  "site-visit": "Plan a site visit",
};

export function EnquiryForm() {
  const [intent, setIntent] = useState<Intent>("general-enquiry");
  const [assistantDraft, setAssistantDraft] = useState<LeadDraft | null>(null);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [submission, setSubmission] = useState<SubmissionState>({
    status: "idle",
  });
  const summaryRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (submission.status === "error" || submission.status === "success") {
      summaryRef.current?.focus();
    }
  }, [submission]);

  useEffect(() => {
    const stored = sessionStorage.getItem(LEAD_DRAFT_STORAGE_KEY);
    if (!stored) return;
    let active = true;
    try {
      const parsed = leadDraftSchema.safeParse(JSON.parse(stored));
      if (!parsed.success) {
        sessionStorage.removeItem(LEAD_DRAFT_STORAGE_KEY);
        return;
      }
      queueMicrotask(() => {
        if (!active) return;
        setAssistantDraft(parsed.data);
        setIntent(parsed.data.intent);
        sessionStorage.removeItem(LEAD_DRAFT_STORAGE_KEY);
      });
    } catch {
      sessionStorage.removeItem(LEAD_DRAFT_STORAGE_KEY);
      // Ignore malformed browser-session drafts and leave the form empty.
    }
    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmission({ status: "submitting" });

    const form = new FormData(event.currentTarget);
    const readText = (name: string) => {
      const value = form.get(name);
      return typeof value === "string" ? value : "";
    };
    const payload = {
      intent,
      fullName: readText("fullName"),
      email: readText("email"),
      phone: readText("phone"),
      preferredDate: readText("preferredDate"),
      timeWindow: readText("timeWindow") || undefined,
      handoffRoute: readText("handoffRoute") || undefined,
      villaInterest: readText("villaInterest"),
      message: readText("message"),
      consent: form.get("consent") === "on",
      sourcePath: "/contact",
      website: readText("website"),
      startedAt,
    };

    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as {
        message?: string;
        fieldErrors?: FieldErrors;
        reference?: string;
      };

      if (!response.ok || !result.reference) {
        setSubmission({
          status: "error",
          message: result.message ?? "The request could not be accepted.",
          fieldErrors: result.fieldErrors ?? {},
        });
        return;
      }

      formRef.current?.reset();
      setStartedAt(Date.now());
      setSubmission({ status: "success", reference: result.reference });
    } catch {
      setSubmission({
        status: "error",
        message:
          "The form service is temporarily unavailable. Your details were not submitted.",
        fieldErrors: {},
      });
    }
  }

  const fieldErrors =
    submission.status === "error" ? submission.fieldErrors : {};

  return (
    <div className="enquiry-form-shell" id="schedule-visit">
      <div className="enquiry-form-shell__heading">
        <p className="eyebrow">Request details</p>
        <h2>Start with what matters to you.</h2>
        <p>
          Choose an enquiry or propose a visit. Required fields are marked with
          an asterisk.
        </p>
      </div>

      {submission.status === "error" ? (
        <div
          className="form-alert form-alert--error"
          role="alert"
          tabIndex={-1}
          ref={summaryRef}
        >
          <strong>Please review your request</strong>
          <p>{submission.message}</p>
          {Object.keys(fieldErrors).length > 0 ? (
            <ul>
              {Object.entries(fieldErrors).map(([field, message]) => (
                <li key={field}>
                  <a href={`#${field}`}>{message}</a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {submission.status === "success" ? (
        <div
          className="form-alert form-alert--success"
          role="status"
          tabIndex={-1}
          ref={summaryRef}
        >
          <strong>Your preview request is ready</strong>
          <p>
            Reference <b>{submission.reference}</b>. This private preview
            validates the flow but does not store or forward your details.
          </p>
        </div>
      ) : null}

      {assistantDraft ? (
        <div className="form-alert" role="status">
          <strong>Handoff route: {assistantDraft.handoffRoute}</strong>
          <p>
            Your reviewed assistant summary has been added below. Check every
            field before giving consent. Working hours and response times are
            not confirmed.
          </p>
        </div>
      ) : null}

      <form
        key={assistantDraft ? JSON.stringify(assistantDraft) : "empty"}
        ref={formRef}
        onSubmit={handleSubmit}
        noValidate
      >
        <input
          type="hidden"
          name="handoffRoute"
          value={assistantDraft?.handoffRoute ?? ""}
        />
        <fieldset className="intent-options">
          <legend>How can we help?</legend>
          {(Object.keys(intentLabels) as Intent[]).map((value) => (
            <label key={value}>
              <input
                type="radio"
                name="intent"
                value={value}
                checked={intent === value}
                onChange={() => {
                  setIntent(value);
                  setSubmission({ status: "idle" });
                }}
              />
              <span>{intentLabels[value]}</span>
            </label>
          ))}
        </fieldset>

        <div className="form-grid">
          <Field
            id="fullName"
            label="Full name"
            required
            error={fieldErrors.fullName}
          >
            <input
              id="fullName"
              name="fullName"
              autoComplete="name"
              aria-invalid={Boolean(fieldErrors.fullName)}
              aria-describedby={
                fieldErrors.fullName ? "fullName-error" : undefined
              }
            />
          </Field>
          <Field id="email" label="Email address" error={fieldErrors.email}>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={
                fieldErrors.email ? "email-error" : "reply-help"
              }
            />
          </Field>
          <Field id="phone" label="Phone number" error={fieldErrors.phone}>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              aria-invalid={Boolean(fieldErrors.phone)}
              aria-describedby={
                fieldErrors.phone ? "phone-error" : "reply-help"
              }
            />
          </Field>
          <p className="field-help form-grid__wide" id="reply-help">
            Provide at least one reply channel. No details are retained in this
            preview.
          </p>

          {intent === "site-visit" ? (
            <>
              <Field
                id="preferredDate"
                label="Preferred visit date"
                required
                error={fieldErrors.preferredDate}
              >
                <input
                  id="preferredDate"
                  name="preferredDate"
                  type="date"
                  defaultValue={assistantDraft?.preferredDate}
                  aria-invalid={Boolean(fieldErrors.preferredDate)}
                  aria-describedby={
                    fieldErrors.preferredDate
                      ? "preferredDate-error"
                      : "visit-help"
                  }
                />
              </Field>
              <Field id="timeWindow" label="Preferred time">
                <select
                  id="timeWindow"
                  name="timeWindow"
                  defaultValue={assistantDraft?.timeWindow ?? "any-time"}
                >
                  <option value="any-time">Any time</option>
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                </select>
              </Field>
              <p className="field-help form-grid__wide" id="visit-help">
                Date and time are preferences only. Visiting hours and
                confirmation ownership are awaiting approval.
              </p>
            </>
          ) : null}

          <Field id="villaInterest" label="Villa interest" optional>
            <select
              id="villaInterest"
              name="villaInterest"
              defaultValue={assistantDraft?.villaInterest ?? ""}
            >
              <option value="">No specific villa selected</option>
              <option value="Brochure villa plan">Brochure villa plan</option>
            </select>
          </Field>
          <Field
            id="message"
            label={intent === "site-visit" ? "Visit notes" : "Your question"}
            optional
            className="form-grid__wide"
            error={fieldErrors.message}
          >
            <textarea
              id="message"
              name="message"
              rows={5}
              maxLength={1000}
              defaultValue={assistantDraft?.message}
              aria-invalid={Boolean(fieldErrors.message)}
              aria-describedby={
                fieldErrors.message ? "message-error" : undefined
              }
            />
          </Field>
        </div>

        <div className="honeypot" aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input id="website" name="website" tabIndex={-1} autoComplete="off" />
        </div>

        <label className="consent-control" htmlFor="consent">
          <input
            id="consent"
            name="consent"
            type="checkbox"
            aria-invalid={Boolean(fieldErrors.consent)}
            aria-describedby={fieldErrors.consent ? "consent-error" : undefined}
          />
          <span>
            I agree to prepare these details for this request and have read the{" "}
            <Link href="/privacy">preview privacy information</Link>. This
            preview does not send a message. <span aria-hidden="true">*</span>
          </span>
        </label>
        {fieldErrors.consent ? (
          <p className="field-error" id="consent-error">
            {fieldErrors.consent}
          </p>
        ) : null}

        <button
          className="action-link enquiry-submit"
          type="submit"
          disabled={submission.status === "submitting"}
        >
          <span>
            {submission.status === "submitting"
              ? "Checking request…"
              : intent === "site-visit"
                ? "Prepare visit request"
                : "Prepare enquiry"}
          </span>
          <span className="action-link__arrow" aria-hidden="true">
            →
          </span>
        </button>
      </form>
    </div>
  );
}

function Field({
  id,
  label,
  required = false,
  optional = false,
  error,
  className = "",
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`form-field ${className}`}>
      <label htmlFor={id}>
        <span>
          {label} {required ? <span aria-hidden="true">*</span> : null}
        </span>
        {optional ? <small>Optional</small> : null}
      </label>
      {children}
      {error ? (
        <p className="field-error" id={`${id}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
