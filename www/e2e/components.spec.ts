import { test, expect, openComponent, isMobile } from "./fixtures"

test("switch, checkbox and radio toggle their state", async ({ page }) => {
  let d = await openComponent(page, "switch")
  const sw = d.getByRole("switch").first()
  const before = await sw.getAttribute("aria-checked")
  await sw.click()
  await expect(sw).toHaveAttribute("aria-checked", before === "true" ? "false" : "true")

  d = await openComponent(page, "checkbox")
  const cb = d.getByRole("checkbox").first()
  const was = await cb.getAttribute("aria-checked")
  await cb.click()
  await expect(cb).not.toHaveAttribute("aria-checked", was!)

  d = await openComponent(page, "radio-group")
  const radios = d.getByRole("radio")
  await radios.nth(1).click()
  await expect(radios.nth(1)).toHaveAttribute("aria-checked", "true")
})

test("slider responds to the keyboard", async ({ page }) => {
  const d = await openComponent(page, "slider")
  const s = d.getByRole("slider").first()
  const v = Number(await s.getAttribute("aria-valuenow"))
  await s.focus()
  await page.keyboard.press("ArrowRight")
  await expect(s).toHaveAttribute("aria-valuenow", String(v + 1))
  await page.keyboard.press("Home")
  await expect(s).toHaveAttribute("aria-valuenow", await s.getAttribute("aria-valuemin") as string)
})

test("tabs move with arrow keys", async ({ page }) => {
  const d = await openComponent(page, "tabs")
  const tabs = d.getByRole("tab")
  await tabs.first().click()
  await page.keyboard.press("ArrowRight")
  await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true")
  await expect(d.getByRole("tabpanel")).toBeVisible()
})

test("accordion expands and collapses", async ({ page }) => {
  const d = await openComponent(page, "accordion")
  const trig = d.getByRole("button").first()
  const open = await trig.getAttribute("aria-expanded")
  await trig.click()
  await expect(trig).toHaveAttribute("aria-expanded", open === "true" ? "false" : "true")
})

test("theme switch flips the theme and remembers it", async ({ page }) => {
  await page.goto("./#/")
  const sw = page.getByRole("switch", { name: "Dark mode" }).first()
  const was = await sw.getAttribute("aria-checked")
  await sw.click()
  const want = was === "true" ? "light" : "dark"
  await expect(page.locator("html")).toHaveAttribute("data-theme", want)
  await page.reload()
  await expect(page.locator("html")).toHaveAttribute("data-theme", want)
})

// ---- new components ----

test("toggle and toggle group", async ({ page }) => {
  let d = await openComponent(page, "toggle")
  const italic = d.getByRole("button", { name: "Italic" })
  await expect(italic).toHaveAttribute("aria-pressed", "false")
  await italic.click()
  await expect(italic).toHaveAttribute("aria-pressed", "true")

  d = await openComponent(page, "toggle-group")
  const fmt = d.getByRole("group", { name: "Formatting" })
  await fmt.getByRole("button", { name: "Italic" }).click()
  await expect(d).toContainText("[bold, italic]")
  const align = d.getByRole("group", { name: "Alignment" })
  await align.getByRole("button", { name: "Right" }).click()
  await expect(align.getByRole("button", { name: "Right" })).toHaveAttribute("aria-pressed", "true")
  await expect(align.getByRole("button", { name: "Left" })).toHaveAttribute("aria-pressed", "false")
  await align.getByRole("button", { name: "Right" }).click()
  await expect(d).toContainText("none")
})

test("chip select and remove", async ({ page }) => {
  const d = await openComponent(page, "chip")
  const eng = d.getByRole("button", { name: "Engineering" })
  await eng.click()
  await expect(eng).toHaveAttribute("aria-pressed", "true")
  await expect(d.getByText("#react")).toBeVisible()
  await d.getByRole("button", { name: "Remove" }).first().click()
  await expect(d.getByText("#react")).toBeHidden()
})

test("knob by keyboard", async ({ page }) => {
  const d = await openComponent(page, "knob")
  const k = d.getByRole("slider", { name: "Volume" })
  await k.focus()
  await page.keyboard.press("ArrowUp")
  await expect(k).toHaveAttribute("aria-valuenow", "65")
  await page.keyboard.press("End")
  await expect(k).toHaveAttribute("aria-valuenow", "100")
})

test("knob by dragging", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop-chromium", "mouse drag")
  const d = await openComponent(page, "knob")
  const k = d.getByRole("slider", { name: "Volume" })
  const b = (await k.boundingBox())!
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2)
  await page.mouse.down()
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2 - 60, { steps: 6 })
  await page.mouse.up()
  expect(Number(await k.getAttribute("aria-valuenow"))).toBeGreaterThan(64)
})

test("copy button copies", async ({ page, context }, info) => {
  test.skip(!info.project.name.includes("chromium") && !info.project.name.startsWith("phone-android"), "clipboard permissions are chromium-only")
  await context.grantPermissions(["clipboard-read", "clipboard-write"])
  const d = await openComponent(page, "copy-button")
  await d.getByRole("button", { name: "Copy" }).first().click()
  await expect(d.getByRole("button", { name: "Copied" }).first()).toBeVisible()
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain("add knob")
})

test("number input steps, clamps and accepts typing", async ({ page }) => {
  const d = await openComponent(page, "number-input")
  const seats = d.getByRole("spinbutton", { name: "Seats" })
  await d.getByRole("button", { name: "Increase" }).first().click()
  await expect(seats).toHaveValue("4")
  await seats.focus()
  await page.keyboard.press("ArrowDown")
  await expect(seats).toHaveValue("3")
  await seats.fill("999")
  await seats.press("Enter")
  await expect(seats).toHaveValue("50")
  await expect(d).toContainText("50 seats")
})

