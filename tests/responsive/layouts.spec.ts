import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const routes = [
  "/",
  "/community",
  "/villas",
  "/villas/villa-brochure-plan-01",
  "/amenities",
  "/master-plan",
  "/gallery",
  "/location",
  "/specifications",
  "/contact",
  "/accessibility",
  "/privacy",
] as const;

for (const route of routes) {
  test(`${route} stays inside the visual viewport`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator("#main-content > main")).toBeVisible();

    const layout = await page.evaluate(() => ({
      bodyWidth: document.body.scrollWidth,
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
    }));

    expect(layout.bodyWidth).toBeLessThanOrEqual(layout.viewportWidth + 1);
    expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewportWidth + 1);

    const escapedVisibleElements = await page
      .locator("main img, main input, main select, main textarea, main button")
      .evaluateAll((elements) =>
        elements.flatMap((element) => {
          if (element.closest('[role="region"][tabindex="0"]')) return [];
          const rect = element.getBoundingClientRect();
          const style = window.getComputedStyle(element);
          const visible =
            style.display !== "none" &&
            style.visibility !== "hidden" &&
            rect.width > 0 &&
            rect.height > 0;
          const escaped = rect.left < -1 || rect.right > window.innerWidth + 1;
          return visible && escaped
            ? [
                {
                  element: element.tagName.toLowerCase(),
                  left: Math.round(rect.left),
                  right: Math.round(rect.right),
                },
              ]
            : [];
        }),
      );

    expect(escapedVisibleElements).toEqual([]);
  });
}

test("compact navigation opens without clipping its actions", async ({
  page,
}) => {
  test.skip(
    !test.info().project.name.includes("portrait") &&
      !test.info().project.name.includes("landscape"),
    "Compact-navigation coverage applies to touch profiles.",
  );

  await page.goto("/");
  const menuButton = page.getByRole("button", { name: "Open navigation" });
  await expect(menuButton).toBeVisible();
  await menuButton.click();
  await expect(page.getByRole("navigation", { name: "Mobile" })).toBeVisible();
  await expect(
    page.locator("#mobile-navigation").getByRole("link", {
      name: "Schedule a visit",
    }),
  ).toBeVisible();

  const layout = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
  }));
  expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewportWidth + 1);
});

test("property guide opens without clipping its conversation surface", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Open Glitz Pride property guide" })
    .click();
  const dialog = page.getByRole("dialog", { name: "Property guide" });
  await expect(dialog).toBeVisible();
  await expect(page.getByLabel("Ask a property question")).toBeFocused();
  await expect(
    page.getByRole("button", { name: "Start voice input" }),
  ).toBeVisible();
  await dialog.evaluate(async (element) => {
    await Promise.all(
      element.getAnimations().map((animation) => animation.finished),
    );
  });

  const layout = await page.evaluate(() => {
    const dialog = document.querySelector<HTMLElement>("#concierge-dialog");
    const rect = dialog?.getBoundingClientRect();
    return {
      left: rect?.left ?? -1,
      right: rect?.right ?? Number.POSITIVE_INFINITY,
      top: rect?.top ?? -1,
      bottom: rect?.bottom ?? Number.POSITIVE_INFINITY,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    };
  });

  expect(layout.left).toBeGreaterThanOrEqual(-1);
  expect(layout.right).toBeLessThanOrEqual(layout.viewportWidth + 1);
  expect(layout.top).toBeGreaterThanOrEqual(-1);
  expect(layout.bottom).toBeLessThanOrEqual(layout.viewportHeight + 1);
});

test("dynamic property preview stays within the conversation surface", async ({
  page,
}) => {
  await page.route("**/api/assistant", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        sessionId: "responsive-preview",
        status: "answered",
        answer: "The approved source describes the available villa plan.",
        citations: [],
        model: "test-model",
        policy: {
          version: "test",
          reason: "allowed",
          riskTier: "R0",
          humanHandoffRequired: false,
        },
        evidence: {
          confidence: "high",
          citationCount: 1,
          minimumScore: 0.45,
        },
        preview: {
          id: "preview-recommendation-test",
          evidenceIds: ["chk-source-one"],
          kind: "recommendation",
          component: "villa-recommendation",
          href: "/contact",
          recommendation: {
            status: "single-approved-option",
            villa: {
              id: "villa-brochure-plan-01",
              name: "The Glitz Pride Villa",
              totalAreaSqFt: 2180,
              levels: 2,
              floorAreas: [],
              bedrooms: null,
              bathrooms: null,
              availability: "unknown",
              approvalState: "illustrative",
              publicationNote:
                "Illustrative information requiring confirmation.",
              image: "/media/glitz-pride/villa.jpg",
              imageAlt: "Contemporary Glitz Pride villa",
            },
            criteria: [
              {
                id: "minimum-area",
                label: "Minimum area",
                requested: "2,000 sq ft or more",
                outcome: "match",
                explanation: "The approved total plan is 2,180 sq ft.",
              },
              {
                id: "bedrooms",
                label: "Bedrooms",
                requested: "At least 3",
                outcome: "unknown",
                explanation:
                  "The approved catalogue does not confirm this value.",
              },
            ],
            limitations: [
              "The approved catalogue currently contains one villa plan, so this is an explained match—not a ranking across multiple options.",
              "Catalogue presence does not confirm current price, availability, completion, contractual inclusion, or personal suitability.",
            ],
            clarification: null,
          },
        },
      }),
    });
  });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Open Glitz Pride property guide" })
    .click();
  await page
    .getByLabel("Ask a property question")
    .fill("Recommend a villa above 2,000 sq ft");
  await page.getByRole("button", { name: /send/i }).click();
  const preview = page.getByRole("complementary", {
    name: "Visual property details",
  });
  await expect(preview).toBeVisible();
  await preview.evaluate((element) =>
    Promise.all(element.getAnimations().map((animation) => animation.finished)),
  );

  const bounds = await preview.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return {
      left: rect.left,
      right: rect.right,
      top: rect.top,
      bottom: rect.bottom,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    };
  });
  expect(bounds.left).toBeGreaterThanOrEqual(-1);
  expect(bounds.right).toBeLessThanOrEqual(bounds.viewportWidth + 1);
  expect(bounds.top).toBeGreaterThanOrEqual(-1);
  expect(bounds.bottom).toBeLessThanOrEqual(bounds.viewportHeight + 1);
});

