# Web application foundation

## Decision

The production application uses the Next.js App Router with TypeScript, React, Tailwind CSS, and pnpm. It is hosted from the repository root so the application can consume the governed content model and approved assets without duplicating project records.

The preserved `mockup-demo` directory remains a visual and interaction reference. Production code lives under `src` and must not import or modify mockup source files.

## Runtime boundaries

- Server Components are the default.
- Client Components are introduced only for browser interaction.
- Structured project content is validated before it reaches a page.
- Environment values are validated in `src/lib/env.ts`.
- Images use the framework image component.
- Accessibility, responsive behaviour, and reduced-motion support are baseline requirements.

## Quality commands

| Command             | Purpose                                           |
| ------------------- | ------------------------------------------------- |
| `pnpm dev`          | Run the local development server.                 |
| `pnpm format:check` | Verify source formatting.                         |
| `pnpm lint`         | Run framework and accessibility-aware lint rules. |
| `pnpm typecheck`    | Run strict TypeScript checks.                     |
| `pnpm test`         | Run unit tests.                                   |
| `pnpm test:e2e`     | Run desktop and mobile browser tests.             |
| `pnpm build`        | Create the production build.                      |
| `pnpm check`        | Run the main pre-commit verification sequence.    |

## Content integration

The starter page reads `content/data/glitz-pride.json` through `src/lib/project-content.ts`. The data remains marked for approval under the content governance rules. Publication must not imply that unapproved information is current.
