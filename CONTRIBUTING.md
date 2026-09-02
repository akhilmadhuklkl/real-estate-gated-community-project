# Contribution Guidelines

## Protected baseline

The `main` branch represents the stable project baseline. Planned development should be completed on a dedicated branch and reviewed before it is merged into `main`.

Do not commit directly to `main` except when an explicitly approved repository-maintenance action requires it.

## Branch naming

Use lowercase kebab-case after the branch prefix.

| Change type | Required format | Example |
| --- | --- | --- |
| Planned feature or task | `feature/<task-name>` | `feature/finalize-product-brief` |
| Defect correction | `bugfix/<bugfix-name>` | `bugfix/mobile-navigation-overflow` |
| Urgent production correction | `hotfix/<hotfix-name>` | `hotfix/enquiry-form-delivery` |

Branch names should be short, descriptive, and connected to one tracker task or clearly identified defect.

## Development workflow

1. Update the local `main` branch from the remote repository.
2. Create the correctly prefixed working branch.
3. Keep changes focused on the associated task or defect.
4. Run formatting, linting, type checks, tests, and a production build where applicable.
5. Review the diff for unrelated files, secrets, personal data, and prohibited terminology.
6. Commit using a concise description of the delivered outcome.
7. Push the working branch and merge it only after its acceptance criteria are satisfied.
8. Update the tracker status, dependencies, clarifications, and outcome evidence together.

## Commit guidance

- Use imperative, outcome-oriented commit messages.
- Keep each commit understandable and reversible.
- Do not commit generated secrets, local environment files, build output, caches, or temporary artifacts.
- Include the relevant task identifier in the commit body when it improves traceability.

## Repository terminology rule

Repository content must remain vendor-neutral and must not contain the two assistant-product names prohibited by the project owner. This applies to source code, documentation, comments, configuration, prompts, fixtures, tests, filenames, generated artifacts, branch descriptions, commit messages, and user-facing content.

Before committing, scan text files and inspect generated artifacts for prohibited terminology. If an external dependency produces such wording, keep it outside committed project content or replace the dependency when removal is not possible.

## Review requirement

The engineering controls in `AI-Driven-Gated-Community-Tracker.xlsx` are mandatory review guidance. Applicable controls must be satisfied before a change is merged.
