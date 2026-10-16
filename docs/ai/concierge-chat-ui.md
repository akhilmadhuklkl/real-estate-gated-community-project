# Concierge chat UI

The Glitz Pride property guide is available from the floating `GP` launcher on every page. It opens an accessible, responsive conversation drawer that uses the approved property knowledge service.

## Conversation behavior

- Anonymous visitors can ask questions without signing in.
- Conversation history stays in React memory for the current page session only. It is not written to browser storage or a database.
- Only the six most recent user and assistant turns are sent for conversational context.
- Answers are rendered as plain text and approved source references can be expanded below an answer.
- Invalid requests and service failures receive a safe, actionable response.
- The visual detail preview is intentionally deferred to T0040.

## Accessibility and responsive behavior

- Opening the guide moves focus to the question field.
- Keyboard focus remains inside the modal until it closes.
- Escape closes the guide when no request is running and focus returns to the launcher.
- Desktop uses a contained bottom drawer; mobile uses the full viewport with safe-area padding.
- Reduced-motion preferences disable entrance and launcher transitions.
