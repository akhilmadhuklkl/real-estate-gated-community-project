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

test("renders the production community story", async ({ page }) => {
  await page.goto("/community");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: /Nature's pet/,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /Thoughtful from ground to garden/ }),
  ).toBeVisible();
  await expect(page.getByText("Lijo. Reny. Architects").first()).toBeVisible();
  await expect(page.getByText(/Installed systems/)).toBeVisible();
  await expect(
    page.getByRole("banner").getByRole("link", { name: "Glitz Pride home" }),
  ).toBeVisible();
});

test("filters and selects the governed villa catalogue", async ({ page }) => {
  await page.goto("/villas");
  await expect(
    page.getByRole("heading", { level: 1, name: /Made for the way/ }),
  ).toBeVisible();
  await expect(page.getByText("2,220").first()).toBeVisible();
  await page.getByLabel("Area").selectOption("2500-plus");
  await expect(
    page.getByRole("heading", { name: "Try another area or search term." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await page.getByRole("button", { name: "Add to comparison" }).click();
  await expect(page.getByText("1 selected")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Compare villas" }),
  ).toBeDisabled();
});

test("renders the brochure-backed villa detail", async ({ page }) => {
  await page.goto("/villas/villa-brochure-plan-01");
  await expect(
    page.getByRole("heading", { level: 1, name: "Brochure villa plan" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Two considered levels." }),
  ).toBeVisible();
  await expect(page.getByText("Ground floor · 1,410 sq ft")).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Material choices, clearly referenced.",
    }),
  ).toBeVisible();
});

test("renders the brochure-backed amenities experience", async ({ page }) => {
  await page.goto("/amenities");
  await expect(
    page.getByRole("heading", { level: 1, name: /Room for the rituals/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Vegetable garden" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Security and surveillance" }),
  ).toBeVisible();
  await expect(
    page.getByText("Delivery state: confirmation pending").first(),
  ).toBeVisible();
  await expect(page.getByText("brochure-listed amenities")).toBeVisible();
});
