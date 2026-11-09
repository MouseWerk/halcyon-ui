import { test, expect, openComponent } from "./fixtures"

const desktopOnly = (name: string) => name.startsWith("phone") || name === "tablet"

test("alert dialog ignores the backdrop, focuses Cancel and waits for async actions", async ({ page }) => {
  const d = await openComponent(page, "alert-dialog")
  await d.getByRole("button", { name: "Revoke API key" }).click()
  const dlg = page.getByRole("alertdialog")
  await expect(dlg).toHaveAccessibleName("Revoke this key?")
  await expect(dlg.getByRole("button", { name: "Cancel" })).toBeFocused()
  await page.mouse.click(4, 4)
  await expect(dlg).toBeVisible()
  await dlg.getByRole("button", { name: "Revoke key" }).click()
  await expect(dlg.getByRole("button", { name: "Revoke key" })).toHaveAttribute("aria-busy", "true")
  await expect(dlg).toBeHidden({ timeout: 4000 })
  await expect(page.locator('section[aria-label="Notifications"]')).toContainText("Key revoked")
})

test("button group, aspect ratio and item render", async ({ page }) => {
  let d = await openComponent(page, "button-group")
  await expect(d.getByRole("group", { name: "Message actions" }).getByRole("button")).toHaveCount(3)
  d = await openComponent(page, "aspect-ratio")
  const box = (await d.getByText("16 : 9").locator("..").boundingBox())!
  expect(Math.abs(box.width / box.height - 16 / 9)).toBeLessThan(0.05)
  d = await openComponent(page, "item")
  await expect(d.getByRole("switch", { name: "Deploy notifications" })).toHaveAttribute("aria-checked", "true")
})

test("carousel moves with the arrows and dots", async ({ page }) => {
  const d = await openComponent(page, "carousel")
  const c = d.getByRole("region", { name: "Features" })
  await expect(c.getByRole("button", { name: "Previous slide" })).toBeDisabled()
  await c.getByRole("button", { name: "Next slide" }).click()
  await expect(c.getByRole("tab", { name: "Slide 2" })).toHaveAttribute("aria-selected", "true")
  await c.getByRole("tab", { name: "Slide 5" }).click()
  await expect(c.getByRole("button", { name: "Next slide" })).toBeDisabled()
})

test("charts render with an accessible summary and a tooltip", async ({ page }, info) => {
  const d = await openComponent(page, "chart")
  const area = d.getByRole("img", { name: /Revenue and costs by month/ })
  await expect(area).toBeVisible()
  await area.focus()
  await page.keyboard.press("ArrowRight")
  await expect(area).toContainText("Jan")
  await expect(area).toContainText("$")
  await expect(d.getByRole("img", { name: /Signups by quarter/ })).toBeVisible()
  await expect(d.getByRole("group", { name: /Traffic by source/ })).toBeVisible()
  if (!desktopOnly(info.project.name)) {
    await d.getByRole("img", { name: /Signups by quarter/ }).hover()
  }
})

test("collapsible opens and closes", async ({ page }) => {
  const d = await openComponent(page, "collapsible")
  const t = d.getByRole("button", { name: "Expand" })
  await t.click()
  await expect(d.getByRole("button", { name: "Collapse" })).toHaveAttribute("aria-expanded", "true")
  await expect(d.getByText("spring-motion")).toBeVisible()
})

test("context menu opens on right-click and keyboard", async ({ page }, info) => {
  test.skip(desktopOnly(info.project.name), "right-click / Shift+F10")
  const d = await openComponent(page, "context-menu")
  const area = d.locator("[data-context-area]")
  await area.click({ button: "right" })
  const menu = page.getByRole("menu")
  await expect(menu).toBeVisible()
  await expect(menu).toBeFocused()
  await menu.getByRole("menuitemcheckbox", { name: "Pinned" }).click()
  await expect(menu.getByRole("menuitemcheckbox", { name: "Pinned" })).toHaveAttribute("aria-checked", "true")
  await page.keyboard.press("Escape")
  await expect(menu).toBeHidden()
  await area.focus()
  await page.keyboard.press("Shift+F10")
  await expect(page.getByRole("menu")).toBeVisible()
  await page.keyboard.press("Escape")
})

