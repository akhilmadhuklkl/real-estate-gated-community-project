import { defineConfig, devices } from "@playwright/test";

const touchContext = {
  hasTouch: true,
  isMobile: true,
};

export default defineConfig({
  testDir: "./tests/responsive",
  fullyParallel: true,
  workers: 2,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "pnpm dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: "desktop-1440",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "laptop-1280",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: "tablet-portrait",
      use: {
        ...devices["Desktop Chrome"],
        ...touchContext,
        viewport: { width: 768, height: 1024 },
      },
    },
    {
      name: "tablet-landscape",
      use: {
        ...devices["Desktop Chrome"],
        ...touchContext,
        viewport: { width: 1024, height: 768 },
      },
    },
    {
      name: "iphone-portrait",
      use: {
        ...devices["Desktop Chrome"],
        ...touchContext,
        viewport: { width: 390, height: 844 },
      },
    },
    {
      name: "android-landscape",
      use: {
        ...devices["Pixel 7"],
        ...touchContext,
        viewport: { width: 915, height: 412 },
      },
    },
  ],
});
