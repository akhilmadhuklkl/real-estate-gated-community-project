import { expect, test, type Page } from "@playwright/test";

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

const isHostedPreview = new URL(
  process.env.BASE_URL ?? "http://127.0.0.1:3000",
).hostname.endsWith(".vercel.app");

function isPreviewToolbarCspNoise(message: string) {
  // The hosting preview toolbar injects this script. The application CSP is
  // expected to block it, so only this exact platform-generated error is noise.
  return (
    isHostedPreview &&
    message.includes("https://vercel.live/_next-live/feedback/feedback.js") &&
    message.includes("Content Security Policy")
  );
}

async function collectInternalLinks(page: Page) {
  return page.locator('a[href^="/"]').evaluateAll((links) =>
    Array.from(
      new Set(
        links
          .map((link) => link.getAttribute("href"))
          .filter((href): href is string => Boolean(href))
          .map((href) => href.split("#")[0])
          .filter(Boolean),
      ),
    ),
  );
}

test("passes the published-route UAT audit", async ({ page, request }) => {
  const failures: string[] = [];
  const internalLinks = new Set<string>();

  page.on("pageerror", (error) =>
    failures.push(`Browser error: ${error.message}`),
  );
  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      !isPreviewToolbarCspNoise(message.text())
    ) {
      failures.push(`Console error: ${message.text()}`);
    }
  });

  for (const route of publicRoutes) {
    const response = await page.goto(route);
    expect(response?.status(), `${route} should render successfully`).toBe(200);
    await expect(
      page.locator("h1"),
      `${route} should have one page heading`,
    ).toHaveCount(1);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page).toHaveTitle(/Glitz Pride/);

    await page.locator("img").evaluateAll(async (images) => {
      for (const image of images as HTMLImageElement[]) {
        image.scrollIntoView({ block: "center" });
        if (!image.complete) {
          await new Promise<void>((resolve) => {
            image.addEventListener("load", () => resolve(), { once: true });
            image.addEventListener("error", () => resolve(), { once: true });
          });
        }
      }
      window.scrollTo({ top: 0 });
    });

    const failedImages = await page
      .locator("img")
      .evaluateAll((images) =>
        (images as HTMLImageElement[])
          .filter((image) => !image.complete || image.naturalWidth === 0)
          .map((image) => image.getAttribute("src") ?? "unknown image"),
      );
    for (const image of failedImages) {
      failures.push(`${route} failed to load ${image}`);
    }

    for (const href of await collectInternalLinks(page)) {
      internalLinks.add(href);
    }
  }

  for (const href of internalLinks) {
    const response = await request.get(href);
    expect(
      response.status(),
      `${href} should be a valid internal destination`,
    ).toBeLessThan(400);
  }

  expect(failures).toEqual([]);
});

test("closes compact navigation after moving to another page", async ({
  page,
}, testInfo) => {
  test.skip(
    !testInfo.project.name.includes("mobile"),
    "Compact navigation check",
  );

  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: "Community" })
    .click();

  await expect(page).toHaveURL(/\/community$/);
  await expect(
    page.getByRole("button", { name: "Open navigation" }),
  ).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator("body")).toHaveAttribute("data-menu-open", "false");
});

test("keeps anchored visit content clear of the fixed header", async ({
  page,
}) => {
  await page.goto("/contact#schedule-visit");
  const target = page.locator("#schedule-visit");
  await expect(target).toBeVisible();

  const targetTop = await target.evaluate(
    (element) => element.getBoundingClientRect().top,
  );
  expect(targetTop).toBeGreaterThanOrEqual(72);
});
