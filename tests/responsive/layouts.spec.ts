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
          id: "preview-villa-test",
          evidenceIds: ["chk-source-one"],
          kind: "villa",
          component: "villa-summary",
          href: "/villas/villa-brochure-plan-01",
          villa: {
            id: "villa-brochure-plan-01",
            name: "The Glitz Pride Villa",
            totalAreaSqFt: 2180,
            levels: 2,
            floorAreas: [],
            bedrooms: 3,
            bathrooms: null,
            availability: "unknown",
            approvalState: "illustrative",
            publicationNote: "Illustrative information requiring confirmation.",
            image: "/media/glitz-pride/villa.jpg",
            imageAlt: "Contemporary Glitz Pride villa",
          },
        },
      }),
    });
  });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Open Glitz Pride property guide" })
    .click();
  await page.getByLabel("Ask a property question").fill("Show the villa");
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
