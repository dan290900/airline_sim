/* Interface: local assets only, keyboard accessible controls, no external UI kit. */
let mapRegion = "world",
  plannerDraft = null;
const ICONS = {
  dashboard:
    '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  plane: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="m22 2-11 11"/>',
  network:
    '<circle cx="5" cy="5" r="3"/><circle cx="19" cy="7" r="3"/><circle cx="12" cy="20" r="3"/><path d="m8 5 8 2M6 8l5 9m6-8-4 8"/>',
  chart: '<path d="M4 3v18h18M8 16l4-6 4 3 5-7"/>',
  fleet:
    '<path d="m12 2 2 7 7 4v2l-7-2v5l3 2v1l-5-1-5 1v-1l3-2v-5l-7 2v-2l7-4Z"/>',
  group:
    '<circle cx="9" cy="8" r="4"/><path d="M2 22v-3a7 7 0 0 1 14 0v3M17 4a4 4 0 0 1 0 8m2 5a6 6 0 0 1 3 5"/>',
  fuel: '<path d="M5 22V4h10v18M3 22h14M7 7h6v5H7m8-6 5 5v8a2 2 0 0 0 4 0v-6l-3-3"/>',
  settings:
    '<circle cx="12" cy="12" r="4"/><path d="m9 2-1 4-4 1-2 5 3 3v4l5 3 3-2 4 1 4-5-2-3 1-4-4-4-4 1Z"/>',
  book: '<path d="M12 5C8 2 4 3 2 4v16c3-2 7-1 10 1 3-2 7-3 10-1V4c-3-1-7-2-10 1Zm0 0v16"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/>',
  search: '<circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/>',
  check: '<path d="m5 12 4 4L20 5"/>',
  alert: '<path d="m12 3 10 18H2Zm0 6v5m0 3v1"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
};
function icon(name, size = 20) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.plane}</svg>`;
}
function badge(text, tone = "neutral") {
  return `<span class="badge ${tone}">${esc(text)}</span>`;
}
function airlineMark(id) {
  return `<span class="airline-mark" style="--air:${brands[id].color}">${id === "4Y" ? "D" : id}</span>`;
}
function heading(kicker, title, subtitle, action = "") {
  return `<div class="section-heading"><div><span class="eyebrow">${kicker}</span><h2>${title}</h2>${subtitle ? `<p class="sub">${subtitle}</p>` : ""}</div>${action}</div>`;
}
function metric(label, value, caption, kind = "") {
  return `<div class="metric ${kind}"><span>${label}</span><strong>${value}</strong><small>${caption}</small></div>`;
}
function airlineOptions(value = "all", all = true) {
  return `${all ? '<option value="all">Alle Airlines</option>' : ""}${Object.entries(
    brands,
  )
    .map(
      ([id, b]) =>
        `<option value="${id}" ${value === id ? "selected" : ""}>${b.name}</option>`,
    )
    .join("")}`;
}
function brandFilter() {
  return `<label class="sr-only" for="airlineFilter">Airline filtern</label><select id="airlineFilter">${airlineOptions(filter)}</select>`;
}
function filteredRoutes() {
  return s.routes.filter((r) => filter === "all" || r.air === filter);
}
function headerActions() {
  return `<button class="button primary" data-page="new">${icon("plus", 16)} Strecke planen</button>`;
}
function offlineReport() {
  return s.report
    ? `<div class="notice"><div>${icon("clock")}<p><strong>Willkommen zurück. ${duration(s.report.elapsed)} Spielzeit nachgerechnet.</strong><span>${num(s.report.flights)} Flüge · ${num(s.report.missed)} Ausfälle · ${compact(s.report.net)} Kontoveränderung</span></p></div><button class="icon-button" id="dismissReport" aria-label="Rückkehrbericht schließen">×</button></div>`
    : "";
}
function world() {
  const xy = (a) => [(a[3] + 180) * 2.5, (90 - a[2]) * 2.5],
    routes = filteredRoutes();
  const ids = [...new Set(routes.flatMap((r) => [r.from, r.to]))];
  return `<div class="world-map"><svg viewBox="${mapRegion === "europe" ? "424 59 126 117" : "0 18 900 390"}" role="img" aria-label="Lufthansa Group Streckennetz, Verbindungen anklickbar"><defs><pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse"><path d="M50 0H0V50" fill="none" stroke="#adc9f3" stroke-width=".4" opacity=".10"/></pattern><radialGradient id="ocean"><stop stop-color="#183d70"/><stop offset="1" stop-color="#0b2244"/></radialGradient></defs><rect width="900" height="450" fill="url(#ocean)"/><rect width="900" height="450" fill="url(#grid)"/><path d="${WORLD_LAND}" fill="#294d75" stroke="#43668b" stroke-width=".35"/>${routes
    .map((r) => {
      const a = xy(ap(r.from)),
        b = xy(ap(r.to)),
        mid = (a[0] + b[0]) / 2,
        up = Math.min(a[1], b[1]) - Math.abs(a[0] - b[0]) * 0.2;
      return `<g data-route="${r.id}" tabindex="0" role="button" aria-label="${r.from} nach ${r.to}"><title>${brands[r.air].name}: ${r.from} ↔ ${r.to}</title><path d="M${a} Q${mid} ${up} ${b}" stroke="${r.air === "LH" ? "#ffcb43" : brands[r.air].color}" stroke-width="${mapRegion === "europe" ? 0.35 : 1}" opacity=".55" fill="none"/><path d="M${a} Q${mid} ${up} ${b}" stroke="transparent" stroke-width="${mapRegion === "europe" ? 2 : 8}" fill="none"/></g>`;
    })
    .join("")}${ids
    .map((code) => {
      const p = xy(ap(code)),
        hub = Object.values(brands).some((b) => b.hubs.includes(code));
      return `<g><circle cx="${p[0]}" cy="${p[1]}" r="${mapRegion === "europe" ? (hub ? 0.55 : 0.35) : hub ? 2.5 : 1.6}" fill="${hub ? "#ffcc4b" : "#d7e5fa"}"/><text x="${p[0] + (mapRegion === "europe" ? 1 : 4)}" y="${p[1] - (mapRegion === "europe" ? 1 : 4)}" font-size="${mapRegion === "europe" ? 1.9 : 7.5}" fill="${hub ? "#ffe8a0" : "#b4cae5"}">${code}</text></g>`;
    })
    .join(
      "",
    )}</svg><div class="map-hud"><span class="live-dot"></span> GROUP NETWORK <span>${routes.length} VERBINDUNGEN</span></div><div class="map-controls"><button data-map="world" class="${mapRegion === "world" ? "active" : ""}" aria-label="Weltkarte">Welt</button><button data-map="europe" class="${mapRegion === "europe" ? "active" : ""}" aria-label="Europa vergrößern">Europa</button></div></div>`;
}
function financeChart() {
  const end = dayKey(gameNow()),
    days = Array.from(
      { length: 7 },
      (_, i) =>
        s.finance.days[end - 6 + i] || { at: (end - 6 + i) * DAY, revenue: 0 },
    );
  const max = Math.max(
    1,
    ...days.map((d) =>
      Math.max(
        d.revenue || 0,
        Math.abs(
          (d.fuel || 0) +
            (d.operations || 0) +
            (d.personnel || 0) +
            (d.overhead || 0) +
            (d.maintenance || 0) +
            (d.interest || 0),
        ),
      ),
    ),
  );
  return `<div class="bar-chart" role="img" aria-label="Einnahmen und Auszahlungen der letzten sieben Spieltage">${days
    .map((d) => {
      const cost = Math.abs(
        (d.fuel || 0) +
          (d.operations || 0) +
          (d.personnel || 0) +
          (d.overhead || 0) +
          (d.maintenance || 0) +
          (d.interest || 0),
      );
      return `<div class="bar-day"><div class="bar-pair"><div class="bar income" style="height:${Math.max(2, ((d.revenue || 0) / max) * 100)}%" title="Erlöse ${money(d.revenue || 0)}"></div><div class="bar expense" style="height:${Math.max(2, (cost / max) * 100)}%" title="Auszahlungen ${money(cost)}"></div></div><span>${dateLabel(d.at).replace(".", "")}</span></div>`;
    })
    .join(
      "",
    )}</div><div class="chart-legend"><span><i></i> Erlöse</span><span><i></i> Auszahlungen</span></div>`;
}
function flightBoard(limit = 7) {
  const routes = filteredRoutes()
    .slice()
    .sort((a, b) => a.next - b.next)
    .slice(0, limit);
  return `<div class="table-scroll"><table class="flight-board"><thead><tr><th>Zeit UTC</th><th>Flug / Strecke</th><th>Ziel</th><th>Muster</th><th>Status</th></tr></thead><tbody>${routes
    .map((r) => {
      const status = routeStatus(r);
      return `<tr data-route="${r.id}" tabindex="0" role="button"><td class="mono">${timeLabel(r.next)}</td><td><strong>${r.air} ${String(r.id + 100).padStart(3, "0")}</strong><small>${currentOrigin(r)} → ${currentDestination(r)}</small></td><td>${ap(currentDestination(r))[1]}</td><td>${types[r.type][0].replace("Airbus ", "").replace("Boeing ", "")}</td><td>${badge(status.label, status.tone)}</td></tr>`;
    })
    .join("")}</tbody></table></div>`;
}
function briefings() {
  const items = [],
    unassigned = fleetTotal() - s.routes.reduce((n, r) => n + r.count, 0),
    losses = s.routes.filter((r) => info(r).fullNet < 0),
    tech = s.fleet.filter((f) => f.condition < 75 && f.count > 0);
  if (s.cash < 200e6)
    items.push({
      icon: "alert",
      tone: "danger",
      title: "Liquidität unter Druck",
      text: "Investitionen pausieren und Kreditrahmen prüfen.",
      page: "finances",
    });
  if (losses.length)
    items.push({
      icon: "chart",
      tone: "amber",
      title: `${losses.length} Strecken unter Vollkosten`,
      text: "Preis, Muster und Kapazität zusammen prüfen.",
      page: "routes",
    });
  if (unassigned)
    items.push({
      icon: "fleet",
      tone: "blue",
      title: `${unassigned} Maschinen ohne Auftrag`,
      text: "Personal kostet auch am Boden. Einplanen oder verkaufen.",
      page: "fleet",
    });
  if (tech.length)
    items.push({
      icon: "settings",
      tone: "amber",
      title: `${tech.length} Muster mit Technikbedarf`,
      text: "Standzeiten frühzeitig einplanen.",
      page: "fleet",
    });
  if (s.market.weather)
    items.unshift({
      icon: "clock",
      tone: "amber",
      title: `Verzögerungen in ${s.market.weather.airport}`,
      text: s.market.weather.title,
      page: "routes",
    });
  if (!items.length)
    items.push({
      icon: "check",
      tone: "green",
      title: "Der Betrieb ist stabil",
      text: "Neue Märkte prüfen und Reserven aufbauen.",
      page: "new",
    });
  return items
    .slice(0, 3)
    .map(
      (item) =>
        `<button class="briefing" data-page="${item.page}"><span class="briefing-icon ${item.tone}">${icon(item.icon)}</span><span><strong>${item.title}</strong><small>${item.text}</small></span><span class="muted">›</span></button>`,
    )
    .join("");
}
function dashboard() {
  const sum = getSummary(),
    assigned = s.routes.reduce((n, r) => n + r.count, 0),
    forecast = s.routes.reduce((n, r) => n + info(r).dailyNet, 0);
  return `<section class="welcome"><div class="welcome-copy"><span class="eyebrow">THE LUFTHANSA GROUP. YOUR DECISIONS.</span><h2>Ein Netzwerk.<br>Unzählige Möglichkeiten.</h2><p>Verbinde Menschen. Führe die Gruppe.<br>Und halte den Betrieb profitabel.</p><button class="button yellow" data-page="new">Nächste Verbindung planen ${icon("arrow", 17)}</button></div><img src="assets/aircraft.svg" alt="Illustration eines Lufthansa-Langstreckenflugzeugs" class="hero-aircraft"><div class="hero-note"><span>GROUP OPERATIONS</span><strong>${Object.keys(brands).length} AIRLINES · ${s.routes.length} ROUTEN</strong></div></section>
 <div class="metrics">${metric("VERFÜGBARE LIQUIDITÄT", compact(s.cash), "Kreditrahmen separat unter Finanzen")}${metric("STRECKENPROGNOSE / TAG", compact(forecast), "Mit Nachtflugruhe · vor Technik & Zinsen", forecast < 0 ? "negative" : "")}${metric("FLOTTENEINSATZ", `${assigned}<em> / ${fleetTotal()}</em>`, "Geplante Maschinen · inklusive Bodenzeit")}${metric("BETRIEBSZUVERLÄSSIGKEIT", pct(s.reliability / 100), "Wird durch Ausfälle und Verspätungen beeinflusst")}</div>
 ${!s.introSeen ? `<section class="intro-strip"><span>${icon("book", 21)}</span><p><strong>Dein erster Tag im Operations Center.</strong><small>5 reale Minuten = 1 Spielstunde. Prüfe schwache Strecken, plane freie Maschinen ein und halte Liquidität zurück.</small></p><button class="text-button" data-page="academy">So führst du die Gruppe →</button><button class="icon-button" id="dismissIntro" aria-label="Einstiegshinweis ausblenden">×</button></section>` : ""}
 <div class="dashboard-grid"><section class="panel network-panel">${heading("NETWORK CONTROL", "Deine Welt. Deine Verbindungen.", "Das gemeinsame Netz der Lufthansa Group.", brandFilter())}${world()}<div class="map-legend">${Object.keys(
   brands,
 )
   .slice(0, 5)
   .map(
     (id) =>
       `<span><i style="background:${brands[id].color}"></i>${brands[id].name}</span>`,
   )
   .join(
     "",
   )}<button class="text-button" data-page="group">+3 Airlines →</button></div></section><section class="panel briefing-panel">${heading("DEIN BRIEFING", "Jetzt im Blick", "Entscheidungen, die den Unterschied machen.")}${briefings()}<div class="briefing-bottom"><span>${icon("fuel", 17)} Jet A-1</span><strong>${s.fuelPrice.toFixed(2).replace(".", ",")} € / l</strong><small>${(s.fuel / 1e6).toLocaleString("de-DE", { maximumFractionDigits: 1 })} Mio. Liter im Vorrat</small></div></section></div>
 <div class="dashboard-grid lower-grid"><section class="panel">${heading("FLIGHT OPERATIONS", "Die nächsten Bewegungen", "Spielzeit · UTC · automatische Umläufe", `<button class="text-button" data-page="routes">Alle Flüge ${icon("arrow", 15)}</button>`)}${flightBoard()}</section><section class="panel">${heading("FINANCIAL PERFORMANCE", "Die letzten 7 Spieltage", "Cashflow aus dem Flugbetrieb.")}<div class="chart-total ${sum.net < 0 ? "negative" : ""}">${compact(sum.net)}<small>Cashflow heute · laufender Spieltag</small></div>${financeChart()}<button class="button secondary full-width" data-page="finances">Finanzbericht öffnen ${icon("arrow", 16)}</button></section></div>
 <section class="panel group-strip">${heading("ONE GROUP. MANY STRENGTHS.", "Unsere Airlines", "Acht spielbare Gesellschaften. Ein gemeinsames Ziel.", `<button class="text-button" data-page="group">Konzern ansehen →</button>`)}<div class="airline-strip">${Object.entries(
   brands,
 )
   .map(
     ([id, b]) =>
       `<button data-page="group">${airlineMark(id)}<strong>${b.name}</strong><small>${b.hubs.join(" · ")}</small></button>`,
   )
   .join("")}</div></section>`;
}
function routeRows() {
  let routes = filteredRoutes().filter((r) =>
    (r.from + " " + r.to + " " + ap(r.to)[1] + " " + brands[r.air].name)
      .toLowerCase()
      .includes(routeSearch.toLowerCase()),
  );
  routes.sort(
    routeSort === "profit"
      ? (a, b) => info(a).dailyNet - info(b).dailyNet
      : routeSort === "load"
        ? (a, b) => info(a).competition.load - info(b).competition.load
        : (a, b) => a.from.localeCompare(b.from),
  );
  return routes.length
    ? `<div class="table-scroll"><table><thead><tr><th>Airline / Markt</th><th>Muster & Einsatz</th><th>Auslastung</th><th>Ticketpreis</th><th>Prognose / Tag</th><th>Status</th><th></th></tr></thead><tbody>${routes
        .map((r) => {
          const v = info(r),
            status = routeStatus(r);
          return `<tr><td><div class="airline-cell">${airlineMark(r.air)}<span><strong>${r.from} <span class="muted">↔</span> ${r.to}</strong><small>${ap(r.to)[1]} · ${brands[r.air].name}</small></span></div></td><td>${types[r.type][0]}<small>${r.count} Maschine${r.count > 1 ? "n" : ""} · ${SERVICES[r.service].name}</small></td><td><strong>${pct(v.competition.load)}</strong><span class="mini-track"><i style="width:${v.competition.load * 100}%"></i></span><small>${v.competition.rivals} Rivalen</small></td><td>${money(r.price)}</td><td class="${v.dailyNet < 0 ? "negative" : "positive"}"><strong>${compact(v.dailyNet)}</strong><small>Nach Personal & Fixkosten</small></td><td>${badge(status.label, status.tone)}<small>${timeLabel(r.next)} UTC</small></td><td><button class="button compact secondary" data-route="${r.id}" aria-label="${r.from} ${r.to} verwalten">Verwalten →</button></td></tr>`;
        })
        .join("")}</tbody></table></div>`
    : '<div class="empty">Keine passenden Strecken. Filter ändern oder eine neue Verbindung planen.</div>';
}
function routesPage() {
  return `<div class="page-intro">${heading("COMMERCIAL OPERATIONS", "Ein gutes Netz verdient Geld.", "Prüfe zuerst die verlustreichen Märkte. Die Prognose enthält Kraftstoff, Crew, Handling, Service sowie Personal- und Flottenfixkosten.", headerActions())}</div><section class="panel"><div class="toolbar"><label class="search-field">${icon("search", 17)}<input id="routeSearch" placeholder="Strecke, Stadt oder Airline suchen" value="${esc(routeSearch)}" aria-label="Strecken suchen"></label>${brandFilter()}<select id="routeSort" aria-label="Strecken sortieren"><option value="profit" ${routeSort === "profit" ? "selected" : ""}>Schwächste Prognose zuerst</option><option value="load" ${routeSort === "load" ? "selected" : ""}>Niedrigste Auslastung</option><option value="name" ${routeSort === "name" ? "selected" : ""}>Nach Abflughafen</option></select></div><div id="routeList">${routeRows()}</div></section>`;
}
function updateRouteList() {
  const node = document.querySelector("#routeList");
  if (node) {
    node.innerHTML = routeRows();
    adaptTables();
  }
}
function routeDetail() {
  const r = s.routes.find((r) => r.id === selectedRoute);
  if (!r)
    return `<section class="panel empty">Diese Strecke wurde geschlossen.<button data-page="routes" class="button primary">Zum Netz</button></section>`;
  const v = info(r),
    lane = AirlineMarket.lane(s.market, r.from, r.to),
    market = AirlineMarket.outcome(s.market, lane, s.routes, types),
    status = routeStatus(r);
  return `<button class="text-button back" data-page="routes">← Zurück zum Streckennetz</button><div class="route-title"><div>${airlineMark(r.air)}<span><span class="eyebrow">${brands[r.air].name}</span><h2>${r.from} <span>↔</span> ${r.to}</h2><p>${ap(r.from)[1]} – ${ap(r.to)[1]}</p></span></div>${badge(status.label, status.tone)}</div><div class="metrics">${metric("AUSLASTUNG", pct(v.competition.load), `${v.pax} Passagiere / Flug`)}${metric("DECKUNGSBEITRAG / FLUG", money(v.net), "Nach Kerosin, Handling, Crew und Service", v.net < 0 ? "negative" : "")}${metric("NACH PERSONAL / FLUG", money(v.fullNet), "Vor Technik, Zinsen und Investitionen", v.fullNet < 0 ? "negative" : "")}${metric("BREAK-EVEN-AUSLASTUNG", pct(v.breakEven), "Mit zugeordnetem Personal", v.breakEven > 1 ? "negative" : "")}</div><div class="two-columns"><section class="panel">${heading("ROUTE MANAGEMENT", "Deine Stellschrauben", "Änderungen gelten ab dem nächsten Start.")}<form id="routeEdit" class="form-grid"><label>Ticketpreis / Richtung (€)<input type="number" name="price" min="30" max="5000" value="${r.price}" required></label><label>Serviceprofil<select name="service">${Object.entries(
    SERVICES,
  )
    .map(
      ([id, p]) =>
        `<option value="${id}" ${r.service === id ? "selected" : ""}>${p.name} · ${p.cost} € pro Gast</option>`,
    )
    .join(
      "",
    )}</select></label><label>Zusätzlicher Bodenpuffer (Min.)<input type="number" name="buffer" min="0" max="120" value="${r.buffer}" required></label><div class="form-note">Premium erhöht die Attraktivität und die Kosten. Ein höherer Preis kann die Auslastung senken.</div><button class="button primary">Änderungen speichern</button></form><div class="danger-zone"><p>Strecke aufgeben? Die Maschinen kehren zuerst zum Ausgangshub zurück. Es gibt keinen sofortigen Verkauf aus einem laufenden Flug.</p><button class="button danger" data-close="${r.id}" ${r.retiring ? "disabled" : ""}>${r.retiring ? "Rückführung läuft" : "Strecke geordnet schließen"}</button></div></section><section class="panel">${heading("FLIGHT ECONOMICS", "Die Rechnung pro Flug", "Aktuelle Nachfrage, ein Flugzeug, eine Richtung.")}<dl class="cost-list"><div><dt>Ticketumsatz</dt><dd>${money(v.rev)}</dd></div><div><dt>Jet A-1 · ${num(v.fuel)} l</dt><dd>− ${money(v.fuel * s.fuelPrice)}</dd></div><div><dt>Flughafen, Crew & Service</dt><dd>− ${money(v.other)}</dd></div><div><dt>Personal & Flottenfixkosten</dt><dd>− ${money(v.allocated)}</dd></div><div class="total"><dt>Nach Personal & Fixkosten</dt><dd class="${v.fullNet < 0 ? "negative" : "positive"}">${money(v.fullNet)}</dd></div></dl><div class="detail-grid"><div><small>Entfernung</small><strong>${num(v.d)} km</strong></div><div><small>Blockzeit</small><strong>${duration(r.duration)}</strong></div><div><small>Mindestbodenzeit</small><strong>${turnMinutes(r.type)} + ${r.buffer} Min.</strong></div><div><small>CO₂ / Flug</small><strong>${v.co2.toFixed(1)} t</strong></div></div></section></div><section class="panel section">${heading("MARKET INTELLIGENCE", "Wer fliegt noch mit?", "Alle Angebote teilen sich den begrenzten Nachfragemarkt.")}<div class="table-scroll"><table><thead><tr><th>Anbieter</th><th>Preis</th><th>Auslastung</th><th>Marktanteil</th></tr></thead><tbody>${market.players.map((o) => `<tr><td>${brands[s.routes.find((r) => r.id === o.id).air].name} ${badge("Eigene Gruppe", "blue")}</td><td>${money(o.price)}</td><td>${pct(o.pax / o.cap)}</td><td>${pct(o.pax / market.demand)}</td></tr>`).join("")}${market.rivals.map((o) => `<tr><td>${AirlineMarket.profiles[o.id].name}</td><td>${money(o.price)}</td><td>${pct(o.pax / o.cap)}</td><td>${pct(o.pax / market.demand)}</td></tr>`).join("")}</tbody></table></div></section>`;
}
function newRoute() {
  return `<div class="page-intro">${heading("NETWORK PLANNING", "Aus einer Idee wird eine Verbindung.", "Erst rechnen. Dann starten. Neue Strecken kosten einmalig 250.000 € für Station und Vertrieb.")} </div><div class="planner-layout"><section class="panel"><div class="step-label"><b>01</b> Markt & Airline</div><form id="routeForm" class="form-grid"><label>Airline<select name="air">${airlineOptions("LH", false)}</select></label><label>Ausgangshub<select name="from">${brands.LH.hubs.map((c) => `<option value="${c}">${c} · ${ap(c)[1]}</option>`).join("")}</select></label><label>Ziel<select name="to">${airports
    .filter((a) => a[0] !== "FRA")
    .map(
      (a) =>
        `<option value="${a[0]}" ${a[0] === "LHR" ? "selected" : ""}>${a[0]} · ${a[1]}</option>`,
    )
    .join(
      "",
    )}</select></label><div class="step-label span-2"><b>02</b> Flugzeug & Angebot</div><label>Flugzeugmuster<select name="type">${types.map((t, i) => `<option value="${i}" ${i === 2 ? "selected" : ""}>${t[0]} · ${t[1]} Sitze</option>`).join("")}</select></label><label>Maschinen<input type="number" name="count" min="1" max="100" value="1" required></label><label>Ticketpreis / Richtung (€)<input type="number" name="price" min="30" max="5000" value="180" required></label><label>Serviceprofil<select name="service">${Object.entries(
    SERVICES,
  )
    .map(
      ([id, p]) =>
        `<option value="${id}">${p.name} · ${p.cost} € / Gast</option>`,
    )
    .join(
      "",
    )}</select></label><label>Tägliches Umlaufziel<select name="frequency"><option value="0">Fortlaufend · maximale Nutzung</option>${[1, 2, 3, 4, 6].map((n) => `<option value="${n}">${n} Hin- und Rückflug${n > 1 ? "paare" : "paar"} / Tag</option>`).join("")}</select></label><label>Bodenpuffer (Minuten)<input name="buffer" type="number" min="0" max="120" value="15" required></label><div class="span-2 form-note">Die Mindestbodenzeit kommt zum Puffer hinzu. Nachtflugruhe und Technik können den tatsächlichen Flugplan verlängern. Reichweite wird mit 5 % Planungsreserve geprüft.</div><div id="estimateMessage" class="span-2"></div><button class="button primary span-2" id="openRoute">${icon("plus", 17)} Verbindung eröffnen · 250.000 €</button></form></section><aside><section class="panel estimate-panel">${heading("LIVE ROUTE CHECK", "Passt die Rechnung?", "Modellwoche mit Nachtflugruhe · aktuelles Marktangebot.")}<div id="estimate"></div></section><section class="panel section"><span class="eyebrow">DIE RICHTIGE MASCHINE</span><h3>Vergleiche, bevor du bindest.</h3><p class="sub">Ein kleineres Flugzeug mit guter Auslastung kann mehr verdienen als ein halb leerer Großraumjet.</p><div id="aircraftComparison"></div></section></aside></div>`;
}
function updateEstimate() {
  const form = document.querySelector("#routeForm");
  if (!form) return;
  const data = new FormData(form),
    type = Number(data.get("type")),
    from = data.get("from"),
    to = data.get("to"),
    count = Number(data.get("count")),
    price = Number(data.get("price"));
  const message = document.querySelector("#estimateMessage"),
    result = validateRoute(data);
  message.innerHTML = result.error
    ? `<div class="inline-warning">${icon("alert", 16)} ${esc(result.error)}</div>`
    : "";
  const button = document.querySelector("#openRoute");
  button.disabled = !!result.error;
  if (
    !ap(from) ||
    !ap(to) ||
    !types[type] ||
    from === to ||
    !Number.isFinite(price) ||
    price <= 0
  ) {
    document.querySelector("#estimate").innerHTML =
      '<p class="empty">Wähle einen Markt und ein verfügbares Muster für die Prognose.</p>';
    document.querySelector("#aircraftComparison").innerHTML = "";
    return;
  }
  const distance = km(ap(from), ap(to)),
    r = {
      air: data.get("air"),
      from,
      to,
      type,
      count: Math.max(1, count),
      price,
      duration: blockTime(distance, type),
      service: data.get("service"),
      buffer: Number(data.get("buffer")),
      frequency: Number(data.get("frequency")),
      turnMinutes: turnMinutes(type),
    },
    v = info(r);
  document.querySelector("#estimate").innerHTML =
    `<div class="estimate-route">${from}<span>→</span>${to}</div><span class="sub">${num(distance)} km · ${duration(r.duration)} Blockzeit</span><div class="estimate-profit ${v.dailyNet < 0 ? "negative" : "positive"}">${compact(v.dailyNet)}<small>pro Spieltag · nach Personal & Fixkosten</small></div><dl class="cost-list"><div><dt>Auslastung</dt><dd>${pct(v.competition.load)}</dd></div><div><dt>Passagiere pro Flug</dt><dd>${v.pax} / ${types[type][1]}</dd></div><div><dt>Break-even-Auslastung</dt><dd>${pct(v.breakEven)}</dd></div><div><dt>Rivalen im Markt</dt><dd>${v.competition.rivals}</dd></div><div><dt>Freie Maschinen</dt><dd>${free(r.air, type)}</dd></div><div><dt>Kerosin / Flug</dt><dd>${num(v.fuel)} l</dd></div></dl><div class="form-note">${v.fullNet < 0 ? "Die Strecke deckt aktuell ihre Vollkosten nicht. Preis, Kapazität oder Muster ändern." : "Die Prognose ist positiv. Nachfrage und Kerosinpreis können sich ändern."}</div>`;
  const candidates = s.fleet
    .filter(
      (f) =>
        f.air === r.air &&
        free(f.air, f.type) > 0 &&
        types[f.type][2] * 0.95 >= distance,
    )
    .map((f) => {
      const alt = {
        ...r,
        type: f.type,
        count: 1,
        duration: blockTime(distance, f.type),
        turnMinutes: turnMinutes(f.type),
        frequency: 0,
      };
      return { f, v: info(alt) };
    })
    .sort((a, b) => b.v.dailyNet - a.v.dailyNet)
    .slice(0, 4);
  document.querySelector("#aircraftComparison").innerHTML = candidates.length
    ? candidates
        .map(
          ({ f, v }) =>
            `<div class="comparison-row"><div><strong>${types[f.type][0]}</strong><small>${free(f.air, f.type)} frei · ${pct(v.competition.load)} Auslastung</small></div><b class="${v.dailyNet < 0 ? "negative" : "positive"}">${compact(v.dailyNet)}<small>/ Tag</small></b></div>`,
        )
        .join("")
    : '<p class="empty">Keine freie Maschine mit ausreichender Reichweite.</p>';
}
function aircraftDetails(f) {
  return `<details data-fleet="${f.id}"><summary>Einzelne Flugzeuge <span>${f.count}</span></summary><div class="table-scroll"><table class="airframe-table"><thead><tr><th>Kennung</th><th>Einsatz / Position</th><th>Verkaufswert</th><th></th></tr></thead><tbody>${aircraftAssignments(
    f,
  )
    .map(({ tail, route: r }) => {
      let location = `Geparkt · ${brands[f.air].hub}`;
      if (f.maintenanceUntil > gameNow())
        location = `Technik bis ${timeLabel(f.maintenanceUntil)} UTC`;
      else if (r)
        location =
          r.phase === "flight"
            ? `${currentOrigin(r)} → ${currentDestination(r)} · im Flug`
            : r.phase === "curfew"
              ? `Nachtflugruhe · ${currentOrigin(r)}`
              : `Bodenabfertigung · ${currentOrigin(r)}`;
      return `<tr><td class="mono">${tail}</td><td>${location}</td><td>${money(saleValue(f))}</td><td><button class="button compact secondary" data-sell="${tail}" ${r || f.maintenanceUntil > gameNow() ? "disabled" : ""}>Verkaufen</button></td></tr>`;
    })
    .join("")}</tbody></table></div></details>`;
}
const failedFleetImages = new Set();
function fleetImage(f) {
  const exact = AIRCRAFT_IMAGES[`${f.air}-${f.type}`];
  const reference =
    exact ||
    Object.values(AIRCRAFT_IMAGES).find((image) => image.type === f.type);
  const fallback = `assets/aircraft-${f.air.toLowerCase()}.svg`;
  const unavailable = !reference || failedFleetImages.has(reference.image);
  const label = exact
    ? `${brands[f.air].name} · ${types[f.type][0]}`
    : reference
      ? `${types[f.type][0]} · Typreferenz ${brands[reference.air].name}`
      : `${types[f.type][0]} · Symbolabbildung`;
  return `<figure class="fleet-image ${unavailable ? "is-fallback" : ""}"><div class="fleet-image-frame"><img class="aircraft-image" src="${esc(unavailable ? fallback : reference.image)}" alt="${esc(unavailable ? "Schematische Ersatzabbildung für " + types[f.type][0] : label)}" width="1200" height="480" loading="lazy" decoding="async" referrerpolicy="no-referrer" data-aircraft-image data-fallback="${fallback}" data-original="${esc(reference?.image || "")}"></div><figcaption><span class="fleet-image-label">${unavailable ? "Symbolabbildung · Originalbild nicht verfügbar" : exact ? "Originalabbildung · " + brands[f.air].name : "Typreferenz · " + brands[reference.air].name}</span>${reference ? `<a href="${esc(reference.source)}" target="_blank" rel="noopener noreferrer" aria-label="Bildquelle für ${esc(types[f.type][0])} bei ${esc(brands[reference.air].name)} öffnen">Bildquelle ↗</a>` : ""}</figcaption></figure>`;
}
// A blocked or unavailable external asset must never break fleet management.
app.addEventListener(
  "error",
  (event) => {
    const image = event.target;
    if (
      !image.matches?.("img[data-aircraft-image]") ||
      image.dataset.fallbackApplied
    )
      return;
    image.dataset.fallbackApplied = "true";
    if (image.dataset.original) failedFleetImages.add(image.dataset.original);
    image.src = image.dataset.fallback;
    image.alt =
      "Schematische Ersatzabbildung; Originalbild derzeit nicht verfügbar";
    const figure = image.closest(".fleet-image");
    figure?.classList.add("is-fallback");
    const label = figure?.querySelector(".fleet-image-label");
    if (label)
      label.textContent = "Symbolabbildung · Originalbild nicht verfügbar";
  },
  true,
);
function fleetCards() {
  const fleet = s.fleet.filter(
    (f) =>
      f.count > 0 &&
      (filter === "all" || f.air === filter) &&
      (types[f.type][0] + " " + brands[f.air].name)
        .toLowerCase()
        .includes(fleetSearch.toLowerCase()),
  );
  return fleet.length
    ? fleet
        .map((f) => {
          const available = free(f.air, f.type),
            t = types[f.type],
            tech = f.maintenanceUntil > gameNow();
          return `<article class="fleet-card"><div class="fleet-card-top"><div>${airlineMark(f.air)}<span><small>${brands[f.air].name}</small><h3>${t[0]}</h3></span></div>${badge(tech ? "Technik-Check" : f.maintenancePending ? "Check geplant" : "Im Bestand", tech || f.maintenancePending ? "amber" : "neutral")}</div>${fleetImage(f)}<div class="fleet-aircraft-spec">${t[1]} PAX <span>·</span> ${num(t[2])} KM REICHWEITE</div><div class="fleet-data"><div><strong>${f.count}</strong><small>im Bestand</small></div><div><strong>${available}</strong><small>frei</small></div><div><strong class="${f.condition < 75 ? "negative" : ""}">${pct(f.condition / 100)}</strong><small>Zustand</small></div></div><div class="condition-track"><i style="width:${f.condition}%"></i></div><div class="fleet-card-actions"><span>${tech ? "Freigabe " + timeLabel(f.maintenanceUntil) + " UTC" : "4 Std. Technik-Standzeit"}</span><button class="text-button" data-maintain="${f.id}" ${tech || f.maintenancePending ? "disabled" : ""}>Check · ca. ${compact(Math.ceil((100 - f.condition) * f.count * 2200))} →</button></div>${aircraftDetails(f)}</article>`;
        })
        .join("")
    : '<div class="empty">Keine passenden Flugzeuge.</div>';
}
function fleetPage() {
  return `<div class="page-intro">${heading("FLEET & TECHNIK", "Die Flotte ist dein Kapital.", "Freie Maschinen kosten ebenfalls Personal. Neue Muster binden Kapital; Technik bindet Zeit.")}</div><div class="metrics">${metric("MASCHINEN", fleetTotal(), "Szenarioflotte · modellierte Bestände")}${metric("FREI VERFÜGBAR", fleetTotal() - s.routes.reduce((n, r) => n + r.count, 0), "Ohne Streckenauftrag")}${metric(
    "BEI DER TECHNIK",
    s.fleet
      .filter((f) => f.maintenanceUntil > gameNow())
      .reduce((n, f) => n + f.count, 0),
    "Keine Abflüge während des Checks",
  )}${metric(
    "OFFENE BESTELLUNGEN",
    s.orders.reduce((n, o) => n + o.count, 0),
    "Auslieferung nach Spielzeit",
  )}</div><div class="toolbar"><label class="search-field">${icon("search", 17)}<input id="fleetSearch" placeholder="Muster oder Airline suchen" value="${esc(fleetSearch)}" aria-label="Flotte suchen"></label>${brandFilter()}</div><div class="fleet-grid" id="fleetList">${fleetCards()}</div><section class="panel section">${heading("FLEET PROCUREMENT", "Kapazität mit Perspektive.", "Gebraucht: 1 Spieltag und 84 % Zustand. Neu: 7–14 Spieltage. Jede Musterfamilie je Airline bindet 12.000 € Strukturkosten pro Tag.")}<form id="orderForm" class="procurement-form"><label>Airline<select name="air">${airlineOptions("LH", false)}</select></label><label>Muster<select name="type">${types.map((t, i) => `<option value="${i}">${t[0]} · ${t[4]} Mio. € neu</option>`).join("")}</select></label><label>Beschaffung<select name="purchase"><option value="used">Gebraucht · 72 % Neupreis</option><option value="new">Neu · Listen-Spielpreis</option></select></label><label>Anzahl<input name="count" type="number" min="1" max="20" value="1" required></label><button class="button primary">Verbindlich bestellen</button></form>${s.orders.map((o) => `<div class="order-row"><span>${airlineMark(o.air)} ${o.count} × ${types[o.type][0]}</span><span>Lieferung in ${duration(o.at - gameNow())} Spielzeit</span></div>`).join("")}</section>`;
}
function updateFleetList() {
  const node = document.querySelector("#fleetList");
  if (node) {
    node.innerHTML = fleetCards();
    adaptTables();
  }
}
function financesPage() {
  const sum = getSummary(7),
    operating = [
      "revenue",
      "fuel",
      "operations",
      "personnel",
      "overhead",
      "maintenance",
      "interest",
    ],
    names = {
      revenue: "Flugerlöse",
      fuel: "Kerosineinkauf",
      operations: "Flughäfen, Crew, Handling & Service",
      personnel: "Personal & Konzernstruktur",
      overhead: "Flotte, Versicherung & Infrastruktur",
      maintenance: "Technik-Checks",
      interest: "Zinsen",
      investment: "Flugzeugkäufe",
      disposal: "Flugzeugverkäufe",
      financing: "Finanzierung",
    };
  return `<div class="page-intro">${heading("GROUP FINANCE", "Wachstum braucht Reserven.", "Cash-basierte Berichte. Kerosineinkäufe belasten den Cashflow sofort; die Streckenrechnung bewertet den Verbrauch.")}</div><div class="metrics">${metric("LIQUIDITÄT", compact(s.cash), "Verfügbares Bankguthaben")}${metric("OPERATIVER CASHFLOW · 7 TAGE", compact(sum.net), "Ohne Käufe, Verkäufe und Finanzierung", sum.net < 0 ? "negative" : "")}${metric("KREDIT IN ANSPRUCH", compact(s.finance.debt), "8 % p.a. · 250 Mio. € Kreditlinie")}${metric("PERSONAL & STRUKTUR / TAG", compact(staffCost()), `${num(fleetTotal() * 105)} modellierte Stellen im Spielbetrieb`)}</div><div class="two-columns"><section class="panel">${heading("CASHFLOW REPORT", "Die letzten 7 Spieltage", "Inklusive des laufenden Spieltags.")}<dl class="cost-list">${operating.map((k) => `<div><dt>${names[k]}</dt><dd class="${sum[k] < 0 ? "negative" : "positive"}">${money(sum[k])}</dd></div>`).join("")}<div class="total"><dt>Operativer Cashflow</dt><dd class="${sum.net < 0 ? "negative" : "positive"}">${compact(sum.net)}</dd></div></dl><p class="sub">Technik, Personal, Zinsen und ausgefallene Flüge machen eine gute Ticketmarge noch nicht zu einem guten Konzernergebnis.</p></section><section class="panel">${heading("TREASURY", "Finanzielle Bewegungsfreiheit", "Kredit schafft Zeit, ersetzt aber keine profitablen Strecken.")}<form id="loanForm" class="form-grid"><label>Aktion<select name="operation"><option value="borrow">Kredit aufnehmen</option><option value="repay">Kredit zurückzahlen</option></select></label><label>Betrag in Mio. €<input type="number" name="amount" min="1" max="250" step="1" value="25" required></label><button class="button primary span-2">Finanzierung ausführen</button></form><div class="section">${financeChart()}</div></section></div><section class="panel section">${heading("AUDIT TRAIL", "Jede Entscheidung hat eine Buchung.", "Die letzten 60 Kontobewegungen.")}<div class="table-scroll"><table><thead><tr><th>Spielzeit UTC</th><th>Kategorie</th><th>Buchung</th><th>Betrag</th></tr></thead><tbody>${
    s.finance.ledger
      .slice(0, 60)
      .map(
        (e) =>
          `<tr><td class="mono">${dateLabel(e.at)} ${timeLabel(e.at)}</td><td>${names[e.category] || e.category}</td><td>${esc(e.text)}</td><td class="${e.amount < 0 ? "negative" : "positive"}">${money(e.amount)}</td></tr>`,
      )
      .join("") ||
    '<tr><td colspan="4">Buchungen erscheinen mit den ersten Betriebsvorgängen.</td></tr>'
  }</tbody></table></div></section>`;
}
function fuelPage() {
  const dayFuel = s.routes.reduce(
    (n, r) => n + (info(r).fuel * r.count * DAY) / cycle(r),
    0,
  );
  return `<div class="page-intro">${heading("RESOURCE MANAGEMENT", "Der Betrieb braucht Energie.", "Ein gemeinsamer Vorrat für die Gruppe. Der Spielpreis schwankt mit der simulierten Marktlage.")}</div><div class="metrics">${metric("JET A-1 IM VORRAT", (s.fuel / 1e6).toLocaleString("de-DE", { maximumFractionDigits: 2 }) + " Mio. l", "Verbrauch wird beim Abflug abgezogen")}${metric("AKTUELLER EINKAUFSPREIS", s.fuelPrice.toFixed(2).replace(".", ",") + " € / l", "Alle 6 Spielstunden aktualisiert")}${metric("GEPLANTE REICHWEITE", duration((s.fuel / Math.max(1, dayFuel)) * DAY), "Nach aktueller Umlaufplanung · ohne Nachtflugruhe")}${metric("AUTOMATISCHER EINKAUF", s.automation.fuel ? "Aktiv" : "Aus", "100 Mio. € Liquiditätsreserve bleiben stehen")}</div><div class="two-columns"><section class="panel">${heading("FUEL PROCUREMENT", "Versorgung sichern", "Einmalig einkaufen oder den Dauerbetrieb nutzen.")}<form id="fuelForm" class="form-grid"><label class="span-2">Menge in Litern<input type="number" name="liters" min="1000" step="1000" value="1000000" required></label><button class="button primary">Zum Marktpreis kaufen</button></form></section><section class="panel">${heading("AUTOMATION", "Deine Leitplanken", "Automatik verhindert keinen Verlustbetrieb.")} ${automationControls()}</section></div>`;
}
function marketPage() {
  return `<div class="page-intro">${heading("COMPETITIVE INTELLIGENCE", "Der Markt gehört niemandem.", "Zehn lokale KI-Airlines. Keine Kaufvorteile, Premiumwährung oder bezahlten Beschleuniger.")}</div><div class="market-banner"><span>${icon("clock")} Nächste Marktreaktion in ${duration(s.market.next - gameNow())} Spielzeit</span><span>${s.market.round} Marktrunden · jeden Spieltag Investitionsentscheidungen</span></div><section class="panel">${heading("COMPETITOR DEVELOPMENT", "Wachstum muss verdient werden.", "Zusammengefasste Flugumläufe mit Erlösen, Kosten und begrenzten Flotten.")}<div class="table-scroll"><table><thead><tr><th>Airline</th><th>Flotte</th><th>Wachstum</th><th>Märkte</th><th>Flüge gesamt</th><th>Ergebnis / Spieltag</th><th>Liquidität</th></tr></thead><tbody>${s.market.companies
    .slice()
    .sort((a, b) => b.lastProfit - a.lastProfit)
    .map(
      (c, i) =>
        `<tr><td><span class="rank">${String(i + 1).padStart(2, "0")}</span><strong>${AirlineMarket.profiles[c.id].name}</strong></td><td>${c.fleet}</td><td class="positive">+${c.purchased}</td><td>${s.market.lanes.filter((l) => l.rivals.some((r) => r.id === c.id)).length}</td><td>${num(c.flights)}</td><td class="${c.lastProfit < 0 ? "negative" : "positive"}">${compact(c.lastProfit)}</td><td>${compact(c.cash)}</td></tr>`,
    )
    .join(
      "",
    )}</tbody></table></div></section><div class="two-columns section"><section class="panel">${heading("MARKET WIRE", "Bewegung im Wettbewerb", "Angebote und Investitionen aus deiner Spielwelt.")}<div class="event-feed">${
    s.market.events
      .slice(0, 12)
      .map(
        (e) =>
          `<div><span class="event-dot"></span><p>${esc(e.text)}<small>${dateLabel(e.time)} · ${timeLabel(e.time)} UTC</small></p></div>`,
      )
      .join("") ||
    '<p class="empty">Die Startangebote sind platziert. Erste Reaktionen folgen nach sechs Spielstunden.</p>'
  }</div></section><section class="panel">${heading("DEIN WETTBEWERBSVORTEIL", "Besser entscheiden.", "Statt einfach nur billiger zu sein.")}<div class="advice"><b>01</b><p><strong>Kapazität ist kein Selbstzweck.</strong><span>Ein zusätzlicher Flieger teilt sich die vorhandene Nachfrage mit allen anderen Anbietern.</span></p></div><div class="advice"><b>02</b><p><strong>Premium muss sich rechnen.</strong><span>Guter Service macht dein Angebot attraktiver, kostet aber pro Gast zusätzlich.</span></p></div><div class="advice"><b>03</b><p><strong>Die Gruppe kann sich kannibalisieren.</strong><span>Mehrere Group-Airlines auf demselben Markt konkurrieren ebenfalls um Reisende. Ein vollständiges Umsteigernetz wird noch nicht berechnet.</span></p></div><button class="button secondary full-width" data-page="routes">Eigene Märkte prüfen →</button></section></div>`;
}
function groupPage() {
  return `<div class="page-intro">${heading("THE LUFTHANSA GROUP", "Viele Identitäten. Eine Verantwortung.", "Die spielbaren Gesellschaften und ihre jeweiligen Basen. Bestände und Strecken sind ein verdichtetes Spielszenario.")}</div><div class="group-grid">${Object.entries(
    brands,
  )
    .map(([id, b]) => {
      const fleet = s.fleet
          .filter((f) => f.air === id)
          .reduce((n, f) => n + f.count, 0),
        routes = s.routes.filter((r) => r.air === id),
        profit = routes.reduce((n, r) => n + info(r).dailyNet, 0);
      return `<section class="panel airline-profile" style="--air:${b.color}"><div>${airlineMark(id)}<span class="eyebrow">${b.country}</span></div><h2>${b.name}</h2><p>${b.role}</p><div class="hub-tags">${b.hubs.map((h) => `<span>${h} <small>${ap(h)[1]}</small></span>`).join("")}</div><div class="profile-stats"><span><strong>${fleet}</strong> Maschinen</span><span><strong>${routes.length}</strong> Märkte</span></div><div class="profile-profit ${profit < 0 ? "negative" : "positive"}">${compact(profit)}<small>Streckenprognose / Spieltag nach Personal & Fixkosten</small></div></section>`;
    })
    .join(
      "",
    )}</div><section class="panel section"><h3>Das Szenario bleibt bewusst auf die Group konzentriert.</h3><p class="sub">ITA Airways ist eine Konzernbeteiligung und in diesem Szenario nicht separat steuerbar. Lufthansa City Airlines und CityLine sind im Lufthansa-Betrieb zusammengefasst. Lufthansa Cargo und Lufthansa Technik sind keine eigenständigen Profitcenter im Spiel. Die Technik-Checks bilden Werkstattkosten und Standzeiten vereinfacht ab.</p></section>`;
}
function automationControls() {
  return `<div class="automation-row"><span><strong>Automatischer Kerosinkauf</strong><small>Bei weniger als einem halben Tag Vorrat auf einen Tag auffüllen.</small></span><button class="toggle ${s.automation.fuel ? "on" : ""}" data-auto="fuel" role="switch" aria-checked="${s.automation.fuel}" aria-label="Automatischer Kerosinkauf"><i></i></button></div><div class="automation-row"><span><strong>Technik automatisch planen</strong><small>Unter 72 % Zustand: laufende Flüge landen, dann vier Stunden Check.</small></span><button class="toggle ${s.automation.maintenance ? "on" : ""}" data-auto="maintenance" role="switch" aria-checked="${s.automation.maintenance}" aria-label="Automatische Wartung"><i></i></button></div><p class="form-note">Beide Automatiken lassen 100 Mio. € Reserve. Personal und Zinsen laufen weiter. Bei fehlendem Geld können Flugzeuge trotz Automatik am Boden bleiben.</p>`;
}
function settings() {
  return `<div class="page-intro">${heading("SIMULATION & SAVE", "Deine Spielwelt. Dein Rhythmus.", "Alles bleibt lokal in diesem Browser. Ein Export schützt vor gelöschten Browserdaten.")}</div><div class="two-columns"><section class="panel">${heading("DAUERBETRIEB", "Weiterfliegen. Auch ohne dich.", "Feste Spieluhr: 12× · ein Spieltag in zwei realen Stunden.")}<p class="sub">Der Browser rechnet bei deiner Rückkehr die vergangene Zeit nach. Es läuft kein Server im Hintergrund. Alle Airlines nutzen dieselbe Spieluhr; Nachtflugruhe und Technik gelten auch während deiner Abwesenheit.</p>${automationControls()}</section><section class="panel">${heading("SPIELSTAND", "Die Verantwortung liegt bei dir.", "Exportiere regelmäßig eine Sicherung.")}<div class="save-actions"><button class="button primary" id="export">Spielstand exportieren</button><label class="button secondary file-label">Sicherung importieren<input type="file" id="import" accept="application/json" hidden></label></div><div class="danger-zone"><p>Ein Neustart ersetzt den aktuellen Spielstand durch das neue Group-Szenario. Exportiere vorher, wenn du ihn behalten möchtest.</p><button class="button danger" id="reset">Neues Szenario beginnen</button></div></section></div><section class="panel section">${heading("WAS DAS SPIEL MODELLIERT", "Transparent statt scheinbar exakt.", "Ein anspruchsvoller Airline-Manager, kein zertifiziertes Flugbetriebssystem.")}<p class="sub">Blockzeiten, Reichweitenreserve, Bodenzeiten, Nachtflugruhe in FRA/MUC/ZRH, Technikstandzeiten, endliche Nachfrage und Konkurrenz sind berücksichtigt. Crew-Rotationen, individuelle Slots, vollständige Umsteigeverbindungen, echte Wetterdaten, Kabinenklassen und Bilanzabschreibungen werden noch nicht einzeln simuliert. Flüge einer Strecke und der Technikzustand eines Musters werden gruppiert verwaltet. Ein offener zweiter Tab kann Spielstände überschreiben; nutze einen aktiven Spieltab.</p></section>`;
}
function academyPage() {
  return `<div class="page-intro">${heading("MANAGEMENT ACADEMY", "Die Gruppe zu führen, ist eine Entscheidungskette.", "Keine bezahlten Vorteile. Du gewinnst mit guter Planung, nicht mit Klickgeschwindigkeit.")}</div><div class="academy-grid">${[
    [
      "01",
      "Erst den Betrieb verstehen.",
      "In der Abflugtafel siehst du die nächsten Starts und Landungen. Ein Flugplan wiederholt sich automatisch. 45–120 Minuten Bodenzeit plus dein Puffer liegen zwischen den Flügen. Nachtflugruhe kann einen Umlauf bis zum Morgen verschieben.",
    ],
    [
      "02",
      "Nachfrage ist endlich.",
      "Du teilst sie mit Rivalen und anderen Airlines deiner Gruppe. Billigere Tickets verkaufen sich besser, können aber unter den Kosten liegen. Ein leerer Sitz ist nicht automatisch ein Grund, noch billiger zu werden.",
    ],
    [
      "03",
      "Deckungsbeitrag ist nicht Gewinn.",
      "Die Streckenrechnung trennt Ticketumsatz, Verbrauch, variable Kosten und Personal. Technik und Zinsen kommen auf Konzernebene hinzu. Prüfe den Finanzbericht, nicht nur die Auslastung.",
    ],
    [
      "04",
      "Standzeit bewusst planen.",
      "Mehr Flüge nutzen eine Maschine besser aus. Zu enge Pläne lassen wenig Spielraum. Technik braucht vier Stunden, Nachtflugruhe ist verbindlich. Ein höheres Umlaufziel ist nur erlaubt, wenn Flug- und Bodenzeit hineinpassen.",
    ],
    [
      "05",
      "Kapital nicht auf dem Vorfeld parken.",
      "Unbeschäftigte Flugzeuge verursachen weiterhin Personalkosten. Unter Flotte kannst du freie Maschinen verkaufen. Beim Aufgeben einer Strecke kehren gebundene Maschinen erst zum Ausgangshub zurück.",
    ],
    [
      "06",
      "Nicht jeder Markt passt zu jedem Muster.",
      "Nutze im Planer den Flugzeugvergleich. Ein effizienter A320neo kann auf kurzen Strecken besser passen als ein A350. Auf langen Strecken zählen Reichweite, Verbrauch und genügend Nachfrage.",
    ],
  ]
    .map(
      ([n, title, text]) =>
        `<section class="panel academy-card"><span>${n}</span><h3>${title}</h3><p>${text}</p></section>`,
    )
    .join(
      "",
    )}</div><section class="panel section">${heading("DESIGN & RECHERCHE", "Von Airline-Managern lernen. Für die Group denken.", "Eigenständige Gestaltung und Umsetzung; keine übernommenen Spielgrafiken oder Programmteile.")}<p class="sub">Die offiziellen Handbücher von <a href="https://handbook.airlinesim.aero/en/docs/user-interface/operations-tab/" target="_blank" rel="noopener">AirlineSim</a> und die Spielbeschreibung von <a href="https://www.airwaysim.com/About" target="_blank" rel="noopener">AirwaySim</a> dienten als Referenzen für Planung, Technik, Flottenvergleich und Kostenklarheit. Die spielbaren Airline-Marken orientieren sich am <a href="https://business.lufthansagroup.com/gb/en/program/experts/route-network.html" target="_blank" rel="noopener">Lufthansa-Group-Netzwerk</a>. Kartengeometrie: Natural Earth, Public Domain.</p></section>`;
}
const PAGES = {
  dashboard: ["Operations Center", "Übersicht"],
  routes: ["Streckennetz", "Netzwerk"],
  route: ["Streckensteuerung", "Netzwerk"],
  new: ["Streckenplanung", "Netzwerk"],
  fleet: ["Flotte & Technik", "Flugbetrieb"],
  finances: ["Finanzen", "Konzern"],
  fuel: ["Kerosin & Betrieb", "Flugbetrieb"],
  market: ["Wettbewerb", "Markt"],
  group: ["Die Lufthansa Group", "Konzern"],
  academy: ["Management Academy", "Wissen"],
  settings: ["Spielstand & Dauerbetrieb", "System"],
};
let lastRenderedPage = null;
function mobileNavigation() {
  const primary = [
    ["dashboard", "dashboard", "Übersicht", "Operations Center"],
    ["routes", "network", "Netz", "Streckennetz"],
    ["new", "plus", "Planen", "Strecke planen"],
    ["fleet", "fleet", "Flotte", "Flotte & Technik"],
  ];
  const secondary = [
    ["finances", "chart", "Finanzen"],
    ["fuel", "fuel", "Kerosin & Betrieb"],
    ["market", "chart", "Wettbewerb"],
    ["group", "group", "Lufthansa Group"],
    ["academy", "book", "Management Academy"],
    ["settings", "settings", "Spielstand & Dauerbetrieb"],
  ];
  return `<nav class="mobile-nav" aria-label="Handynavigation">${primary.map(([id, i, short, label]) => `<button data-page="${id}" aria-label="${label}" class="${page === id || (id === "routes" && page === "route") ? "active" : ""}" ${page === id ? 'aria-current="page"' : ""}>${icon(i, 21)}<span>${short}</span></button>`).join("")}<button id="openMobileMenu" aria-label="Weitere Bereiche" aria-haspopup="dialog" aria-controls="mobileMenu" class="${secondary.some(([id]) => page === id) ? "active" : ""}"><span class="more-dots" aria-hidden="true">•••</span><span>Mehr</span></button></nav><dialog id="mobileMenu" class="mobile-menu" aria-labelledby="mobileMenuTitle"><div class="mobile-menu-header"><div><span class="eyebrow">LUFTHANSA GROUP MANAGER</span><h2 id="mobileMenuTitle">Dein Operations Center</h2></div><button id="closeMobileMenu" class="icon-button" aria-label="Menü schließen">×</button></div><div class="mobile-menu-links">${secondary.map(([id, i, label]) => `<button data-page="${id}" class="${page === id ? "active" : ""}">${icon(i, 22)}<span>${label}</span><b aria-hidden="true">›</b></button>`).join("")}</div><p>12× Spielzeit · lokal gespeichert</p></dialog>`;
}
function adaptTables() {
  for (const table of document.querySelectorAll(
    ".table-scroll table:not(.flight-board)",
  )) {
    table.classList.add("mobile-adaptive");
    const labels = [...table.querySelectorAll("thead th")].map(
      (th) => th.textContent,
    );
    for (const row of table.querySelectorAll("tbody tr"))
      [...row.cells].forEach((td, i) => {
        td.dataset.label = labels[i] || "";
      });
  }
}
function render() {
  const opened = [...document.querySelectorAll("details[open]")].map(
    (d) => d.dataset.fleet,
  );
  sync();
  aircraftRegistry();
  const p = PAGES[page] || PAGES.dashboard;
  const nav = [
    ["dashboard", "dashboard", "Operations Center"],
    ["routes", "network", "Streckennetz"],
    ["new", "plus", "Strecke planen"],
    ["fleet", "fleet", "Flotte & Technik"],
    ["finances", "chart", "Finanzen"],
    ["fuel", "fuel", "Kerosin & Betrieb"],
    ["market", "chart", "Wettbewerb"],
    ["group", "group", "Lufthansa Group"],
  ];
  const content =
    page === "dashboard"
      ? dashboard()
      : page === "routes"
        ? routesPage()
        : page === "route"
          ? routeDetail()
          : page === "new"
            ? newRoute()
            : page === "fleet"
              ? fleetPage()
              : page === "finances"
                ? financesPage()
                : page === "fuel"
                  ? fuelPage()
                  : page === "market"
                    ? marketPage()
                    : page === "group"
                      ? groupPage()
                      : page === "academy"
                        ? academyPage()
                        : settings();
  app.innerHTML = `<div class="app-shell"><aside class="sidebar"><a class="brand" data-page="dashboard" href="#" aria-label="Lufthansa Group Manager Startseite"><span class="brand-icon">${icon("fleet", 29)}</span><span>Lufthansa<span>Group Manager</span></span></a><div class="sidebar-caption">YOUR GROUP. YOUR HORIZON.</div><nav aria-label="Hauptnavigation">${nav.map(([id, i, label], n) => `${n === 4 ? '<span class="nav-section">STRATEGIE & KONZERN</span>' : ""}<button data-page="${id}" aria-label="${label}" class="nav-item ${page === id || (id === "routes" && page === "route") ? "active" : ""}" ${page === id ? 'aria-current="page"' : ""}>${icon(i, 19)}<span>${label}</span>${id === "new" ? "<b>+</b>" : ""}</button>`).join("")}</nav><div class="sidebar-bottom"><button class="nav-item ${page === "academy" ? "active" : ""}" data-page="academy">${icon("book", 19)} Management Academy</button><button class="nav-item ${page === "settings" ? "active" : ""}" data-page="settings">${icon("settings", 19)} Spielstand & Dauerbetrieb</button><div class="save-status"><span class="live-dot"></span><span>LOKAL GESPEICHERT<small>12× Spielzeit · Offline-Fortschritt</small></span></div></div></aside><div class="workspace"><header class="topbar"><div><span class="breadcrumb">LUFTHANSA GROUP <span>/</span> ${p[1].toUpperCase()}</span><h1>${p[0]}</h1></div><div class="topbar-right"><div class="game-clock">${icon("clock", 17)}<span><strong id="gameClock">${dateLabel(gameNow())} · ${timeLabel(gameNow())}</strong><small>SPIELZEIT UTC · 12×</small></span></div><span class="operator-badge">CEO</span></div></header><main id="main-content">${offlineReport()}<div id="actionFeedback" class="notice plain" role="status" ${notice ? "" : "hidden"}>${esc(notice)}</div>${content}<footer><span>LUFTHANSA GROUP MANAGER <b>·</b> OPERATIONS EDITION</span><span>Inoffizielle lokale Simulation · keine Live-Betriebsdaten</span></footer></main></div></div>${mobileNavigation()}`;
  for (const id of opened) {
    const details = document.querySelector(`details[data-fleet="${id}"]`);
    if (details) details.open = true;
  }
  if (page === "new") updateEstimate();
  adaptTables();
  if (lastRenderedPage !== page) {
    window.scrollTo({ top: 0, behavior: "instant" });
    lastRenderedPage = page;
  }
}
app.addEventListener("keydown", (e) => {
  if (
    (e.key === "Enter" || e.key === " ") &&
    e.target.matches("[data-route]:not(button)")
  ) {
    e.preventDefault();
    selectedRoute = Number(e.target.dataset.route);
    page = "route";
    render();
  }
});
app.addEventListener("click", (e) => {
  if (e.target.closest("#openMobileMenu"))
    document.querySelector("#mobileMenu").showModal();
  if (e.target.closest("#closeMobileMenu"))
    document.querySelector("#mobileMenu").close();
  if (e.target.id === "mobileMenu") {
    const box = e.target.getBoundingClientRect();
    if (e.clientY < box.top || e.clientX < box.left || e.clientX > box.right)
      e.target.close();
  }
});
render();
setInterval(() => {
  if (document.hidden) return;
  if (
    document.activeElement?.matches("input,select,textarea") ||
    document.querySelector("details[open]") ||
    document.querySelector("#mobileMenu[open]")
  ) {
    sync();
    const c = document.querySelector("#gameClock");
    if (c) c.textContent = dateLabel(gameNow()) + " · " + timeLabel(gameNow());
    return;
  }
  render();
}, 5000);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) render();
});
