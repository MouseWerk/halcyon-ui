import { test as base, expect, type Page } from "@playwright/test"

/** Fails any test that logs a console error, a React warning or an uncaught exception. */
export const test = base.extend<{ issues: string[] }>({
  issues: [async ({ page }, use) => {
    const issues: string[] = []
    page.on("pageerror", (e) => issues.push(`pageerror: ${e.message}`))
    page.on("console", (m) => {
      // Firefox flags Google's Doto font file (malformed STAT table it discards); the font still renders.
      if (/downloadable font:/.test(m.text())) return
      if (m.type() === "error" || (m.type() === "warning" && /react|warning:/i.test(m.text()))) issues.push(`${m.type()}: ${m.text()}`)
    })
    await use(issues)
    expect(issues, "console errors / uncaught exceptions").toEqual([])
  }, { auto: true }],
})

export { expect }

/** Hash-router navigation relative to the base path. */
export async function go(page: Page, route: string) {
  await page.goto(`./#${route}`)
  await page.waitForLoadState("domcontentloaded")
  await expect(page.locator("main")).toBeVisible()
  await expect(page.locator("[data-route-loading]")).toHaveCount(0)
}

export async function openComponent(page: Page, name: string) {
  await go(page, `/docs/components/${name}`)
  const demo = page.locator(`[data-demo="${name}"]`)
  await expect(demo).toBeVisible()
  return demo
}

export async function noHorizontalOverflow(page: Page) {
  const o = await page.evaluate(() => {
    const w = document.documentElement.clientWidth
    const offenders = [...document.querySelectorAll<HTMLElement>("body *")]
      .filter((e) => {
        const r = e.getBoundingClientRect()
        if (!r.width || getComputedStyle(e).position === "fixed") return false
        // inside a horizontal scroller is fine
        for (let p = e.parentElement; p && p !== document.body; p = p.parentElement) {
          const s = getComputedStyle(p)
          if (/(auto|scroll|hidden|clip)/.test(s.overflowX)) return false
        }
        return r.right > w + 1 || r.left < -1
      })
      .slice(0, 5)
      .map((e) => `${e.tagName.toLowerCase()}.${String(e.className).slice(0, 80)}`)
    return { sw: document.documentElement.scrollWidth, w, offenders }
  })
  expect(o.sw, `page scrolls sideways; offenders: ${o.offenders.join(" | ")}`).toBeLessThanOrEqual(o.w)
}

export const isMobile = (page: Page) => (page.viewportSize()?.width ?? 1280) < 640
