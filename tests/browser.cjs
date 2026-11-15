/* Optional integration test: requires Playwright and an installed Chromium. */
const { chromium } = require("playwright"),
  assert = require("node:assert/strict"),
  http = require("node:http"),
  fs = require("node:fs"),
  path = require("node:path");
(async () => {
  let server;
  let gameUrl = process.env.GAME_URL;
  if (!gameUrl) {
    const root = path.resolve(__dirname, "..");
    const mime = {
      ".html": "text/html",
      ".js": "application/javascript",
      ".css": "text/css",
      ".svg": "image/svg+xml",
    };
    server = http.createServer((req, res) => {
      const pathname = new URL(req.url, "http://localhost").pathname;
      const target = path.join(
        root,
        pathname === "/" ? "index.html" : decodeURIComponent(pathname),
      );
      if (!target.startsWith(root + path.sep)) {
        res.writeHead(403);
        res.end();
        return;
      }
      fs.readFile(target, (error, body) => {
        res.writeHead(error ? 404 : 200, {
          "Content-Type":
            mime[path.extname(target)] || "application/octet-stream",
        });
        res.end(error ? "Not found" : body);
      });
    });
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    gameUrl = `http://127.0.0.1:${server.address().port}`;
  }
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
    args: ["--no-sandbox"],
  });
  const context = await browser.newContext({
      viewport: { width: 1512, height: 1100 },
      isMobile: true,
      hasTouch: true,
    }),
    page = await context.newPage(),
    errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const fixed = new Date("2026-11-16T12:00:00Z");
  await page.clock.install({ time: fixed });
  await page.clock.pauseAt(fixed);
  await page.goto(gameUrl);
  const nav = (name) => ({
    click: async () => {
      if (
        page.viewportSize().width > 640 &&
        !(
          page.viewportSize().width <= 1024 && page.viewportSize().height <= 500
        )
      ) {
        await page
          .locator(".sidebar")
          .getByRole("button", { name, exact: true })
          .click();
        return;
      }
      if (
        [
          "Operations Center",
          "Streckennetz",
          "Strecke planen",
          "Flotte & Technik",
        ].includes(name)
      ) {
        await page
          .locator(".mobile-nav")
          .getByRole("button", { name, exact: true })
          .click();
        return;
      }
      await page
        .getByRole("button", { name: "Weitere Bereiche", exact: true })
        .click();
      await page
        .getByRole("dialog")
        .getByRole("button", { name, exact: true })
        .click();
    },
  });
  await page
    .getByRole("heading", { name: "Operations Center", exact: true })
    .waitFor();
  for (const name of [
    "Streckennetz",
    "Strecke planen",
    "Flotte & Technik",
    "Finanzen",
    "Kerosin & Betrieb",
    "Wettbewerb",
    "Lufthansa Group",
    "Management Academy",
    "Spielstand & Dauerbetrieb",
  ]) {
    await nav(name).click();
    const text = await page.locator("main").innerText();
    assert(!text.includes("NaN"));
    assert(!text.includes("undefined"));
  }
  // New route: live estimates, range rejection, actual creation and booking fee.
  await nav("Strecke planen").click();
  await page.locator('[name="to"]').selectOption("LAX");
  assert(await page.locator("#openRoute").isDisabled());
  assert(
    (await page.locator("#estimateMessage").innerText()).includes("Reichweite"),
  );
  await page.locator('[name="type"]').selectOption("10");
  await page.locator('[name="to"]').selectOption("BOS");
  await page.locator('[name="price"]').fill("550");
  assert(await page.locator("#openRoute").isEnabled());
  const before = await page.evaluate(() => ({
    cash: s.cash,
    routes: s.routes.length,
  }));
  await page.locator("#openRoute").click();
  await page
    .getByRole("heading", { name: "Streckennetz", exact: true })
    .waitFor();
  assert.equal(await page.evaluate(() => s.routes.length), before.routes + 1);
  assert.equal(await page.evaluate(() => s.cash), before.cash - 250000);
  const route = await page.evaluate(() => s.routes.at(-1).id);
  await page.locator(`[data-route="${route}"]`).click();
  await page.locator('#routeEdit [name="price"]').fill("620");
  await page.getByRole("button", { name: "Änderungen speichern" }).click();
  assert.equal(
    await page.evaluate((id) => s.routes.find((r) => r.id === id).price, route),
    620,
  );
  assert(
    (await page.locator("#actionFeedback").innerText()).includes("gespeichert"),
  );
  // Order, credit and immediate failure feedback without losing form state.
  await nav("Flotte & Technik").click();
  const fleetBefore = await page.evaluate(() => fleetTotal());
  await page.locator('#orderForm [name="air"]').selectOption("LH");
  await page.locator('#orderForm [name="type"]').selectOption("2");
  await page.locator('#orderForm [name="purchase"]').selectOption("used");
  await page.getByRole("button", { name: "Verbindlich bestellen" }).click();
  assert.equal(await page.evaluate(() => s.orders.length), 1);
  assert.equal(await page.evaluate(() => fleetTotal()), fleetBefore);
  await nav("Finanzen").click();
  await page.locator('[name="amount"]').fill("25");
  await page.getByRole("button", { name: "Finanzierung ausführen" }).click();
  assert.equal(await page.evaluate(() => s.finance.debt), 25e6);
  await page.locator('[name="amount"]').fill("250");
  await page.getByRole("button", { name: "Finanzierung ausführen" }).click();
  assert.equal(await page.evaluate(() => s.finance.debt), 25e6);
  assert(await page.locator("#actionFeedback").isVisible());
  assert.equal(await page.locator('[name="amount"]').inputValue(), "250");
  // Time travel the persisted wall-clock: used aircraft should deliver after one game day.
  await page.evaluate(() => {
    s.clock.wall -= 2 * 3600000;
    render();
  });
  assert.equal(await page.evaluate(() => s.orders.length), 0);
  assert.equal(await page.evaluate(() => fleetTotal()), fleetBefore + 1);
  assert(await page.evaluate(() => s.completed > 0));
  // Actual aircraft sale and protection of assigned aircraft.
  await nav("Flotte & Technik").click();
  await page.locator("summary").first().click();
  const cash = await page.evaluate(() => s.cash),
    count = await page.evaluate(() => fleetTotal());
  page.once("dialog", (d) => d.accept());
  await page.locator("[data-sell]:not([disabled])").first().click();
  assert.equal(await page.evaluate(() => fleetTotal()), count - 1);
  assert((await page.evaluate(() => s.cash)) > cash);
  assert((await page.locator("[data-sell][disabled]").count()) > 0);
  // Retire the newly created route gracefully; it must not free an aircraft in mid-air.
  await nav("Streckennetz").click();
  await page.locator(`[data-route="${route}"]`).click();
  const inFlight = await page.evaluate(
    (id) => s.routes.find((r) => r.id === id).phase === "flight",
    route,
  );
  page.once("dialog", (d) => d.accept());
  await page.locator("[data-close]").click();
  if (inFlight)
    assert(
      await page.evaluate(
        (id) => s.routes.some((r) => r.id === id && r.retiring),
        route,
      ),
    );
  await nav("Spielstand & Dauerbetrieb").click();
  await page.locator('[data-auto="fuel"]').click();
  assert.equal(await page.evaluate(() => s.automation.fuel), false);
  // Collapsed tablet navigation must retain settings and the academy.
  await page.setViewportSize({ width: 900, height: 1000 });
  await nav("Management Academy").click();
  await nav("Spielstand & Dauerbetrieb").click();
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  // Phone navigation, readable inputs, stacked tables, and narrow/landscape layouts.
  for (const width of [280, 320, 360, 390, 430, 640]) {
    await page.setViewportSize({ width, height: 844 });
    for (const name of [
      "Operations Center",
      "Streckennetz",
      "Strecke planen",
      "Flotte & Technik",
      "Finanzen",
      "Kerosin & Betrieb",
      "Wettbewerb",
      "Lufthansa Group",
      "Management Academy",
      "Spielstand & Dauerbetrieb",
    ]) {
      await nav(name).click();
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
        `Overflow on ${name} at ${width}`,
      );
      const bad = await page.evaluate(() =>
        [
          ...document.querySelectorAll(
            "main .panel, main .metric, main form, main input, main select, main button, main summary",
          ),
        ]
          .filter((el) => {
            const r = el.getBoundingClientRect();
            return r.width > 0 && (r.left < -1 || r.right > innerWidth + 1);
          })
          .map((el) => el.tagName + "." + el.className),
      );
      assert.deepEqual(bad, [], `Off-screen controls on ${name} at ${width}`);
      const scrollers = await page.evaluate(() =>
        [...document.querySelectorAll("main *")]
          .filter(
            (el) =>
              el.clientWidth > 0 &&
              el.scrollWidth > el.clientWidth + 1 &&
              /auto|scroll/.test(getComputedStyle(el).overflowX),
          )
          .map((el) => el.className),
      );
      assert.deepEqual(
        scrollers,
        [],
        `Horizontal scrollers on ${name} at ${width}`,
      );
      await page.evaluate(() => window.scrollTo(100, window.scrollY));
      assert.equal(await page.evaluate(() => window.scrollX), 0);
    }
    await nav("Strecke planen").click();
    assert.equal(
      await page
        .locator("#routeForm input")
        .first()
        .evaluate((el) => parseFloat(getComputedStyle(el).fontSize) >= 16),
      true,
    );
    assert(await page.locator(".mobile-nav").isVisible());
    await page
      .getByRole("button", { name: "Weitere Bereiche", exact: true })
      .click();
    await page.clock.runFor(6000);
    assert(
      await page.getByRole("dialog").isVisible(),
      "Menu must survive a simulation refresh",
    );
    await page
      .getByRole("button", { name: "Menü schließen", exact: true })
      .click();
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await nav("Streckennetz").click();
  assert.equal(await page.locator("#routeList thead").isVisible(), false);
  await page.locator("#routeSearch").fill("BOS");
  assert((await page.locator("#routeList").innerText()).includes("BOS"));
  await nav("Strecke planen").click();
  await page.locator('#routeForm [name="to"]').selectOption("FAO");
  await page.locator('#routeForm [name="price"]').fill("195");
  await page.clock.runFor(6000);
  assert.equal(
    await page.locator('#routeForm [name="price"]').inputValue(),
    "195",
  );
  await page.setViewportSize({ width: 640, height: 375 });
  await page
    .getByRole("button", { name: "Weitere Bereiche", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Finanzen", exact: true })
    .click();
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  for (const width of [740, 844, 915, 1024]) {
    await page.setViewportSize({ width, height: 390 });
    for (const name of [
      "Operations Center",
      "Streckennetz",
      "Flotte & Technik",
      "Finanzen",
      "Wettbewerb",
      "Spielstand & Dauerbetrieb",
    ]) {
      await nav(name).click();
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
        `Landscape overflow on ${name} at ${width}`,
      );
      assert.deepEqual(
        await page.evaluate(() =>
          [...document.querySelectorAll("main *")]
            .filter(
              (el) =>
                el.clientWidth > 0 &&
                el.scrollWidth > el.clientWidth + 1 &&
                /auto|scroll/.test(getComputedStyle(el).overflowX),
            )
            .map((el) => el.className),
        ),
        [],
      );
    }
  }
  assert.equal(errors.length, 0, errors.join("\n"));
  await browser.close();
  if (server) await new Promise((resolve) => server.close(resolve));
  console.log(
    "PASS: all pages on desktop/mobile; live range checks, route creation/editing, fees, used-aircraft order and delivery, loan limit/error feedback, aircraft sale/protection, graceful retirement, automation controls; zero runtime errors.",
  );
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
