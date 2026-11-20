import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 45000,
  expect: {
    timeout: 10000,
  },
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: "node index.js",
      cwd: "../../Backend",
      port: 5000,
      reuseExistingServer: true,
      timeout: 30000,
    },
    {
      // `next start` requires a production build; build first so the suite never
      // tests a stale or missing `.next` output.
      command: "npm run build && npm run start",
      port: 3000,
      reuseExistingServer: true,
      timeout: 180000,
    },
  ],
});
