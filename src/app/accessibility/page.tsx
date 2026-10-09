import { ActionLink } from "@/components/shared/action-link";
import { PageShell } from "@/components/shared/page-shell";
import { createPageMetadata } from "@/lib/seo";

import "./accessibility.css";

export const metadata = createPageMetadata({
  title: "Accessibility",
  description:
    "Accessibility goals, supported features, testing scope, and feedback information for the Glitz Pride website.",
  path: "/accessibility",
});

const supportedFeatures = [
  "Keyboard access to navigation, filters, forms, comparison tools, and image dialogs",
  "A skip link that moves focus directly to the main page content",
  "Visible focus indicators and descriptive labels for interactive controls",
  "Reduced-motion support for transitions and the automatic villa slideshow",
  "Responsive layouts that preserve content at desktop and mobile widths",
  "Status and validation messages exposed to assistive technologies",
];

const reviewScope = [
  "Automated WCAG A and AA checks across every public route",
  "Keyboard checks for bypass navigation, menus, dialogs, and focus restoration",
  "Desktop and mobile checks for labels, landmarks, contrast, and page structure",
  "Reduced-motion verification for automatically changing content",
];

export default function AccessibilityPage() {
  return (
    <main className="accessibility-page">
      <PageShell>
        <header className="accessibility-page__header">
          <p className="eyebrow">Accessibility</p>
          <h1>Designed for clear and inclusive exploration.</h1>
          <p>
            This preview aims to meet WCAG 2.2 Level AA. Accessibility is
            reviewed alongside each feature rather than treated as a final
            release-only check.
          </p>
          <span>Last reviewed 9 October 2026</span>
        </header>

        <div className="accessibility-page__grid">
          <section aria-labelledby="supported-title">
            <p className="eyebrow">Supported experience</p>
            <h2 id="supported-title">What the current build provides</h2>
            <ul>
              {supportedFeatures.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="review-title">
            <p className="eyebrow">Review evidence</p>
            <h2 id="review-title">How the experience is checked</h2>
            <ul>
              {reviewScope.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        </div>

        <section
          className="accessibility-page__limitations"
          aria-labelledby="limitations-title"
        >
          <div>
            <p className="eyebrow">Known limits</p>
            <h2 id="limitations-title">Review continues as content changes.</h2>
          </div>
          <div>
            <p>
              Automated checks cannot confirm every assistive-technology
              experience. Final content, third-party services, legal documents,
              and future interactive features will require renewed manual review
              before public release.
            </p>
            <p>
              If anything is difficult to access, describe the page, control,
              device, browser, and assistive technology involved. The current
              contact form prepares a request locally and does not yet send or
              store it.
            </p>
            <ActionLink href="/contact">
              Prepare accessibility feedback
            </ActionLink>
          </div>
        </section>
      </PageShell>
    </main>
  );
}
