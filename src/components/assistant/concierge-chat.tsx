"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";

import type { AssistantAnswer, AssistantTurn } from "@/lib/assistant-service";
import {
  assistantLanguageOptions,
  type AssistantLanguage,
} from "../../lib/assistant-language";
import type { AssistantPreview } from "@/lib/assistant-preview";
import { MAX_VOICE_RECORDING_SECONDS } from "../../lib/voice-interaction";

import { DynamicPreviewPanel } from "./dynamic-preview-panel";

type ChatMessage = AssistantTurn & {
  id: string;
  citations?: AssistantAnswer["citations"];
  feedbackContext?: {
    language: AssistantLanguage;
    answerStatus: AssistantAnswer["status"];
    riskTier: AssistantAnswer["policy"]["riskTier"];
    previewKind: AssistantPreview["kind"] | "none";
  };
};

type FeedbackState = "idle" | "submitting" | "submitted" | "error";

type VoiceState =
  "idle" | "requesting" | "recording" | "transcribing" | "review" | "error";

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
  const [language, setLanguage] = useState<AssistantLanguage>("en");
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [voiceSeconds, setVoiceSeconds] = useState(0);
  const [voiceError, setVoiceError] = useState("");
  const [speakingMessageId, setSpeakingMessageId] = useState<string>();
  const [feedbackByMessage, setFeedbackByMessage] = useState<
    Record<string, FeedbackState>
  >({});
  const launcherRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const voiceChunksRef = useRef<Blob[]>([]);
  const voiceIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const voiceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelRecordingRef = useRef(false);

  function clearVoiceTimers() {
    if (voiceIntervalRef.current) clearInterval(voiceIntervalRef.current);
    if (voiceTimeoutRef.current) clearTimeout(voiceTimeoutRef.current);
    voiceIntervalRef.current = null;
    voiceTimeoutRef.current = null;
  }

  function releaseMicrophone() {
    clearVoiceTimers();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    recorderRef.current = null;
  }

  function stopSpokenAnswer() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMessageId(undefined);
  }

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

  useEffect(
    () => () => {
      cancelRecordingRef.current = true;
      if (recorderRef.current?.state === "recording") {
        recorderRef.current.stop();
      }
      if (voiceIntervalRef.current) clearInterval(voiceIntervalRef.current);
      if (voiceTimeoutRef.current) clearTimeout(voiceTimeoutRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    },
    [],
  );

  function close() {
    if (
      loading ||
      voiceState === "requesting" ||
      voiceState === "transcribing"
    ) {
      return;
    }
    if (recorderRef.current?.state === "recording") {
      cancelRecordingRef.current = true;
      recorderRef.current.stop();
    }
    stopSpokenAnswer();
    setOpen(false);
  }

  async function transcribeRecording(blob: Blob) {
    setVoiceState("transcribing");
    setVoiceError("");
    try {
      const form = new FormData();
      const extension = blob.type.includes("ogg")
        ? "ogg"
        : blob.type.includes("mp4")
          ? "m4a"
          : "webm";
      form.set(
        "audio",
        new File([blob], `voice-question.${extension}`, { type: blob.type }),
      );
      form.set("language", language);
      const response = await fetch("/api/assistant/transcribe", {
        method: "POST",
        body: form,
      });
      const result = (await response.json()) as {
        transcript?: string;
        error?: string;
      };
      if (!response.ok || !result.transcript) {
        throw new Error(
          result.error || "The recording could not be transcribed.",
        );
      }
      setQuestion(result.transcript);
      setVoiceState("review");
      requestAnimationFrame(() => inputRef.current?.focus());
    } catch (error) {
      setVoiceError(
        error instanceof Error
          ? error.message
          : "The recording could not be transcribed. Please type your question.",
      );
      setVoiceState("error");
    }
  }

  async function startVoiceInput() {
    if (
      loading ||
      voiceState === "requesting" ||
      voiceState === "transcribing"
    ) {
      return;
    }
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      setVoiceError(
        "Voice input is not supported in this browser. You can still type your question.",
      );
      setVoiceState("error");
      return;
    }

    setVoiceState("requesting");
    setVoiceError("");
    setVoiceSeconds(0);
    cancelRecordingRef.current = false;
    stopSpokenAnswer();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
        video: false,
      });
      streamRef.current = stream;
      const preferredTypes = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/ogg;codecs=opus",
        "audio/mp4",
      ];
      const mimeType = preferredTypes.find((type) =>
        MediaRecorder.isTypeSupported(type),
      );
      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined,
      );
      recorderRef.current = recorder;
      voiceChunksRef.current = [];
      recorder.addEventListener("dataavailable", (event) => {
        if (event.data.size) voiceChunksRef.current.push(event.data);
      });
      recorder.addEventListener("stop", () => {
        const cancelled = cancelRecordingRef.current;
        const chunks = voiceChunksRef.current;
        const recordedType =
          recorder.mimeType || chunks[0]?.type || "audio/webm";
        releaseMicrophone();
        voiceChunksRef.current = [];
        if (cancelled) {
          setVoiceState("idle");
          setVoiceSeconds(0);
          return;
        }
        void transcribeRecording(new Blob(chunks, { type: recordedType }));
      });
      recorder.start(500);
      setVoiceState("recording");
      voiceIntervalRef.current = setInterval(
        () => setVoiceSeconds((seconds) => seconds + 1),
        1000,
      );
      voiceTimeoutRef.current = setTimeout(
        () => recorder.state === "recording" && recorder.stop(),
        MAX_VOICE_RECORDING_SECONDS * 1000,
      );
    } catch (error) {
      releaseMicrophone();
      setVoiceError(
        error instanceof DOMException && error.name === "NotAllowedError"
          ? "Microphone permission was not granted. Allow access or type your question."
          : "The microphone could not be started. Please type your question.",
      );
      setVoiceState("error");
    }
  }

  function finishVoiceInput() {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }
  }

  function cancelVoiceInput() {
    cancelRecordingRef.current = true;
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    } else {
      releaseMicrophone();
      setVoiceState("idle");
    }
    setVoiceSeconds(0);
    setVoiceError("");
  }

  function toggleSpokenAnswer(message: ChatMessage) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (speakingMessageId === message.id) {
      stopSpokenAnswer();
      return;
    }
    stopSpokenAnswer();
    const utterance = new SpeechSynthesisUtterance(message.text);
    utterance.lang = selectedLanguage
      ? {
          en: "en-IN",
          ml: "ml-IN",
          hi: "hi-IN",
          ar: "ar-SA",
          te: "te-IN",
          ta: "ta-IN",
          kn: "kn-IN",
        }[selectedLanguage.code]
      : "en-IN";
    utterance.rate = 0.95;
    utterance.onend = () => setSpeakingMessageId(undefined);
    utterance.onerror = () => setSpeakingMessageId(undefined);
    setSpeakingMessageId(message.id);
    window.speechSynthesis.speak(utterance);
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
        "button:not([disabled]), a[href], input:not([disabled]), select:not([disabled])",
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
    setVoiceState("idle");
    setVoiceError("");
    setPreview(null);
    setMobilePreviewOpen(false);
    setLoading(true);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: trimmed,
          sessionId,
          history,
          language,
        }),
      });
      const result = (await response.json()) as AssistantAnswer & {
        error?: string;
        preview?: AssistantPreview | null;
      };
      if (!response.ok) throw new Error(result.error);
      setSessionId(result.sessionId);
      setPreview(result.preview ?? null);
      setMobilePreviewOpen(Boolean(result.preview));
      const assistantMessageId = messageId();
      setMessages((current) => [
        ...current,
        {
          id: assistantMessageId,
          role: "assistant",
          text: result.answer,
          citations: result.citations,
          feedbackContext: {
            language,
            answerStatus: result.status,
            riskTier: result.policy.riskTier,
            previewKind: result.preview?.kind ?? "none",
          },
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

  async function sendFeedback(
    message: ChatMessage,
    rating: "helpful" | "needs-improvement",
  ) {
    if (!message.feedbackContext) return;
    setFeedbackByMessage((current) => ({
      ...current,
      [message.id]: "submitting",
    }));
    try {
      const response = await fetch("/api/assistant/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, ...message.feedbackContext }),
      });
      if (!response.ok) throw new Error("Feedback was not accepted.");
      setFeedbackByMessage((current) => ({
        ...current,
        [message.id]: "submitted",
      }));
    } catch {
      setFeedbackByMessage((current) => ({
        ...current,
        [message.id]: "error",
      }));
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void ask(question);
  }

  const selectedLanguage =
    assistantLanguageOptions.find(({ code }) => code === language) ??
    assistantLanguageOptions[0];

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
            dir={
              selectedLanguage.approvalState === "approved"
                ? selectedLanguage.direction
                : "ltr"
            }
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
              <div className="concierge-dialog__controls">
                <label>
                  <span>Language</span>
                  <select
                    value={language}
                    onChange={(event) =>
                      setLanguage(event.target.value as AssistantLanguage)
                    }
                    disabled={loading}
                  >
                    {assistantLanguageOptions.map((option) => (
                      <option key={option.code} value={option.code}>
                        {option.nativeLabel}
                        {option.approvalState === "pending"
                          ? " — awaiting approval"
                          : ""}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  className="concierge-close"
                  onClick={close}
                  aria-label="Close property guide"
                >
                  ×
                </button>
              </div>
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
                      {message.role === "assistant" &&
                      message.id !== "welcome" ? (
                        <button
                          type="button"
                          className="concierge-speak"
                          onClick={() => toggleSpokenAnswer(message)}
                          aria-pressed={speakingMessageId === message.id}
                        >
                          <span aria-hidden="true">
                            {speakingMessageId === message.id ? "■" : "◖))"}
                          </span>{" "}
                          {speakingMessageId === message.id
                            ? "Stop spoken answer"
                            : "Listen to answer"}
                        </button>
                      ) : null}
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
                      {message.feedbackContext ? (
                        <div
                          className="concierge-feedback"
                          aria-label="Was this answer helpful?"
                        >
                          {feedbackByMessage[message.id] === "submitted" ? (
                            <p role="status">Thank you for the feedback.</p>
                          ) : (
                            <>
                              <span>Was this helpful?</span>
                              <button
                                type="button"
                                onClick={() =>
                                  void sendFeedback(message, "helpful")
                                }
                                disabled={
                                  feedbackByMessage[message.id] === "submitting"
                                }
                              >
                                Helpful
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  void sendFeedback(
                                    message,
                                    "needs-improvement",
                                  )
                                }
                                disabled={
                                  feedbackByMessage[message.id] === "submitting"
                                }
                              >
                                Needs improvement
                              </button>
                              {feedbackByMessage[message.id] === "error" ? (
                                <p role="status">
                                  Feedback could not be recorded. You can try
                                  again.
                                </p>
                              ) : null}
                            </>
                          )}
                        </div>
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
                    onChange={(event) => {
                      setQuestion(event.target.value);
                      if (voiceState === "review") setVoiceState("idle");
                    }}
                    placeholder="Ask about villas, amenities or location"
                    maxLength={500}
                    disabled={loading || voiceState === "transcribing"}
                  />
                  <button
                    type="button"
                    className="concierge-voice-button"
                    onClick={
                      voiceState === "recording"
                        ? finishVoiceInput
                        : () => void startVoiceInput()
                    }
                    disabled={
                      loading ||
                      voiceState === "requesting" ||
                      voiceState === "transcribing"
                    }
                    aria-pressed={voiceState === "recording"}
                    aria-label={
                      voiceState === "recording"
                        ? "Stop voice recording"
                        : "Start voice input"
                    }
                  >
                    <span aria-hidden="true">
                      {voiceState === "recording" ? "■" : "●"}
                    </span>
                    <span className="sr-only">
                      {voiceState === "recording" ? "Stop" : "Voice"}
                    </span>
                  </button>
                  <button
                    type="submit"
                    disabled={loading || question.trim().length < 2}
                  >
                    Send <span aria-hidden="true">→</span>
                  </button>
                  <div className="concierge-voice-status" aria-live="polite">
                    {voiceState === "requesting" ? (
                      <p>Waiting for microphone permission…</p>
                    ) : null}
                    {voiceState === "recording" ? (
                      <p>
                        Listening {voiceSeconds}s /{" "}
                        {MAX_VOICE_RECORDING_SECONDS}s. Press stop when
                        finished.{" "}
                        <button type="button" onClick={cancelVoiceInput}>
                          Cancel recording
                        </button>
                      </p>
                    ) : null}
                    {voiceState === "transcribing" ? (
                      <p>Creating an editable transcript…</p>
                    ) : null}
                    {voiceState === "review" ? (
                      <p>
                        Review and edit the transcript, then choose Send. Audio
                        was removed after transcription.
                      </p>
                    ) : null}
                    {voiceState === "error" && voiceError ? (
                      <p role="alert">{voiceError}</p>
                    ) : null}
                    {voiceState === "idle" ? (
                      <p>
                        Voice is optional and starts only when selected. Avoid
                        sharing personal information.
                      </p>
                    ) : null}
                  </div>
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