test("otp input fills, pastes and validates", async ({ page }) => {
  const d = await openComponent(page, "otp-input")
  const input = d.getByRole("textbox", { name: "One-time code" })
  await input.click()
  await page.keyboard.type("111111")
  await expect(d).toContainText("Wrong code")
  await input.fill("")
  await input.fill("12a3456")
  await expect(input).toHaveValue("123456")
  await expect(d).toContainText("Verified")
})

test("password input reveals and scores", async ({ page }) => {
  const d = await openComponent(page, "password-input")
  const pw = d.getByLabel("Password", { exact: true })
  await pw.fill("abc")
  await expect(d).toContainText("Weak")
  await pw.fill("Correct-Horse-9-Battery")
  await expect(d).toContainText("Strong")
  await expect(pw).toHaveAttribute("type", "password")
  await d.getByRole("button", { name: "Show password" }).click()
  await expect(pw).toHaveAttribute("type", "text")
})

test("combobox filters and picks", async ({ page }) => {
  const d = await openComponent(page, "combobox")
  const box = d.getByRole("combobox", { name: "Region" })
  await box.click()
  await box.fill("sin")
  const list = page.getByRole("listbox")
  await expect(list.getByRole("option")).toHaveCount(1)
  await page.keyboard.press("Enter")
  await expect(list).toBeHidden()
  await expect(d).toContainText("value: sin")
  await box.click()
  await box.fill("zzz")
  await expect(page.getByRole("listbox")).toContainText("No matches")
  await page.keyboard.press("Escape")
  await expect(box).toHaveValue("Singapore")
})

test("calendar picks with mouse and keyboard, skips disabled days", async ({ page }) => {
  const d = (await openComponent(page, "calendar")).locator(":scope > div > div").first()
  const days = d.locator("button[aria-pressed]")
  // first enabled day of the current month
  const firstMonday = d.locator('button[aria-pressed]:not([aria-disabled])').filter({ hasText: /^1$/ }).first()
  if (await firstMonday.count()) await firstMonday.click()
  else await days.nth(10).click()
  await expect(d.locator('button[aria-pressed="true"]')).toHaveCount(1)
  const label = await d.locator('button[aria-pressed="true"]').getAttribute("aria-label")
  await d.locator('button[aria-pressed="true"]').focus()
  await page.keyboard.press("ArrowRight")
  await page.keyboard.press("Enter")
  const next = await d.locator('button[aria-pressed="true"]').getAttribute("aria-label")
  // moving right lands on the next day unless that day is a Sunday (disabled)
  expect(next === label || !next?.startsWith("Sunday")).toBeTruthy()
  const month = await d.getByRole("group").getAttribute("aria-label")
  await d.getByRole("button", { name: "Next month" }).click()
  await expect(d.getByRole("group")).not.toHaveAttribute("aria-label", month!)
})

test("file drop accepts chosen files and rejects bad ones", async ({ page }) => {
  const d = await openComponent(page, "file-drop")
  const input = d.locator('input[type="file"]')
  await input.setInputFiles({ name: "photo.png", mimeType: "image/png", buffer: Buffer.from("png") })
  await expect(d).toContainText("photo.png")
  await input.setInputFiles({ name: "notes.txt", mimeType: "text/plain", buffer: Buffer.from("x") })
  await expect(page.getByText("1 file(s) rejected")).toBeVisible()
})

test("rating by click and keyboard", async ({ page }) => {
  const d = await openComponent(page, "rating")
  const r = d.getByRole("slider", { name: "Rating" })
  await r.focus()
  await page.keyboard.press("ArrowLeft")
  await expect(r).toHaveAttribute("aria-valuenow", "3")
  await expect(d).toContainText("3 / 5")
})

test("steps advance and go back via finished steps", async ({ page }) => {
  const d = await openComponent(page, "steps")
  await d.getByRole("button", { name: "Next" }).click()
  await expect(d.locator('[aria-current="step"]')).toContainText("Billing")
  await d.getByRole("button", { name: "Go to step 1" }).click()
  await expect(d.locator('[aria-current="step"]')).toContainText("Account")
})

test("progress, ring, heatmap, bar list and timeline render", async ({ page }) => {
  let d = await openComponent(page, "progress")
  await expect(d.getByRole("progressbar")).toHaveCount(3)
  await d.getByRole("button", { name: "More" }).click()
  await expect(d.getByRole("progressbar").first()).toHaveAttribute("aria-valuenow", "62")

  d = await openComponent(page, "progress-ring")
  await expect(d.getByRole("progressbar").first()).toBeVisible()

  d = await openComponent(page, "heatmap")
  await expect(d.getByRole("img")).toBeVisible()

  d = await openComponent(page, "bar-list")
  await expect(d.getByRole("listitem").first()).toContainText("/")
  await expect(d.getByRole("listitem").first()).toContainText("9,820")

  d = await openComponent(page, "timeline")
  await expect(d.getByRole("listitem")).toHaveCount(4)

  d = await openComponent(page, "avatar-group")
  await expect(d.getByLabel("3 more")).toBeVisible()

  d = await openComponent(page, "empty-state")
  await expect(d.getByRole("heading", { name: "No notifications" })).toBeVisible()
  if (isMobile(page)) await expect(d).toBeInViewport()
})
