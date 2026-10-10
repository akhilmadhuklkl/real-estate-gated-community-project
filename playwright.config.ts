import { defineConfig, devices } from "@playwright/test";

const localBaseUrl = "http://127.0.0.1:3000";
const baseURL = process.env.BASE_URL ?? localBaseUrl;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  workers: process.env.CI ? undefined : 4,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: "pnpm dev",
        url: localBaseUrl,
        reuseExistingServer: !process.env.CI,
      },
  projects: [
    { name: "desktop-chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-chromium", use: { ...devices["Pixel 7"] } },
  ],
});
