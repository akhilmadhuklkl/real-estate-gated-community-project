import { expect, test } from "@playwright/test";

type VitalsWindow = Window & {
  __performanceVitals?: { cls: number; lcp: number };
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const vitalsWindow = window as VitalsWindow;
    vitalsWindow.__performanceVitals = { cls: 0, lcp: 0 };

    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const shift = entry as PerformanceEntry & {
          hadRecentInput: boolean;
          value: number;
        };
        if (!shift.hadRecentInput) {
          vitalsWindow.__performanceVitals!.cls += shift.value;
        }
      }
    }).observe({ type: "layout-shift", buffered: true });

    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const latest = entries.at(-1);
      if (latest) vitalsWindow.__performanceVitals!.lcp = latest.startTime;
    }).observe({ type: "largest-contentful-paint", buffered: true });
  });
});

test("keeps the homepage within its production performance budgets", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);

  const metrics = await page.evaluate(() => {
    const navigation = performance.getEntriesByType(
      "navigation",
    )[0] as PerformanceNavigationTiming;
    const resources = performance.getEntriesByType(
      "resource",
    ) as PerformanceResourceTiming[];
    const totals = resources.reduce(
      (result, resource) => {
        result.transfer += resource.transferSize;
        if (resource.initiatorType === "script") {
          result.scripts += resource.transferSize;
        }
        if (resource.initiatorType === "img") {
          result.images += resource.transferSize;
        }
        return result;
      },
      { transfer: 0, scripts: 0, images: 0 },
    );

    return {
      cls: (window as VitalsWindow).__performanceVitals?.cls ?? 0,
      lcp: (window as VitalsWindow).__performanceVitals?.lcp ?? 0,
      fcp:
        performance.getEntriesByName("first-contentful-paint")[0]?.startTime ??
        0,
      domContentLoaded: navigation.domContentLoadedEventEnd,
      ...totals,
    };
  });

  expect(metrics.domContentLoaded).toBeLessThan(2_500);
  if (metrics.fcp > 0) expect(metrics.fcp).toBeLessThan(1_800);
  if (metrics.lcp > 0) expect(metrics.lcp).toBeLessThan(2_500);
  expect(metrics.cls).toBeLessThanOrEqual(0.1);
  expect(metrics.scripts).toBeLessThan(500_000);
  expect(metrics.images).toBeLessThan(1_500_000);
  expect(metrics.transfer).toBeLessThan(2_500_000);
});

test("prioritizes only critical imagery and caches governed assets", async ({
  page,
  request,
}) => {
  const asset = await request.get("/media/glitz-pride/villa.jpg");
  expect(asset.headers()["cache-control"]).toBe(
    "public, max-age=31536000, immutable",
  );

  await page.goto("/");
  await expect(
    page.locator('link[rel="preload"][as="image"]').first(),
  ).toHaveAttribute("imagesrcset", /hero-villa/);
  await expect(page.locator(".vision-visual__image")).toHaveCount(1);

  await page.goto("/gallery");
  await expect(page.locator(".gallery-card img").first()).toHaveAttribute(
    "loading",
    "lazy",
  );

  await page.goto("/master-plan");
  await expect(page.locator(".plan-viewer__canvas img")).toHaveAttribute(
    "loading",
    "lazy",
  );
});