test("context menu opens on long-press (touch)", async ({ page }, info) => {
  test.skip(!info.project.name.startsWith("phone"), "touch only")
  const d = await openComponent(page, "context-menu")
  const area = d.locator("[data-context-area]")
  const b = (await area.boundingBox())!
  await area.dispatchEvent("pointerdown", { pointerType: "touch", clientX: b.x + 40, clientY: b.y + 40, isPrimary: true })
  await page.waitForTimeout(650)
  await expect(page.getByRole("menu")).toBeVisible()
})

test("data table sorts, searches, selects and paginates", async ({ page }) => {
  const d = await openComponent(page, "data-table")
  // the page also shows the tree-mode table; scope to the orders table
  const orders = d.getByRole("region", { name: "Orders" })
  const rows = orders.locator("tbody tr")
  await expect(rows).toHaveCount(5)
  await expect(d).toContainText("1–5 of 12")
  await d.getByRole("button", { name: "Amount" }).click()
  await expect(orders.locator('th[aria-sort="ascending"]')).toContainText("Amount")
  await expect(rows.first()).toContainText("$49")
  await d.getByRole("button", { name: "Amount" }).click()
  await expect(rows.first()).toContainText("$9,100")
  await d.getByRole("searchbox", { name: "Search orders" }).fill("pro")
  await expect(d).toContainText("of 4")
  await d.getByRole("checkbox", { name: "Select page" }).click()
  await expect(d).toContainText("4 selected")
  await d.getByRole("searchbox", { name: "Search orders" }).fill("")
  await d.getByRole("button", { name: "Next page" }).click()
  await expect(d).toContainText("6–10 of 12")
})

test("data table tree mode: children fold under their parent, collapsed by default", async ({ page }) => {
  const d = await openComponent(page, "data-table")
  const t = d.getByRole("region", { name: "Applications" })
  const row = (name: string) => t.locator("tbody tr").filter({ hasText: new RegExp(`^${name}`) })
  // collapsed: only top-level rows
  await expect(t.locator("tbody tr")).toHaveCount(3)
  const toggle = row("Microsoft 365").getByRole("button", { name: "Expand 3 child rows" })
  await expect(toggle).toHaveAttribute("aria-expanded", "false")
  await toggle.click()
  await expect(t.locator('tbody tr[data-depth="1"]')).toHaveCount(3)
  // children stay right after their parent, in both sort directions
  const names = () => t.locator("tbody tr").evaluateAll((trs) => trs.map((tr) => (tr.querySelector("td")?.textContent ?? "").trim()))
  const ok = async () => { const n = await names(); const i = n.indexOf("Microsoft 365"); return ["Excel", "Teams", "Word"].every((c) => { const j = n.indexOf(c); return j > i && j <= i + 3 }) }
  await expect.poll(ok).toBe(true)
  await t.getByRole("button", { name: "Application" }).click()
  await expect.poll(ok).toBe(true)
  await row("Microsoft 365").getByRole("button", { name: "Collapse 3 child rows" }).click()
  await expect(t.locator('tbody tr[data-depth="1"]')).toHaveCount(0)
  // search opens matching children; a child whose parent does not match stands alone
  await d.getByRole("searchbox", { name: "Search applications" }).fill("photo")
  await expect(t.locator("tbody tr")).toHaveCount(1)
  await expect(row("Photoshop")).toHaveAttribute("data-depth", "0")
  await d.getByRole("searchbox", { name: "Search applications" }).fill("adobe")
  await expect(row("Photoshop")).toHaveAttribute("data-depth", "1")
})

