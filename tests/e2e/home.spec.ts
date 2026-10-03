import { expect, test } from "@playwright/test";

test("shows the production foundation", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { level: 1, name: "Glitz Pride" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Explore the foundation/ }),
  ).toBeVisible();
});
