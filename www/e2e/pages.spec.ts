import { test, expect, go, noHorizontalOverflow } from "./fixtures"
import { catalog } from "../src/site/catalog"

const pages = ["/", "/docs", "/docs/installation", "/docs/frameworks", "/docs/theming", "/docs/cli", "/examples/dashboard"]

test.describe("site pages", () => {
  for (const route of pages) {
    test(`renders ${route}`, async ({ page }) => {
      await go(page, route)
      await expect(page.locator("h1, h2").first()).toBeVisible()
      await expect(page.locator("main")).not.toContainText("could not be shown")
      await page.waitForTimeout(400)
      await noHorizontalOverflow(page)
    })
  }

  test("unknown route shows the not-found page", async ({ page }) => {
    await go(page, "/does-not-exist")
    await expect(page.getByRole("heading", { name: "Nothing here" })).toBeVisible()
  })
})

test.describe("component docs", () => {
  for (const c of catalog) {
    test(`${c.name} page renders its demo`, async ({ page }) => {
      await go(page, `/docs/components/${c.name}`)
      await expect(page.getByRole("heading", { level: 1, name: c.title })).toBeVisible()
      const demo = page.locator(`[data-demo="${c.name}"]`)
      await expect(demo).toBeVisible()
      await expect(demo).not.toContainText("could not be shown")
      await noHorizontalOverflow(page)
      // the Code tab shows the real source file
      await page.getByRole("button", { name: "Code", exact: true }).click()
      await expect(page.locator(`[data-source="${c.name}"] pre`)).toContainText("export")
    })
  }

  test("catalog and docs agree on every component", async ({ page }, info) => {
    test.skip(info.project.name !== "desktop-chromium", "desktop sidebar only")
    await go(page, "/docs")
    await expect(page.locator('aside a[href*="#/docs/components/"]').first()).toBeVisible()
    const links = await page.locator('aside a[href*="#/docs/components/"]').evaluateAll((as) => as.map((a) => a.getAttribute("href")!.split("/").pop()))
    expect(new Set(links)).toEqual(new Set(catalog.map((c) => c.name)))
  })
})
