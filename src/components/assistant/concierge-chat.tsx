"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";

import type { AssistantAnswer, AssistantTurn } from "@/lib/assistant-service";
import type { AssistantPreview } from "@/lib/assistant-preview";

import { DynamicPreviewPanel } from "./dynamic-preview-panel";

type ChatMessage = AssistantTurn & {
  id: string;
  citations?: AssistantAnswer["citations"];
};

const suggestions = [
  "What villa configurations are available?",
  "Which amenities are planned for residents?",
  "How well connected is Glitz Pride?",
];

const greeting: ChatMessage = {
  id: "welcome",
  role: "assistant",
  text: "Welcome to Glitz Pride. Ask me about villas, amenities, location, or the community experience.",
};

function messageId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

export function ConciergeChat() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([greeting]);
  const [sessionId, setSessionId] = useState<string>();
  const [preview, setPreview] = useState<AssistantPreview | null>(null);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const launcher = launcherRef.current;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      launcher?.focus();
    };
  }, [open]);

  useEffect(() => {
    const box = messagesRef.current;
    if (box && typeof box.scrollTo === "function") {
      box.scrollTo({ top: box.scrollHeight, behavior: "smooth" });
    }
  }, [messages, loading]);

  function close() {
    if (!loading) setOpen(false);
  }

  function handleDialogKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>(
        "button:not([disabled]), a[href], input:not([disabled])",
      ) ?? [],
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  async function ask(value: string) {
    const trimmed = value.trim();
    if (trimmed.length < 2 || loading) return;

    const userMessage: ChatMessage = {
      id: messageId(),
      role: "user",
      text: trimmed,
    };
    const history = messages
      .filter((message) => message.id !== "welcome")
      .slice(-6)
      .map(({ role, text }) => ({ role, text }));
    setMessages((current) => [...current, userMessage]);
    setQuestion("");
    setPreview(null);
    setMobilePreviewOpen(false);
    setLoading(true);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed, sessionId, history }),
      });
      const result = (await response.json()) as AssistantAnswer & {
        error?: string;
        preview?: AssistantPreview | null;
      };
      if (!response.ok) throw new Error(result.error);
      setSessionId(result.sessionId);
      setPreview(result.preview ?? null);
      setMobilePreviewOpen(Boolean(result.preview));
      setMessages((current) => [
        ...current,
        {
          id: messageId(),
          role: "assistant",
          text: result.answer,
          citations: result.citations,
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: messageId(),
          role: "assistant",
          text: "I could not reach the property knowledge service just now. Please try again shortly or use the contact options on this site.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void ask(question);
  }

  return (
    <>
      <button
        ref={launcherRef}
        className="concierge-launcher"
        type="button"
        aria-label="Open Glitz Pride property guide"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="concierge-dialog"
        onClick={() => setOpen(true)}
      >
        <span className="concierge-launcher__mark" aria-hidden="true">
          GP
        </span>
        <span className="concierge-launcher__label">
          <strong>Ask Glitz</strong>
          <small>Property guide</small>
        </span>
      </button>

      {open ? (
        <div className="concierge-backdrop" onMouseDown={close}>
          <div
            ref={dialogRef}
            id="concierge-dialog"
            className={[
              "concierge-dialog",
              preview ? "concierge-dialog--with-preview" : null,
            ]
              .filter(Boolean)
              .join(" ")}
            role="dialog"
            aria-modal="true"
            aria-labelledby="concierge-title"
            onKeyDown={handleDialogKeyDown}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className="concierge-dialog__header">
              <div>
                <p className="concierge-eyebrow">Glitz Pride</p>
                <h2 id="concierge-title">Property guide</h2>
                <p>Answers grounded in approved project information.</p>
              </div>
              <button
                type="button"
                className="concierge-close"
                onClick={close}
                aria-label="Close property guide"
              >
                ×
              </button>
            </header>

            <div className="concierge-workspace">
              <div className="concierge-conversation">
                <div
                  ref={messagesRef}
                  className="concierge-messages"
                  aria-live="polite"
                >
                  {messages.map((message) => (
                    <article
                      key={message.id}
                      className={`concierge-message concierge-message--${message.role}`}
                    >
                      <p>{message.text}</p>
                      {message.citations?.length ? (
                        <details>
                          <summary>
                            {message.citations.length} approved source
                            {message.citations.length === 1 ? "" : "s"}
                          </summary>
                          <ul>
                            {message.citations.map((citation) => (
                              <li key={citation.evidenceId}>
                                {citation.href ? (
                                  <a
                                    href={citation.href}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    {citation.sourceTitle}
                                  </a>
                                ) : (
                                  citation.sourceTitle
                                )}
                                <span>{citation.locator.label}</span>
                              </li>
                            ))}
                          </ul>
                        </details>
                      ) : null}
                    </article>
                  ))}
                  {messages.length === 1 ? (
                    <div
                      className="concierge-suggestions"
                      aria-label="Suggested questions"
                    >
                      {suggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => void ask(suggestion)}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  ) : null}
                  {loading ? (
                    <p className="concierge-thinking" role="status">
                      Checking approved information
                      <span aria-hidden="true">…</span>
                    </p>
                  ) : null}
                </div>

                {preview ? (
                  <button
                    type="button"
                    className="concierge-mobile-preview-button"
                    onClick={() => setMobilePreviewOpen(true)}
                  >
                    View visual details <span aria-hidden="true">↑</span>
                  </button>
                ) : null}
                <form className="concierge-composer" onSubmit={submit}>
                  <label className="sr-only" htmlFor="concierge-question">
                    Ask a property question
                  </label>
                  <input
                    ref={inputRef}
                    id="concierge-question"
                    value={question}
                    onChange={(event) => setQuestion(event.target.value)}
                    placeholder="Ask about villas, amenities or location"
                    maxLength={500}
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={loading || question.trim().length < 2}
                  >
                    Send <span aria-hidden="true">→</span>
                  </button>
                  <p>
                    Session-only conversation. Avoid sharing personal
                    information.
                  </p>
                </form>
              </div>
              {preview ? (
                <aside
                  className={[
                    "assistant-preview",
                    mobilePreviewOpen ? "assistant-preview--mobile-open" : null,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-label="Visual property details"
                >
                  <button
                    type="button"
                    className="assistant-preview__mobile-close"
                    onClick={() => setMobilePreviewOpen(false)}
                  >
                    Back to conversation <span aria-hidden="true">↓</span>
                  </button>
                  <DynamicPreviewPanel preview={preview} />
                </aside>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