test("date picker picks a day and a range", async ({ page }) => {
  const d = await openComponent(page, "date-picker")
  await d.getByRole("button", { name: "Due date: Pick a date" }).click()
  const panel = page.getByRole("dialog", { name: "Choose date" })
  await panel.locator("button[aria-pressed]:not([aria-disabled])").filter({ hasText: /^15$/ }).first().click()
  await expect(panel).toBeHidden()
  await expect(d.getByRole("button", { name: /^Due date: \w{3} 15, \d{4}$/ })).toBeVisible()
  await d.getByRole("button", { name: /^Stay/ }).click()
  const p2 = page.getByRole("dialog", { name: "Choose date" })
  await p2.locator("button[aria-pressed]").filter({ hasText: /^10$/ }).first().click()
  await p2.locator("button[aria-pressed]").filter({ hasText: /^14$/ }).first().click()
  await expect(p2).toBeHidden()
  await expect(d.getByRole("button", { name: /^Stay: .+ – .+/ })).toBeVisible()
})

test("drawer opens and closes by dragging down", async ({ page }) => {
  const d = await openComponent(page, "drawer")
  await d.getByRole("button", { name: "Open drawer" }).click()
  const dlg = page.getByRole("dialog", { name: "Move goal" })
  await expect(dlg).toBeVisible()
  await dlg.getByRole("button", { name: "Increase goal" }).click()
  await expect(dlg).toContainText("360")
  await page.waitForTimeout(500)
  const b = (await dlg.boundingBox())!
  await page.mouse.move(b.x + b.width / 2, b.y + 12)
  await page.mouse.down()
  await page.mouse.move(b.x + b.width / 2, b.y + 12 + b.height * 0.6, { steps: 8 })
  await page.mouse.up()
  await expect(dlg).toBeHidden()
})

test("field wires label, description and error", async ({ page }) => {
  const d = await openComponent(page, "field")
  const email = d.getByRole("textbox", { name: "Email" })
  await expect(email).toHaveAttribute("aria-invalid", "true")
  await expect(email).toHaveAccessibleDescription(/We send receipts here.*Enter a valid email address/)
  await email.fill("ava@halcyon.app")
  await expect(email).not.toHaveAttribute("aria-invalid", "true")
  await expect(d.getByRole("alert")).toHaveCount(0)
  await expect(d.getByRole("switch", { name: "Marketing emails" })).toBeVisible()
})

test("hover card shows on focus", async ({ page }) => {
  const d = await openComponent(page, "hover-card")
  await d.getByRole("link", { name: "@mauricekleindienst" }).focus()
  await expect(page.getByRole("tooltip")).toContainText("Joined November 2026")
  await page.keyboard.press("Escape")
  await expect(page.getByRole("tooltip")).toBeHidden()
})

test("input group focuses its input from addons", async ({ page }) => {
  const d = await openComponent(page, "input-group")
  await d.getByText("https://").click()
  await expect(d.getByRole("textbox", { name: "Domain" })).toBeFocused()
})

test("menubar opens, switches with arrows and toggles items", async ({ page }, info) => {
  test.skip(desktopOnly(info.project.name), "keyboard flow")
  const d = await openComponent(page, "menubar")
  const bar = d.getByRole("menubar", { name: "Editor" })
  await bar.getByRole("menuitem", { name: "File" }).click()
  await expect(page.getByRole("menu")).toContainText("New window")
  await page.keyboard.press("ArrowRight")
  await expect(page.getByRole("menu")).toContainText("Undo")
  await page.keyboard.press("ArrowRight")
  const view = page.getByRole("menu")
  await view.getByRole("menuitemradio", { name: "150%" }).click()
  await expect(view.getByRole("menuitemradio", { name: "150%" })).toHaveAttribute("aria-checked", "true")
  await page.keyboard.press("Escape")
  await expect(page.getByRole("menu")).toBeHidden()
})

test("native select changes value", async ({ page }) => {
  const d = await openComponent(page, "native-select")
  await d.getByRole("combobox", { name: "Timezone" }).selectOption("Asia/Tokyo")
  await expect(d).toContainText("value: Asia/Tokyo")
})

