import { expect, test } from "@playwright/test";

test("publishes safe technical SEO signals", async ({ page, request }) => {
  const deploymentOrigin = process.env.BASE_URL ?? "http://localhost:3000";
  const canonicalOrigin = process.env.EXPECTED_SITE_URL ?? deploymentOrigin;
  const isPublicDeployment = Boolean(process.env.BASE_URL);

  await page.goto("/villas");

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    new URL("/villas", canonicalOrigin).toString(),
  );
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    new URL("/media/glitz-pride/villa.jpg", canonicalOrigin).toString(),
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    isPublicDeployment ? /index/ : /noindex/,
  );
  const structuredData = JSON.parse(
    (await page.locator('script[type="application/ld+json"]').textContent()) ??
      "{}",
  ) as { "@graph"?: Array<{ "@type"?: string }> };
  expect(structuredData["@graph"]?.map((item) => item["@type"])).toEqual([
    "WebSite",
    "Residence",
  ]);

  const robotsResponse = await request.get("/robots.txt");
  expect(await robotsResponse.text()).toContain(
    isPublicDeployment ? "Allow: /" : "Disallow: /",
  );

  const sitemapResponse = await request.get("/sitemap.xml");
  const sitemapXml = await sitemapResponse.text();
  expect(sitemapXml).toContain("/villas/villa-brochure-plan-01");
  expect(sitemapXml).not.toContain("/api/");
});

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
  await expect(page.getByText("1 of 3 selected")).toBeVisible();
  await page.getByRole("button", { name: "Review comparison" }).click();
  const comparison = page.getByRole("dialog", { name: "Villa comparison" });
  await expect(comparison).toBeVisible();
  await expect(comparison.getByText("2,220 sq ft")).toBeVisible();
  await expect(comparison.getByText("To confirm").first()).toBeVisible();
  await expect(comparison.getByText("Open comparison slot")).toHaveCount(2);
  await comparison
    .getByRole("button", { name: "Close villa comparison" })
    .click();
  await expect(comparison).not.toBeVisible();
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

test("operates the accessible master plan viewer", async ({ page }) => {
  await page.goto("/master-plan");
  await expect(
    page.getByRole("heading", { level: 1, name: /A place designed/ }),
  ).toBeVisible();
  await expect(page.getByText("plot availability")).toBeVisible();
  await page.getByRole("button", { name: "Show Shuttle court" }).click();
  await expect(
    page.getByRole("heading", { level: 2, name: "Shuttle court" }),
  ).toBeVisible();
  await expect(page.getByText(/intended sport/)).toBeVisible();
  await expect(
    page.getByRole("link", { name: /View amenity details/ }),
  ).toHaveAttribute("href", "/amenities#amenity-list");
});

test("filters and opens the governed media gallery", async ({ page }) => {
  await page.goto("/gallery");
  await expect(
    page.getByRole("heading", { level: 1, name: /A closer look/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Floor plans" }).click();
  await expect(page.getByText("Showing 2 of 8")).toBeVisible();
  await page
    .getByRole("button", { name: "Open Ground-floor planning reference" })
    .click();
  await expect(
    page.getByRole("dialog").getByRole("heading", {
      name: "Ground-floor planning reference",
    }),
  ).toBeVisible();
  await expect(page.getByText("Revision date not supplied")).toBeVisible();
  await page.getByRole("button", { name: /Close/ }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("filters the source-backed location directory", async ({ page }) => {
  await page.goto("/location");
  await expect(
    page.getByRole("heading", { level: 1, name: /Everything within/ }),
  ).toBeVisible();
  await expect(page.getByText("Owner verification pending")).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Open directions/ }),
  ).toHaveAttribute("href", /google\.com\/maps\/dir/);
  await page.getByRole("button", { name: "Healthcare" }).click();
  await expect(page.getByText("Showing 3 of 18")).toBeVisible();
  const landmarkList = page.getByRole("list");
  await expect(
    landmarkList.getByRole("heading", { name: "Amala Medical College" }),
  ).toBeVisible();
  await expect(
    landmarkList.getByRole("heading", { name: "IES Education City" }),
  ).toHaveCount(0);
});

test("validates and completes the preview enquiry flow", async ({ page }) => {
  await page.goto("/contact");
  await expect(
    page.getByRole("heading", { level: 1, name: /Visit at your own pace/ }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Prepare enquiry" }).click();
  await expect(page.locator(".form-alert--error")).toContainText(
    "Please correct the highlighted fields",
  );

  await page.getByLabel("Full name").fill("Akhil");
  await page.getByLabel("Email address").fill("akhil@example.com");
  await page.getByLabel(/I agree to prepare/).check();
  await page.waitForTimeout(3_000);
  await page.getByRole("button", { name: "Prepare enquiry" }).click();

  await expect(page.getByRole("status")).toContainText(
    "This private preview validates the flow",
  );
  await expect(page.getByRole("status")).toContainText(/GP-\d{8}-[A-Z0-9]{8}/);
});

test("reveals visit-specific fields", async ({ page }) => {
  await page.goto("/contact#schedule-visit");
  await page.getByLabel("Plan a site visit").check();
  await expect(page.getByLabel("Preferred visit date")).toBeVisible();
  await expect(page.getByLabel("Preferred time")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Prepare visit request" }),
  ).toBeVisible();
});

test("offers brochure-backed contact actions and the approved WhatsApp route", async ({
  page,
}) => {
  await page.goto("/contact#contact-actions-title");

  const sizes = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(sizes.content).toBeLessThanOrEqual(sizes.viewport);
  const headingTop = await page
    .getByRole("heading", { name: "Details when you need them." })
    .evaluate((heading) => heading.getBoundingClientRect().top);
  expect(headingTop).toBeGreaterThanOrEqual(75);

  const brochure = page.getByRole("link", { name: /Download brochure/ });
  await expect(brochure).toHaveAttribute(
    "href",
    "/reference/glitz-pride/brochure.pdf",
  );
  await expect(brochure).toHaveAttribute(
    "download",
    "Glitz-Pride-Brochure.pdf",
  );
  await expect(
    page.getByRole("link", { name: "+91 954 451 9000" }),
  ).toHaveAttribute("href", "tel:+919544519000");
  await expect(
    page.getByRole("link", { name: "info@glitzhomes.co.in" }),
  ).toHaveAttribute("href", /mailto:info@glitzhomes\.co\.in/);
  const whatsapp = page.getByRole("link", { name: /Open WhatsApp/ });
  await expect(whatsapp).toHaveAttribute(
    "href",
    "https://wa.me/919895468235?text=Hello%2C%20I%20would%20like%20to%20know%20more%20about%20Glitz%20Pride.",
  );
  await expect(whatsapp).toHaveAttribute("target", "_blank");
});

test("emits a non-personal contact action event", async ({ page }) => {
  await page.goto("/contact");
  await page.evaluate(() => {
    (
      window as Window & { capturedContactAction?: unknown }
    ).capturedContactAction = null;
    window.addEventListener("glitz:contact-action", (event) => {
      (
        window as Window & { capturedContactAction?: unknown }
      ).capturedContactAction = (event as CustomEvent).detail;
    });
  });

  await page.getByRole("link", { name: /Download brochure/ }).click();

  const event = await page.evaluate(
    () =>
      (window as Window & { capturedContactAction?: unknown })
        .capturedContactAction,
  );
  expect(event).toEqual({
    event: "contact_action",
    action: "brochure",
    label: "official_brochure",
    location: "contact_action_panel",
  });
});
