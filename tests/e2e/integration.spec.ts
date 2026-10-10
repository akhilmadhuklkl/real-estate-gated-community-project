import { expect, test } from "@playwright/test";

test("reports a healthy non-cached release service", async ({ request }) => {
  const response = await request.get("/api/health");

  expect(response.status()).toBe(200);
  expect(response.headers()["cache-control"]).toBe("no-store");
  await expect(response.json()).resolves.toEqual({
    status: "ok",
    service: "glitz-pride-web",
    phase: "phase-1-mvp",
  });
});

test("completes the villa discovery to visit-planning journey", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Explore the villas" }).click();
  await expect(page).toHaveURL(/\/villas$/);
  await expect(
    page.getByRole("heading", { level: 1, name: /Made for the way/ }),
  ).toBeVisible();

  await page.getByRole("link", { name: /View villa details/ }).click();
  await expect(page).toHaveURL(/\/villas\/villa-brochure-plan-01$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Brochure villa plan" }),
  ).toBeVisible();

  await page
    .getByRole("link", { name: "Request a private discussion" })
    .click();
  await expect(page).toHaveURL(/\/contact#schedule-visit$/);
  await page.getByLabel("Plan a site visit").check();
  await expect(page.getByLabel("Preferred visit date")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Prepare visit request" }),
  ).toBeVisible();
});

test("delivers the governed brochure as a real PDF download", async ({
  page,
  request,
}) => {
  const response = await request.get("/reference/glitz-pride/brochure.pdf");
  expect(response.ok()).toBe(true);
  expect(response.headers()["content-type"]).toContain("application/pdf");
  expect((await response.body()).byteLength).toBeGreaterThan(1_000_000);

  await page.goto("/contact#contact-actions-title");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("link", { name: /Download brochure/ }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("Glitz-Pride-Brochure.pdf");
});

test("recovers from an unknown route", async ({ page }) => {
  const response = await page.goto("/this-route-does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { level: 1, name: "This path leads elsewhere." }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Return home" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(
    page.getByRole("heading", { level: 1, name: /Life, with room/ }),
  ).toBeVisible();
});

test("keeps footer policy navigation connected", async ({ page }) => {
  await page.goto("/");
  const footer = page.getByRole("contentinfo");
  await footer.getByRole("link", { name: "Accessibility" }).click();
  await expect(page).toHaveURL(/\/accessibility$/);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: /Designed for clear and inclusive exploration/,
    }),
  ).toBeVisible();

  await page
    .getByRole("contentinfo")
    .getByRole("link", { name: "Privacy" })
    .click();
  await expect(page).toHaveURL(/\/privacy$/);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: /Clear choices. Respectful handling/,
    }),
  ).toBeVisible();
});

test("rejects unreadable, cross-origin, and automated enquiry requests", async ({
  request,
}) => {
  const unreadable = await request.post("/api/enquiries", {
    data: "not-json",
    headers: { "content-type": "application/json" },
  });
  expect(unreadable.status()).toBe(400);

  const crossOrigin = await request.post("/api/enquiries", {
    data: {},
    headers: { origin: "https://example.invalid" },
  });
  expect(crossOrigin.status()).toBe(403);

  const automated = await request.post("/api/enquiries", {
    data: {
      intent: "general-enquiry",
      fullName: "Preview Visitor",
      email: "visitor@example.com",
      consent: true,
      sourcePath: "/contact",
      website: "",
      startedAt: Date.now(),
    },
  });
  expect(automated.status()).toBe(422);
  await expect(automated.json()).resolves.toEqual({
    message: "The request could not be accepted. Please try again.",
  });
});

test("accepts a valid preview enquiry without external delivery", async ({
  request,
}) => {
  const response = await request.post("/api/enquiries", {
    data: {
      intent: "general-enquiry",
      fullName: "Preview Visitor",
      email: "visitor@example.com",
      consent: true,
      sourcePath: "/contact",
      website: "",
      startedAt: Date.now() - 5_000,
    },
  });
  expect(response.status()).toBe(200);
  const body = (await response.json()) as {
    deliveryState: string;
    reference: string;
  };
  expect(body.deliveryState).toBe("preview-only");
  expect(body.reference).toMatch(/^GP-\d{8}-[A-Z0-9]{8}$/);
});
