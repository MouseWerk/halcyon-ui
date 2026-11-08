import { defineConfig, devices } from "@playwright/test"

/**
 * End-to-end tests for the docs site and every component demo.
 *
 * Locally only Chromium may be installed, so phone/tablet projects emulate
 * their viewport, touch and user agent on Chromium. In CI (CI=1) the real
 * engines run too: Firefox, and WebKit for Safari / iOS.
 */
const CI = !!process.env.CI
const BASE = "/halcyon-ui/"
const PORT = 4173

const chromiumOnly = <T extends object>(d: T) => (CI ? d : { ...d, browserName: "chromium" as const, defaultBrowserType: "chromium" as const })

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  workers: CI ? 2 : undefined,
  reporter: CI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  timeout: 30_000,
  expect: { timeout: 5_000 },
  use: {
    baseURL: `http://localhost:${PORT}${BASE}`,
    trace: "off",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop-chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "desktop-chromium-dark", use: { ...devices["Desktop Chrome"], colorScheme: "dark" } },
    { name: "tablet", use: chromiumOnly(devices["iPad (gen 7)"]) },
    { name: "phone-android", use: { ...devices["Pixel 7"] } },
    { name: "phone-ios", use: chromiumOnly(devices["iPhone 14"]) },
    ...(CI
      ? [
          { name: "desktop-firefox", use: { ...devices["Desktop Firefox"] } },
          { name: "desktop-webkit", use: { ...devices["Desktop Safari"] } },
        ]
      : []),
  ],
  webServer: {
    command: `npm run build && npx vite preview --port ${PORT} --strictPort`,
    env: { BASE_PATH: BASE },
    url: `http://localhost:${PORT}${BASE}`,
    reuseExistingServer: !CI,
    timeout: 120_000,
  },
})
