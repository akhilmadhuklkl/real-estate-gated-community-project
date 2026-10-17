# Multilingual assistant support

## Current release state

English is the only approved reference language for project facts. Malayalam,
Hindi, and Arabic are visible as planned languages, but the assistant fails
closed for them until owner-approved, human-reviewed translations exist.

This avoids presenting machine-generated translations as authoritative property
information. When a pending language is selected or detected, the assistant
does not retrieve evidence or call the model. It explains that the translation
is awaiting approval and directs the visitor to the approved English reference.

## Implemented foundation

- Explicit language selection for English, Malayalam, Hindi, and Arabic.
- Script and language-name detection for typed questions.
- Language carried through the API and retrieval contracts.
- Evidence filtering by language; legacy knowledge records are treated as English.
- Right-to-left metadata for Arabic and responsive language controls.
- A dedicated `translation-not-approved` policy outcome with human handoff.
- Automated tests for detection, filtering, request handling, and fail-closed behavior.

## Approval gate for production translations

Each additional language can be activated only after all of the following are
complete:

1. The project owner approves the source wording and translated wording.
2. A named fluent human reviewer signs off on each translated knowledge item.
3. The versioned knowledge source records language, reviewer, review date, and
   the English source version from which it was translated.
4. Cross-language evaluation covers factual accuracy, numbers, names, safety
   refusals, citations, and retrieval isolation with no critical differences.
5. The language-specific knowledge index is regenerated and verified before
   the language is marked approved.

Malayalam is the first planned translation, followed by Hindi and Arabic. The
human translation-review owner is still to be confirmed.
