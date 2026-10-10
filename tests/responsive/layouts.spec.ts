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
