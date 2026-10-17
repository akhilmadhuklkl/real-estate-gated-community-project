# Multilingual assistant support

## Current release state

English is the canonical evidence language. Malayalam, Hindi, and Arabic are
approved production response languages, reviewed by AKHIL on 17 October 2026.

For Malayalam, Hindi, and Arabic, a constrained provider step translates only
the question into concise English for retrieval. The multilingual embedding
model then retrieves canonical English evidence. The generation layer answers
in the selected language while preserving names, numbers, units, citations,
qualifications, and unknowns. Localized fixed safety messages are stored in a
versioned translation memory.

## Implemented foundation

- Explicit language selection for English, Malayalam, Hindi, and Arabic.
- Script and language-name detection for typed questions.
- Language carried through the API and retrieval contracts.
- Multilingual retrieval against canonical English evidence.
- Retrieval-only query translation that cannot answer or add project facts.
- Right-to-left metadata for Arabic and responsive language controls.
- A fail-closed `translation-not-approved` outcome for future languages.
- Automated tests for detection, filtering, request handling, and fail-closed behavior.

## Approved language set

| Code | Language  | Direction | Reviewer | State    |
| ---- | --------- | --------- | -------- | -------- |
| en   | English   | LTR       | AKHIL    | Approved |
| ml   | Malayalam | LTR       | AKHIL    | Approved |
| hi   | Hindi     | LTR       | AKHIL    | Approved |
| ar   | Arabic    | RTL       | AKHIL    | Approved |

The approval record and localized fixed messages are maintained in
`content/data/approved-translations.json` under source KS-022.

## Approval gate for future languages

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

Any future language remains unavailable until the same review, versioning,
retrieval evaluation, safety evaluation, and activation gates are complete.
