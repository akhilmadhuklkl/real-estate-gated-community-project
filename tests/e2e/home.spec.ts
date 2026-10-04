import { expect, test } from "@playwright/test";

test("shows the shared production shell", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { level: 1, name: /Life, with room/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Explore the villas/ }),
  ).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /Made for the way/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /Everything within/ }),
  ).toBeVisible();
});

test("keeps the homepage within the viewport", async ({ page }) => {
  await page.goto("/");
  const sizes = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(sizes.content).toBeLessThanOrEqual(sizes.viewport);
  await expect(
    page.getByRole("link", { name: /View all residence details/ }),
  ).toHaveAttribute("href", "/villas");
  await expect(
    page.getByRole("link", { name: /View location details/ }),
  ).toHaveAttribute("href", "/location");
});

test("opens the mobile navigation", async ({ page }, testInfo) => {
  test.skip(
    !testInfo.project.name.includes("mobile"),
    "Mobile navigation check",
  );
  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(
    page.getByRole("button", { name: "Close navigation" }),
  ).toHaveAttribute("aria-expanded", "true");
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Community", exact: true }),
  ).toBeVisible();
});

test("uses the shared shell on planned routes", async ({ page }) => {
  await page.goto("/community");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "A quieter way to belong.",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("banner").getByRole("link", { name: "Glitz Pride home" }),
  ).toBeVisible();
});
