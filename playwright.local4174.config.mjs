import { defineConfig } from "@playwright/test";

// Temporary local config on port 4174 so it never collides with another dev server.
export default defineConfig({
  testDir: "./tests",
  testMatch: ["**/*.e2e.spec.mjs"],
  fullyParallel: false,
  workers: 1,
  timeout: 45_000,
  expect: { timeout: 8_000 },
  use: { baseURL: "http://127.0.0.1:4174", headless: true, trace: "retain-on-failure", screenshot: "only-on-failure" },
  projects: [{ name: "chromium", use: { browserName: "chromium", viewport: { width: 1440, height: 1000 } } }]
});
