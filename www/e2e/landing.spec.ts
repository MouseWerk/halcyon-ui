import { test, expect, go, noHorizontalOverflow } from "./fixtures"
import { catalog } from "../src/site/catalog"

test("landing admin preview has a working sidebar on every screen size", async ({ page }) => {
  await go(page, "/")
  const nav = page.getByRole("navigation", { name: "Preview navigation" })
  await nav.scrollIntoViewIfNeeded()
  await expect(nav).toBeVisible()
  const orders = nav.getByRole("button", { name: /Orders/ })
  await orders.click()
  await expect(orders).toHaveAttribute("aria-current", "page")

  const wide = (page.viewportSize()?.width ?? 0) >= 1024
  const box = (await nav.boundingBox())!
  if (wide) {
    // a full-height column: the card is as tall as the content beside it
    const card = nav.locator("xpath=..")
    const cardBox = (await card.boundingBox())!
    const content = (await card.locator("xpath=following-sibling::div[1]").boundingBox())!
    expect(Math.abs(cardBox.height - content.height)).toBeLessThan(4)
    await expect(card.getByText("Storage")).toBeVisible()
    expect(box.width).toBeLessThan(260)
  } else {
    // a horizontal rail that scrolls instead of overflowing the page
    expect(box.height).toBeLessThan(80)
  }
  await noHorizontalOverflow(page)
})

test("landing renders the component count from the catalog", async ({ page }) => {
  await go(page, "/")
  await expect(page.getByText(new RegExp(`${catalog.length} pieces`))).toBeVisible()
})
