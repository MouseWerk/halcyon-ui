import AxeBuilder from "@axe-core/playwright"
import { test, expect, go } from "./fixtures"
import { catalog } from "../src/site/catalog"

const routes = ["/", "/docs", "/examples/dashboard", ...catalog.map((c) => `/docs/components/${c.name}`)]

test.describe("accessibility (axe, serious + critical)", () => {
  test.beforeEach(({}, info) => {
    test.skip(info.project.name !== "desktop-chromium" && info.project.name !== "desktop-chromium-dark", "run once per theme")
  })
  for (const r of routes) {
    test(r, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" })
      await go(page, r)
      await page.waitForTimeout(300)
      const res = await new AxeBuilder({ page })
        .include("main")
        .analyze()
      const bad = res.violations.filter((v) => v.impact === "serious" || v.impact === "critical")
      expect(bad.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(", ")}`)).toEqual([])
    })
  }
})