test("navigation menu opens a panel and follows links", async ({ page }) => {
  const d = await openComponent(page, "navigation-menu")
  await d.getByRole("button", { name: "Product" }).click()
  const link = d.getByRole("link", { name: /Charts/ })
  await expect(link).toBeVisible()
  await link.click()
  await expect(page).toHaveURL(/#\/docs\/components\/chart$/)
})

test("resizable handles move with the keyboard", async ({ page }) => {
  const d = await openComponent(page, "resizable")
  const h = d.getByRole("separator", { name: "Resize" }).first()
  await expect(h).toHaveAttribute("aria-valuenow", "30")
  await h.focus()
  await page.keyboard.press("ArrowRight")
  await expect(h).toHaveAttribute("aria-valuenow", "32")
  await page.keyboard.press("Enter")
  await expect(h).toHaveAttribute("aria-valuenow", "30")
})

test("sidebar collapses to icons on desktop and opens off-canvas on phones", async ({ page }, info) => {
  const d = await openComponent(page, "sidebar")
  // Below 1024px the sidebar is an off-canvas panel (tablets included)
  const phone = (page.viewportSize()?.width ?? 1280) < 1024
  if (phone) {
    await d.getByRole("button", { name: "Expand sidebar" }).click()
    const panel = page.getByRole("dialog", { name: "Sidebar" })
    await expect(panel).toBeVisible()
    await panel.getByRole("button", { name: /Orders/ }).click()
    await expect(panel).toBeHidden()
    await expect(d.getByRole("heading", { name: "Orders" })).toBeVisible()
  } else {
    const orders = d.getByRole("button", { name: /Orders/ })
    await orders.click()
    await expect(orders).toHaveAttribute("aria-current", "page")
    await d.getByRole("button", { name: "Collapse sidebar" }).click()
    await expect(d.locator("aside")).toHaveCSS("width", "76px", { timeout: 3000 })
    // Collapsed rows keep their name for screen readers and show it in a floating tooltip
    const collapsedOrders = d.getByRole("button", { name: "Orders" })
    await expect(collapsedOrders).toHaveAttribute("aria-label", "Orders")
    await collapsedOrders.hover()
    await expect(page.getByRole("tooltip")).toContainText("Orders")
    if (!info.project.name.includes("tablet")) {
      await page.keyboard.press("ControlOrMeta+b")
      await expect(d.locator("aside")).toHaveCSS("width", "256px", { timeout: 3000 })
    }
  }
})

test("range slider and range calendar", async ({ page }) => {
  let d = await openComponent(page, "slider")
  const lo = d.getByRole("slider", { name: "Minimum price" })
  await lo.focus()
  await page.keyboard.press("End")
  await expect(lo).toHaveAttribute("aria-valuenow", "300")
  d = await openComponent(page, "calendar")
  const cal = d.locator("[data-range-calendar]")
  await cal.locator("button[aria-pressed]").filter({ hasText: /^10$/ }).first().click()
  await cal.locator("button[aria-pressed]").filter({ hasText: /^12$/ }).first().click()
  await expect(cal.locator('button[aria-pressed="true"]')).toHaveCount(2)
  await expect(cal).toContainText("→")
})

test("shadcn registry is served and complete", async ({ request }, info) => {
  test.skip(info.project.name !== "desktop-chromium", "once")
  const idx = await (await request.get("r/registry.json")).json()
  expect(idx.items.length).toBe(81)
  for (const name of ["halcyon", "sidebar", "chart", "data-table", "knob"]) {
    const res = await request.get(`r/${name}.json`)
    expect(res.ok()).toBeTruthy()
    const item = await res.json()
    expect(item.files.length).toBeGreaterThan(0)
    for (const f of item.files) expect(f.content.length).toBeGreaterThan(50)
  }
  const base = await (await request.get("r/halcyon.json")).json()
  expect(base.cssVars.light["hc-glow"]).toBe("#ffa726")
  expect(base.cssVars.theme["color-hc-muted"]).toBeDefined()
  expect(base.cssVars.theme["color-muted"]).toBeUndefined()
})