test("approved contact card remains usable inside the conversation surface", async ({
  page,
}) => {
  await page.route("**/api/assistant", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        sessionId: "responsive-contact-card",
        status: "answered",
        answer: "The approved project enquiry channel is available.",
        citations: [],
        model: "test-model",
        policy: {
          version: "test",
          reason: "allowed",
          riskTier: "R0",
          humanHandoffRequired: false,
        },
        evidence: {
          confidence: "high",
          citationCount: 1,
          minimumScore: 0.45,
        },
        preview: {
          id: "preview-contact-test",
          evidenceIds: ["chk-source-one"],
          kind: "contact",
          component: "contact-reference-cards",
          href: "/contact",
          directory: {
            directoryNotice:
              "Only professional contact details with recorded publication consent appear here. Unconfirmed details stay hidden.",
            unavailableChannels: ["email"],
            cards: [
              {
                id: "contact-project-enquiries-whatsapp",
                displayName: "Glitz Pride project enquiries",
                personName: null,
                photo: null,
                role: "Project enquiry coordinator",
                languages: ["Not confirmed"],
                workingHours: "Not confirmed",
                responseTime: "Not confirmed",
                channels: [
                  {
                    type: "whatsapp",
                    label: "Review WhatsApp message",
                    href: "https://wa.me/919895468235",
                  },
                ],
                source: {
                  id: "KS-004",
                  approvalId: "APR-004",
                  label: "Owner-approved WhatsApp destination",
                  reviewedOn: "2026-10-11",
                },
                limitations: [
                  "No individual contact name or photograph is approved for publication.",
                  "Opening WhatsApp does not confirm delivery, availability, or a response time.",
                  "The message remains under your control and is not sent automatically.",
                ],
              },
            ],
          },
        },
      }),
    });
  });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Open Glitz Pride property guide" })
    .click();
  await page
    .getByLabel("Ask a property question")
    .fill("How can I contact you?");
  await page.getByRole("button", { name: /send/i }).click();

  const preview = page.getByRole("complementary", {
    name: "Visual property details",
  });
  await expect(preview).toBeVisible();
  await expect(
    preview.getByRole("heading", { name: "Glitz Pride project enquiries" }),
  ).toBeVisible();
  const layout = await preview.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return {
      left: rect.left,
      right: rect.right,
      viewportWidth: window.innerWidth,
      scrollWidth: element.scrollWidth,
      clientWidth: element.clientWidth,
    };
  });
  expect(layout.left).toBeGreaterThanOrEqual(-1);
  expect(layout.right).toBeLessThanOrEqual(layout.viewportWidth + 1);
  expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth + 1);
  expect(
    (
      await new AxeBuilder({ page })
        .include('[aria-label="Contact reference cards"]')
        .withTags(["wcag2a", "wcag2aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
});

test("lead qualification summary remains editable inside the viewport", async ({
  page,
}) => {
  await page.route("**/api/assistant", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        sessionId: "responsive-lead-summary",
        status: "answered",
        answer:
          "I prepared a minimal summary for your review. Nothing has been submitted.",
        citations: [],
        model: "test-model",
        policy: {
          version: "test",
          reason: "allowed",
          riskTier: "R1",
          humanHandoffRequired: true,
        },
        evidence: {
          confidence: "high",
          citationCount: 1,
          minimumScore: 0.45,
        },
        preview: {
          id: "preview-enquiry-summary-test",
          evidenceIds: ["chk-source-one"],
          kind: "enquiry-summary",
          component: "enquiry-summary",
          href: "/contact#schedule-visit",
          qualification: {
            draft: {
              intent: "site-visit",
              villaInterest: "Brochure villa plan",
              message: "Please arrange a site visit on 2026-11-12 morning.",
              preferredDate: "2026-11-12",
              timeWindow: "morning",
              handoffRoute: "visit",
            },
            captured: ["Site-visit intent", "Preferred date"],
            missing: [
              "Full name",
              "Email address or phone number",
              "Explicit consent",
            ],
            privacyNotice:
              "No personal contact details are inferred, stored, or sent from this summary.",
          },
        },
      }),
    });
  });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Open Glitz Pride property guide" })
    .click();
  await page
    .getByLabel("Ask a property question")
    .fill("Please arrange a site visit on 2026-11-12 morning");
  await page.getByRole("button", { name: /send/i }).click();
  const summary = page.getByRole("region", { name: "Enquiry summary" });
  await expect(summary).toBeVisible();
  await expect(summary.getByLabel("Relevant context")).toBeEditable();
  await expect(
    summary.getByRole("link", { name: /continue to enquiry form/i }),
  ).toBeVisible();
  const bounds = await summary.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return {
      left: rect.left,
      right: rect.right,
      viewportWidth: window.innerWidth,
    };
  });
  expect(bounds.left).toBeGreaterThanOrEqual(-1);
  expect(bounds.right).toBeLessThanOrEqual(bounds.viewportWidth + 1);
});
