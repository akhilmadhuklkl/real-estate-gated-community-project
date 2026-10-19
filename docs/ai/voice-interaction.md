# Voice interaction

T0043 adds optional push-to-talk input and spoken-answer playback to the governed property assistant. Voice is an input and presentation layer only. The existing retrieval, policy, citation, multilingual, recommendation, and preview services remain authoritative.

## Supported experience

- Visitors explicitly start and stop each recording.
- Recordings are limited to 30 seconds and 4 MB.
- English, Malayalam, Hindi, Arabic, Telugu, Tamil, and Kannada use reviewed locale mappings.
- The transcription is placed in the existing question field for review and editing.
- A transcript is never submitted automatically.
- Assistant answers always remain visible as text. Spoken playback is optional and can be stopped immediately.
- Text input remains available when recording, transcription, or speech playback is unsupported.

## Processing path

1. The browser requests microphone permission only after the visitor chooses voice input.
2. `MediaRecorder` captures a short audio blob using a supported browser format.
3. The browser sends multipart form data to `/api/assistant/transcribe` with the selected language.
4. The server validates the language, format, size, and credential configuration.
5. The server uploads the recording to the transcription provider and requests a smart transcript with project vocabulary.
6. The provider file is deleted in a `finally` block after success or failure.
7. The transcript is returned with `Cache-Control: no-store` and displayed for visitor review.
8. Only the visitor-confirmed text enters `/api/assistant` and the governed answer pipeline.

## Privacy and safety controls

- No always-on or background recording.
- No automatic assistant submission.
- No provider credential in browser code.
- No application database or filesystem audio storage.
- Provider audio deletion is attempted after every transcription outcome.
- Microphone tracks stop after completion, cancellation, dialog closure, or component removal.
- Recording state, elapsed time, cancellation, processing, review, and failure are visibly announced.
- The interface reminds visitors not to share personal information.
- The existing personal-data and policy guards inspect the confirmed transcript before answering.

The application does not claim zero processing time or device-wide deletion. Audio exists transiently in browser memory and at the transcription provider while the request is processed. Provider deletion is requested immediately afterward.

## Spoken answers

The visible answer is the canonical response. The browser Speech Synthesis API provides optional playback using the selected language locale. Voice availability and quality depend on the visitor's operating system and installed voices. Citations, qualifications, controls, and visual previews remain on screen and are not replaced by audio.

## Failure behavior

Permission denial, unsupported browsers, empty audio, excessive size, unclear speech, provider errors, and unavailable voices preserve the text workflow. Errors do not submit partial transcripts or silently retry microphone access.
