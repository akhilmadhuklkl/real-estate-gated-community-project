import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const publicRoutes = [
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

test("has no automatically detectable WCAG A or AA violations", async ({
  page,
}) => {
  const findings: Array<{
    route: string;
    id: string;
    impact: string | null | undefined;
    targets: string[];
  }> = [];

  for (const route of publicRoutes) {
    await page.goto(route);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    findings.push(
      ...results.violations.map((violation) => ({
        route,
        id: violation.id,
        impact: violation.impact,
        targets: violation.nodes.map((node) => node.target.join(" ")),
      })),
    );
  }

  expect(findings).toEqual([]);
});

test("supports keyboard bypass, menu dismissal, and dialog focus restoration", async ({
  page,
}) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const menuButton = page.getByRole("button", { name: "Open navigation" });
  await menuButton.click();
  await page.keyboard.press("Escape");
  await expect(menuButton).toBeFocused();
  await expect(menuButton).toHaveAttribute("aria-expanded", "false");

  await page.goto("/gallery");
  const galleryTrigger = page
    .getByRole("button", { name: /Open Ground-floor planning reference/ })
    .first();
  await galleryTrigger.click();
  await expect(page.getByRole("button", { name: /Close/ })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(galleryTrigger).toBeFocused();
});

test("keeps the vision slideshow still when reduced motion is requested", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const activeSlide = page.locator(".vision-visual__image[data-active]");
  const initialSource = await activeSlide.getAttribute("src");

  await page.waitForTimeout(5_500);
  await expect(activeSlide).toHaveAttribute("src", initialSource ?? "");
});

test("keeps open menus and dialogs free of detectable violations", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation" }).click();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze()
    ).violations,
  ).toEqual([]);

  await page.goto("/gallery");
  await page
    .getByRole("button", { name: /Open Ground-floor planning reference/ })
    .first()
    .click();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze()
    ).violations,
  ).toEqual([]);

  await page.goto("/villas");
  await page.getByRole("button", { name: "Add to comparison" }).click();
  await page.getByRole("button", { name: "Review comparison" }).click();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
});
