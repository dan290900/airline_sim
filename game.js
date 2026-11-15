/* Simulation engine. All events use persisted game timestamps, never timers. */
let s,
  page = "dashboard",
  notice = "",
  filter = "all",
  routeSearch = "",
  routeSort = "profit",
  fleetSearch = "",
  selectedRoute = null;
let infoCache = new Map();
const app = document.querySelector("#app");
const localHourFormats = new Map(
  Object.values(HUB_RULES).map((r) => [
    r.zone,
    new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      hourCycle: "h23",
      timeZone: r.zone,
    }),
  ]),
);
try {
  s = JSON.parse(localStorage.getItem(KEY)) || base();
  if (s.version !== 2) s = base();
} catch {
  s = base();
}
initializeSimulation();
function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    notice =
      "Speicher voll oder nicht verfügbar. Bitte den Spielstand exportieren.";
  }
}
function log(text) {
  s.log.unshift(text);
  s.log = s.log.slice(0, 35);
}
function gameNow() {
  return s.clock.sim;
}
function fleetTotal() {
  return s.fleet.reduce((n, f) => n + f.count, 0);
}
function staffCost() {
  return fleetTotal() * 105 * 130;
}
function fleetFamily(type) {
  const name = types[type][0];
  return /A319|A320|A321/.test(name)
    ? "A320-Familie"
    : name.replace(/-(100|200|300|400|600|800|900|300ER|200ER|9)$/, "");
}
function ownershipCost() {
  const families = new Set(
    s.fleet
      .filter((f) => f.count > 0)
      .map((f) => f.air + ":" + fleetFamily(f.type)),
  );
  return fleetTotal() * 3500 + families.size * 12000;
}
function fail(message) {
  notice = message;
  const node = document.querySelector("#actionFeedback");
  if (node) {
    node.textContent = message;
    node.hidden = false;
    node.scrollIntoView({ block: "nearest" });
  }
}
function dayKey(t) {
  return Math.floor(t / DAY);
}
function daily(t) {
  const key = dayKey(t);
  return (
    s.finance.days[key] ||
    (s.finance.days[key] = {
      at: key * DAY,
      revenue: 0,
      fuel: 0,
      operations: 0,
      personnel: 0,
      maintenance: 0,
      interest: 0,
      leasing: 0,
      overhead: 0,
      investment: 0,
      disposal: 0,
      financing: 0,
      flights: 0,
      missed: 0,
      pax: 0,
    })
  );
}
function book(category, amount, text, at = s.last, routeId = null) {
  if (!Number.isFinite(amount)) throw Error("Ungültiger Buchungsbetrag");
  s.cash += amount;
  daily(at)[category] = (daily(at)[category] || 0) + amount;
  if (!["investment", "disposal", "financing"].includes(category))
    s.profit += amount;
  s.finance.ledger.unshift({ at, category, amount, text, routeId });
  s.finance.ledger = s.finance.ledger.slice(0, 600);
}
function initializeSimulation() {
  if (!s.market || s.market.version !== 1)
    s.market = AirlineMarket.create(airports, km, s.last);
  if (!s.clock) s.clock = { sim: s.last, wall: Date.now(), rate: 12 };
  s.clock.rate = 12;
  s.automation ||= { fuel: true, maintenance: true };
  s.finance ||= { days: {}, ledger: [], debt: 0 };
  s.reliability ??= 96;
  s.completed ??= 0;
  s.profit ??= 0;
  s.fuelPrice ??= 0.87;
  if (s.market.catalogVersion !== 2) {
    const full = AirlineMarket.create(airports, km, s.last),
      known = new Set(s.market.lanes.map((l) => l.key)),
      added = full.lanes.filter((l) => !known.has(l.key));
    if (s.market.companies) {
      const budgets = s.market.companies.map(
        (c) =>
          c.fleet -
          s.market.lanes.reduce(
            (n, l) =>
              n +
              l.rivals
                .filter((r) => r.id === c.id)
                .reduce((sum, r) => sum + Math.ceil(r.capacity / 180), 0),
            0,
          ),
      );
      for (const l of added)
        l.rivals = l.rivals.filter((r) => {
          const required = Math.ceil(r.capacity / 180);
          if (budgets[r.id] < required) return false;
          budgets[r.id] -= required;
          return true;
        });
    }
    s.market.lanes.push(...added);
    s.market.catalogVersion = 2;
  }
  aircraftRegistry();
  const legacy = s.operationsVersion !== 3;
  for (const f of s.fleet) {
    f.maintenanceUntil ??= 0;
    f.maintenancePending ??= false;
    f.leased ??= [];
    f.hours ??= 0;
  }
  const allocated = new Set();
  for (const r of s.routes) {
    r.service ||= "standard";
    r.buffer ??= 15;
    r.frequency ??= 0;
    r.turnMinutes ??= turnMinutes(r.type);
    r.legs ??= 0;
    r.stats ||= { flights: 0, pax: 0, revenue: 0, cost: 0, missed: 0 };
    if (!r.aircraft || r.aircraft.length !== r.count) {
      const f = s.fleet.find((f) => f.air === r.air && f.type === r.type);
      r.aircraft = f
        ? f.aircraft.filter((t) => !allocated.has(t)).slice(0, r.count)
        : [];
    }
    r.aircraft.forEach((t) => allocated.add(t));
    if (legacy || !r.phase) {
      r.phase = "ground";
      r.next = Math.max(s.last + 60000, r.next - r.duration);
      r.duration = blockTime(km(ap(r.from), ap(r.to)), r.type);
    }
  }
  s.operationsVersion = 3;
  AirlineMarket.economy(s.market);
  s.market.time = s.last;
  updateEnvironment(s.last);
}
function aircraftRegistry() {
  s.aircraftSerial ||= 0;
  for (const f of s.fleet) {
    f.aircraft ||= [];
    while (f.aircraft.length < f.count) {
      s.aircraftSerial++;
      f.aircraft.push(`${f.air}-${String(s.aircraftSerial).padStart(5, "0")}`);
    }
  }
}
function free(air, type) {
  const f = s.fleet.find((f) => f.air === air && f.type === type);
  return f ? aircraftAssignments(f).filter((a) => !a.route).length : 0;
}
function aircraftAssignments(f) {
  return f.aircraft.map((tail) => ({
    tail,
    route: s.routes.find((r) => r.aircraft?.includes(tail)),
  }));
}
function saleValue(f) {
  return Math.round(
    types[f.type][4] * 1e6 * 0.65 * (0.4 + (0.6 * f.condition) / 100),
  );
}
function turnMinutes(type) {
  return types[type][1] >= 400 ? 120 : types[type][1] >= 250 ? 90 : 45;
}
function cycle(r) {
  const minimum = r.duration + (turnMinutes(r.type) + (r.buffer || 0)) * 60000;
  return Math.max(minimum, r.frequency ? DAY / (r.frequency * 2) : 0);
}
function currentOrigin(r) {
  return (r.legs || 0) % 2 ? r.to : r.from;
}
function currentDestination(r) {
  return (r.legs || 0) % 2 ? r.from : r.to;
}
function curfewOpen(airport, at) {
  const rule = HUB_RULES[airport];
  if (!rule) return true;
  const hour = Number(localHourFormats.get(rule.zone).format(at));
  return rule.close === 0
    ? hour >= rule.open
    : !(hour >= rule.close || hour < rule.open);
}
function legalDeparture(r, at) {
  const origin = currentOrigin(r),
    destination = currentDestination(r);
  let time = at;
  for (let i = 0; i < 120; i++) {
    if (curfewOpen(origin, time) && curfewOpen(destination, time + r.duration))
      return time;
    time += 15 * 60000;
  }
  return time;
}
function plannedDepartures(r) {
  // A model week includes both endpoints' curfews instead of assuming 24/7 use.
  const start = s.market.time,
    until = start + 7 * DAY;
  let at = start,
    legs = 0,
    count = 0;
  while (at < until) {
    at = legalDeparture({ ...r, legs }, at);
    if (at >= until) break;
    count++;
    legs++;
    at += cycle(r);
  }
  return Math.max(1 / 7, count / 7);
}
function updateEnvironment(at) {
  const d = at / DAY;
  s.fuelPrice =
    Math.round(
      (0.91 + 0.12 * Math.sin(d * 0.43) + 0.045 * Math.sin(d * 1.7)) * 100,
    ) / 100;
  const index = Math.floor(at / (6 * HOUR));
  const affected = ["FRA", "MUC", "ZRH", "LHR", "AMS", "JFK", "CDG"][
    hash(index) % 7
  ];
  s.market.weather =
    hash(index + "weather") % 4 === 0
      ? {
          airport: affected,
          minutes: 20 + (hash(index) % 30),
          title: "Wetterbedingte Abfertigungsverzögerung",
        }
      : null;
  s.market.time = at;
  s.market.fuelPrice = s.fuelPrice;
  s.market.playerQuality = Object.fromEntries(
    Object.entries(brands).map(([id, b]) => [
      id,
      b.quality * (0.75 + s.reliability / 400),
    ]),
  );
  infoCache.clear();
}
function info(input) {
  const r = { service: "standard", buffer: 15, count: 1, ...input };
  const cacheKey = JSON.stringify([
    r.id,
    r.from,
    r.to,
    r.type,
    r.price,
    r.count,
    r.duration,
    r.service,
    r.buffer,
    r.frequency,
  ]);
  if (infoCache.has(cacheKey)) return infoCache.get(cacheKey);
  const type = types[r.type],
    distance = km(ap(r.from), ap(r.to)),
    hours = r.duration / HOUR;
  const preview = !r.id;
  r.id ??= "preview";
  const competition = AirlineMarket.flight(
    s.market,
    r,
    preview ? [...s.routes, r] : s.routes,
    types,
  );
  const pax = competition.pax,
    service = SERVICES[r.service] || SERVICES.standard;
  const fuel = Math.ceil(type[5] * Math.max(0.35, hours - 0.2) + 450);
  const airportFee = 850 + type[1] * 6.2,
    handling = pax * (25 + service.cost),
    navigation = distance + hours * 700;
  const other = Math.round(airportFee + handling + navigation);
  const rev = pax * r.price,
    net = rev - other - fuel * s.fuelPrice;
  const perDay = plannedDepartures(r),
    allocated =
      (staffCost() + ownershipCost()) / Math.max(1, fleetTotal()) / perDay;
  const fullNet = net - allocated;
  const breakEven =
    (airportFee + navigation + fuel * s.fuelPrice + allocated) /
    (Math.max(1, type[1]) * Math.max(0, r.price - (25 + service.cost)));
  const result = {
    d: distance,
    hours,
    pax,
    fuel,
    other,
    rev,
    net,
    fullNet,
    allocated,
    competition,
    breakEven,
    perDay,
    dailyNet: fullNet * perDay * r.count,
    co2: (fuel * 0.8 * 3.16) / 1000,
  };
  infoCache.set(cacheKey, result);
  return result;
}
function startMaintenance(f, at) {
  if (
    f.maintenanceUntil > at ||
    s.routes.some(
      (r) => r.air === f.air && r.type === f.type && r.phase === "flight",
    )
  )
    return false;
  const cost = Math.ceil((100 - f.condition) * f.count * 2200);
  if (s.cash - cost < 100000000) return false;
  book("maintenance", -cost, `${types[f.type][0]} · Technik-Check`, at);
  f.maintenanceUntil = at + 4 * HOUR;
  f.maintenancePending = false;
  log(
    `${brands[f.air].name}: ${types[f.type][0]} für vier Spielstunden bei der Technik.`,
  );
  return true;
}
function automaticOperations(at) {
  for (const f of s.fleet) {
    if (f.maintenanceUntil && f.maintenanceUntil <= at) {
      f.condition = 100;
      f.maintenanceUntil = 0;
      log(`${types[f.type][0]}: Technik-Check abgeschlossen.`);
    }
    if (s.automation.maintenance && f.condition < 72)
      f.maintenancePending = true;
    if (f.maintenancePending) startMaintenance(f, at);
  }
  if (s.automation.fuel) {
    const target = Math.ceil(
      s.routes
        .filter((r) => !r.retiring)
        .reduce((n, r) => n + (info(r).fuel * r.count * DAY) / cycle(r), 0),
    );
    // Buy once stock falls below half a day; avoid hundreds of tiny purchases.
    if (s.fuel < target * 0.5) {
      const liters = Math.max(
        0,
        Math.min(
          target - s.fuel,
          Math.floor((s.cash - 100000000) / s.fuelPrice),
        ),
      );
      if (liters > 0) {
        book(
          "fuel",
          -liters * s.fuelPrice,
          `${num(liters)} l Jet A-1 · Automatik`,
          at,
        );
        s.fuel += liters;
        s.running.fuel += liters * s.fuelPrice;
      }
    }
  }
}
function retireRoute(r, at) {
  s.routes = s.routes.filter((x) => x !== r);
  log(`${r.from} ↔ ${r.to} geschlossen. Maschinen am Ausgangshub verfügbar.`);
  infoCache.clear();
}
function departure(r, at) {
  const f = s.fleet.find((f) => f.air === r.air && f.type === r.type);
  if (r.retiring && currentOrigin(r) === r.from) {
    retireRoute(r, at);
    return;
  }
  if (f.maintenanceUntil > at || f.maintenancePending) {
    r.phase = "maintenance";
    r.next = f.maintenanceUntil > at ? f.maintenanceUntil : at + HOUR / 2;
    return;
  }
  const legal = legalDeparture(r, at);
  if (legal > at) {
    r.phase = "curfew";
    r.next = legal;
    return;
  }
  const v = info(r),
    fuel = v.fuel * r.count;
  if (s.fuel < fuel || f.condition <= 50) {
    r.phase = "ground";
    r.next = at + HOUR;
    s.running.missed += r.count;
    r.stats.missed += r.count;
    daily(at).missed += r.count;
    s.reliability = Math.max(55, s.reliability - 0.025 * r.count);
    if (!r.lastWarning || at - r.lastWarning >= 6 * HOUR) {
      log(
        `${r.from} ↔ ${r.to}: Start entfällt – ${s.fuel < fuel ? "Kerosin fehlt" : "Technik-Check nötig"}.`,
      );
      r.lastWarning = at;
    }
    return;
  }
  const weather = s.market.weather,
    delay =
      weather &&
      (weather.airport === currentOrigin(r) ||
        weather.airport === currentDestination(r))
        ? weather.minutes * 60000
        : 0;
  s.fuel -= fuel;
  book(
    "operations",
    -v.other * r.count,
    `${r.air}${r.id} · Flughafen, Handling & Service`,
    at,
    r.id,
  );
  r.manifest = {
    pax: v.pax,
    rev: v.rev,
    cost: v.other + v.fuel * s.fuelPrice,
    load: v.competition.load,
  };
  r.phase = "flight";
  r.departed = at;
  r.next = at + r.duration + delay;
  r.delay = delay;
}
function arrive(r, at) {
  const f = s.fleet.find((f) => f.air === r.air && f.type === r.type),
    manifest = r.manifest || info(r);
  book(
    "revenue",
    manifest.rev * r.count,
    `${r.air}${r.id} · ${currentOrigin(r)}–${currentDestination(r)}`,
    at,
    r.id,
  );
  r.stats.flights += r.count;
  r.stats.pax += manifest.pax * r.count;
  r.stats.revenue += manifest.rev * r.count;
  r.stats.cost += manifest.cost * r.count;
  s.completed += r.count;
  s.running.flights += r.count;
  daily(at).flights += r.count;
  daily(at).pax += manifest.pax * r.count;
  f.condition = Math.max(
    0,
    f.condition -
      ((r.duration / HOUR) * 0.075 * r.count) / Math.max(1, f.count),
  );
  f.hours += (r.duration / HOUR) * r.count;
  s.reliability = Math.min(
    99.5,
    s.reliability + (r.delay ? -0.006 : 0.004) * r.count,
  );
  r.legs++;
  r.phase = "ground";
  delete r.manifest;
  if (r.retiring && currentOrigin(r) === r.from) {
    retireRoute(r, at);
    return;
  }
  r.next =
    at +
    Math.max((turnMinutes(r.type) + r.buffer) * 60000, cycle(r) - r.duration);
}
function syncStep(at) {
  const elapsed = at - s.last;
  if (elapsed <= 0) return;
  if (elapsed) {
    book(
      "personnel",
      (-staffCost() * elapsed) / DAY,
      "Personal & Konzernstruktur",
      at,
    );
    book(
      "overhead",
      (-ownershipCost() * elapsed) / DAY,
      "Flottenversicherung, Infrastruktur & Mustervielfalt",
      at,
    );
    if (s.finance.debt)
      book(
        "interest",
        (-s.finance.debt * 0.08 * elapsed) / (365 * DAY),
        "Kreditzins · 8 % p.a.",
        at,
      );
  }
  s.last = at;
  automaticOperations(at);
  for (const r of [...s.routes])
    if (r.next <= at) {
      if (r.phase === "flight") arrive(r, at);
      else departure(r, at);
    }
  for (const order of s.orders.filter((o) => o.at <= at)) {
    let f = s.fleet.find((f) => f.air === order.air && f.type === order.type);
    if (f) {
      f.condition =
        (f.condition * f.count + (order.condition || 100) * order.count) /
        (f.count + order.count);
      f.count += order.count;
    } else {
      s.fleet.push({
        id: s.nextId++,
        air: order.air,
        type: order.type,
        count: order.count,
        condition: order.condition || 100,
        aircraft: [],
        leased: [],
        hours: 0,
        maintenanceUntil: 0,
        maintenancePending: false,
      });
    }
    aircraftRegistry();
    log(
      `${order.count} × ${types[order.type][0]} an ${brands[order.air].name} ausgeliefert.`,
    );
  }
  s.orders = s.orders.filter((o) => o.at > at);
  for (const f of s.fleet) if (f.maintenancePending) startMaintenance(f, at);
}
function nextCheckpoint() {
  return Math.min(
    Math.floor(s.last / (HOUR / 2)) * (HOUR / 2) + HOUR / 2,
    s.market.next,
    ...s.routes.map((r) => r.next),
    ...s.orders.map((o) => o.at),
    ...s.fleet
      .filter((f) => f.maintenanceUntil > s.last)
      .map((f) => f.maintenanceUntil),
  );
}
function sync() {
  const wall = Date.now(),
    delta = Math.max(0, wall - s.clock.wall),
    before = s.cash;
  s.clock.sim += delta * s.clock.rate;
  s.clock.wall = Math.max(s.clock.wall, wall);
  s.running = { flights: 0, missed: 0, fuel: 0, maintenance: 0 };
  // Old imported schedules are shifted to a future event; no negative/zero loop.
  for (const r of s.routes) if (r.next <= s.last) r.next = s.last + 60000;
  if (s.market.next <= s.last) s.market.next = s.last + 6 * HOUR;
  for (const o of s.orders) if (o.at <= s.last) o.at = s.last + 60000;
  let at = nextCheckpoint();
  while (at <= gameNow()) {
    syncStep(at);
    if (s.market.next <= at) {
      AirlineMarket.advance(s.market, s.routes, types, at);
      updateEnvironment(at);
    }
    at = nextCheckpoint();
  }
  if (delta > 5 * 60000)
    s.report = { elapsed: delta * 12, ...s.running, net: s.cash - before };
  const keys = Object.keys(s.finance.days)
    .map(Number)
    .sort((a, b) => b - a);
  for (const key of keys.slice(90)) delete s.finance.days[key];
  save();
}
function getSummary(days = 1) {
  const end = dayKey(gameNow()),
    start = end - days + 1,
    totals = {
      revenue: 0,
      fuel: 0,
      operations: 0,
      personnel: 0,
      overhead: 0,
      maintenance: 0,
      interest: 0,
      flights: 0,
      missed: 0,
      pax: 0,
    };
  for (const [key, d] of Object.entries(s.finance.days))
    if (+key >= start && +key <= end)
      for (const k of Object.keys(totals)) totals[k] += d[k] || 0;
  totals.net =
    totals.revenue +
    totals.fuel +
    totals.operations +
    totals.personnel +
    totals.overhead +
    totals.maintenance +
    totals.interest;
  return totals;
}
function routeStatus(r) {
  const f = s.fleet.find((f) => f.air === r.air && f.type === r.type);
  if (f.maintenanceUntil > gameNow())
    return { label: "Technik", tone: "amber" };
  if (r.retiring) return { label: "Rückführung", tone: "amber" };
  return r.phase === "flight"
    ? {
        label: r.delay ? "Verspätet" : "Im Flug",
        tone: r.delay ? "amber" : "green",
      }
    : r.phase === "curfew"
      ? { label: "Nachtflugruhe", tone: "neutral" }
      : r.phase === "maintenance"
        ? { label: "Technik wartet", tone: "amber" }
        : { label: "Am Boden", tone: "blue" };
}
function validateRoute(data) {
  if (s.cash < 250000)
    return {
      error: "Für Station und Vertrieb sind mindestens 250.000 € nötig.",
    };
  const type = Number(data.get("type")),
    count = Number(data.get("count")),
    price = Number(data.get("price")),
    from = data.get("from"),
    to = data.get("to"),
    air = data.get("air"),
    buffer = Number(data.get("buffer") || 15),
    frequency = Number(data.get("frequency") || 0),
    service = data.get("service") || "standard";
  if (!brands[air] || !types[type] || !ap(from) || !ap(to) || from === to)
    return {
      error: "Bitte unterschiedliche Flughäfen und ein gültiges Muster wählen.",
    };
  if (!brands[air].hubs.includes(from))
    return {
      error:
        "Neue Strecken beginnen an einem Hub oder einer Basis dieser Airline.",
    };
  if (!Number.isInteger(count) || count < 1 || count > free(air, type))
    return {
      error: `Nicht genug freie Maschinen: ${free(air, type)} verfügbar.`,
    };
  if (
    !Number.isFinite(price) ||
    price < 30 ||
    price > 5000 ||
    !Number.isFinite(buffer) ||
    buffer < 0 ||
    buffer > 120 ||
    ![0, 1, 2, 3, 4, 6].includes(frequency) ||
    !SERVICES[service]
  )
    return {
      error: "Preis, Umlaufziel, Bodenpuffer oder Serviceprofil prüfen.",
    };
  const distance = km(ap(from), ap(to));
  if (distance > types[type][2] * 0.95)
    return { error: "Reichweite mit 5 % Planungsreserve reicht nicht aus." };
  if (
    s.routes.some(
      (r) =>
        r.air === air &&
        AirlineMarket.key(r.from, r.to) === AirlineMarket.key(from, to),
    )
  )
    return {
      error:
        "Diese Airline bedient den Markt bereits. Bestehende Strecke bearbeiten.",
    };
  const r = {
    type,
    count,
    price,
    from,
    to,
    air,
    buffer,
    frequency,
    service,
    duration: blockTime(distance, type),
    turnMinutes: turnMinutes(type),
  };
  if (
    frequency &&
    DAY / (frequency * 2) < r.duration + (r.turnMinutes + buffer) * 60000
  )
    return {
      error:
        "Dieses tägliche Umlaufziel passt nicht zu Flugzeit und Bodenzeit. Weniger Umläufe wählen.",
    };
  return { route: r };
}
function sellAircraft(tail) {
  const f = s.fleet.find((f) => f.aircraft.includes(tail));
  if (!f) return;
  if (
    aircraftAssignments(f).find((a) => a.tail === tail)?.route ||
    f.maintenanceUntil > gameNow()
  ) {
    notice =
      "Die Maschine ist gebunden. Erst Rückführung oder Wartung abschließen.";
    return;
  }
  const value = saleValue(f);
  if (!confirm(`${tail} für ${money(value)} verkaufen?`)) return;
  f.aircraft = f.aircraft.filter((t) => t !== tail);
  f.count--;
  book("disposal", value, `${tail} verkauft`, gameNow());
  log(`${tail} für ${money(value)} verkauft.`);
  notice = "Maschine verkauft. Der Erlös ist gutgeschrieben.";
}
function closeRoute(r) {
  if (r.phase === "flight" || currentOrigin(r) !== r.from) {
    r.retiring = true;
    notice = "Die Strecke wird nach der Rückkehr zum Ausgangshub geschlossen.";
  } else {
    retireRoute(r, gameNow());
    notice = "Strecke geschlossen. Die Flugzeuge sind wieder frei.";
  }
  infoCache.clear();
}
function validSave(data) {
  if (
    !data ||
    data.version !== 2 ||
    !Number.isFinite(data.cash) ||
    !Number.isFinite(data.last) ||
    !Array.isArray(data.fleet) ||
    !Array.isArray(data.routes) ||
    !Array.isArray(data.orders)
  )
    return false;
  if (
    !data.fleet.every(
      (f) =>
        brands[f.air] &&
        types[f.type] &&
        Number.isInteger(f.count) &&
        f.count >= 0 &&
        f.count <= 5000 &&
        Number.isFinite(f.condition) &&
        f.condition >= 0 &&
        f.condition <= 100,
    )
  )
    return false;
  if (
    !data.routes.every(
      (r) =>
        brands[r.air] &&
        types[r.type] &&
        ap(r.from) &&
        ap(r.to) &&
        r.from !== r.to &&
        Number.isInteger(r.count) &&
        r.count > 0 &&
        Number.isFinite(r.price) &&
        r.price >= 30 &&
        Number.isFinite(r.next) &&
        Number.isFinite(r.duration) &&
        r.duration > 0,
    )
  )
    return false;
  const groups = new Map(
    data.fleet.map((f) => [f.air + "-" + f.type, f.count]),
  );
  const counts = new Map();
  for (const r of data.routes) {
    const key = r.air + "-" + r.type;
    counts.set(key, (counts.get(key) || 0) + r.count);
  }
  if ([...counts].some(([key, count]) => count > (groups.get(key) || 0)))
    return false;
  if (
    !data.orders.every(
      (o) =>
        brands[o.air] &&
        types[o.type] &&
        Number.isInteger(o.count) &&
        o.count > 0 &&
        Number.isFinite(o.at),
    )
  )
    return false;
  if (
    data.clock &&
    (!Number.isFinite(data.clock.sim) || !Number.isFinite(data.clock.wall))
  )
    return false;
  if (
    data.market &&
    (!Array.isArray(data.market.lanes) || !Number.isFinite(data.market.next))
  )
    return false;
  return true;
}
function exportGame() {
  sync();
  const a = document.createElement("a");
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(s, null, 2)], { type: "application/json" }),
  );
  a.href = url;
  a.download = "lufthansa-group-manager.json";
  a.click();
  URL.revokeObjectURL(url);
}
app.addEventListener("click", (e) => {
  const target = e.target.closest("button,a[data-page],[data-route]");
  if (!target) return;
  sync();
  notice = "";
  if (target.matches?.("a")) e.preventDefault();
  if (target.dataset.page) {
    page = target.dataset.page;
    selectedRoute = null;
    render();
    return;
  }
  if (target.dataset.route) {
    selectedRoute = Number(target.dataset.route);
    page = "route";
    render();
    return;
  }
  if (target.dataset.sell) {
    sellAircraft(target.dataset.sell);
    save();
    render();
    return;
  }
  if (target.dataset.close) {
    const r = s.routes.find((r) => r.id === Number(target.dataset.close));
    if (r && confirm(`${r.from} ↔ ${r.to} nach Rückkehr zum Hub schließen?`))
      closeRoute(r);
    save();
    render();
    return;
  }
  if (target.dataset.maintain) {
    const f = s.fleet.find((f) => f.id === Number(target.dataset.maintain));
    if (
      f &&
      confirm(
        `${types[f.type][0]}: Technik-Check für rund ${money(Math.ceil((100 - f.condition) * f.count * 2200))} und vier Spielstunden Standzeit planen?`,
      )
    ) {
      f.maintenancePending = true;
      startMaintenance(f, gameNow());
      notice =
        "Technik-Check geplant. Laufende Flüge landen zuerst; der Check dauert vier Spielstunden.";
    }
    save();
    render();
    return;
  }
  if (target.dataset.auto) {
    const key = target.dataset.auto;
    if (["fuel", "maintenance"].includes(key))
      s.automation[key] = !s.automation[key];
    save();
    render();
    return;
  }
  if (target.dataset.map) {
    mapRegion = target.dataset.map;
    render();
    return;
  }
  if (target.id === "dismissIntro") {
    s.introSeen = true;
    save();
    render();
    return;
  }
  if (target.id === "dismissReport") {
    delete s.report;
    save();
    render();
    return;
  }
  if (target.id === "dismissIntro") {
    s.introSeen = true;
    save();
    render();
    return;
  }
  if (target.id === "export") {
    exportGame();
    return;
  }
  if (
    target.id === "reset" &&
    confirm(
      "Neues Szenario beginnen? Der aktuelle Spielstand wird ersetzt. Vorher gegebenenfalls exportieren.",
    )
  ) {
    s = base();
    initializeSimulation();
    infoCache.clear();
    page = "dashboard";
    notice = "Neues Lufthansa-Group-Szenario gestartet.";
    save();
    render();
    return;
  }
});
app.addEventListener("submit", (e) => {
  e.preventDefault();
  sync();
  const d = new FormData(e.target);
  notice = "";
  if (e.target.id === "routeForm") {
    const result = validateRoute(d);
    if (result.error) {
      fail(result.error);
      return;
    }
    const r = result.route,
      f = s.fleet.find((f) => f.air === r.air && f.type === r.type);
    r.id = s.nextId++;
    r.phase = "ground";
    r.legs = 0;
    r.next = gameNow() + 30 * 60000;
    r.stats = { flights: 0, pax: 0, revenue: 0, cost: 0, missed: 0 };
    r.aircraft = aircraftAssignments(f)
      .filter((a) => !a.route)
      .slice(0, r.count)
      .map((a) => a.tail);
    s.routes.push(r);
    book(
      "operations",
      -250000,
      `${r.from}–${r.to} · Station & Vertrieb eröffnen`,
      gameNow(),
      r.id,
    );
    infoCache.clear();
    notice =
      "Neue Strecke eröffnet. Boarding beginnt nach 30 Spielminuten; Nachtflugruhe wird berücksichtigt.";
    page = "routes";
  }
  if (e.target.id === "routeEdit") {
    const r = s.routes.find((r) => r.id === selectedRoute),
      price = Number(d.get("price")),
      buffer = Number(d.get("buffer")),
      service = d.get("service");
    if (
      !r ||
      !Number.isFinite(price) ||
      price < 30 ||
      price > 5000 ||
      !Number.isFinite(buffer) ||
      buffer < 0 ||
      buffer > 120 ||
      !SERVICES[service]
    ) {
      fail("Preis, Bodenpuffer und Serviceprofil prüfen.");
      return;
    }
    r.price = price;
    r.service = service;
    r.buffer = buffer;
    infoCache.clear();
    notice =
      "Änderungen gespeichert. Bereits gestartete Flüge behalten ihre gebuchten Erlöse und Kosten.";
  }
  if (e.target.id === "orderForm") {
    const air = d.get("air"),
      type = Number(d.get("type")),
      count = Number(d.get("count")),
      used = d.get("purchase") === "used";
    if (
      !brands[air] ||
      !types[type] ||
      !Number.isInteger(count) ||
      count < 1 ||
      count > 20
    ) {
      fail("Airline, Muster und Anzahl prüfen.");
      return;
    }
    const cost = types[type][4] * 1e6 * count * (used ? 0.72 : 1);
    if (s.cash - cost < 100000000) {
      fail(
        "Die Bestellung würde die 100-Mio.-€-Liquiditätsreserve unterschreiten.",
      );
      return;
    }
    book(
      "investment",
      -cost,
      `${count} × ${types[type][0]} · ${used ? "Gebrauchtkauf" : "Neubestellung"}`,
      gameNow(),
    );
    s.orders.push({
      air,
      type,
      count,
      condition: used ? 84 : 100,
      at: gameNow() + (used ? 1 : 7 + (type % 8)) * DAY,
    });
    notice = `Bestellung bezahlt. Lieferung in ${used ? "einem" : 7 + (type % 8)} Spieltag${used ? "" : "en"}.`;
  }
  if (e.target.id === "fuelForm") {
    const liters = Number(d.get("liters")),
      cost = liters * s.fuelPrice;
    if (!Number.isFinite(liters) || liters < 1000 || cost > s.cash) {
      fail("Menge oder verfügbare Liquidität prüfen.");
      return;
    }
    book("fuel", -cost, `${num(liters)} l Jet A-1 · Einkauf`, gameNow());
    s.fuel += liters;
    notice = "Kerosin eingekauft.";
  }
  if (e.target.id === "loanForm") {
    const amount = Number(d.get("amount")) * 1e6,
      repay = d.get("operation") === "repay";
    if (
      !Number.isFinite(amount) ||
      amount <= 0 ||
      (repay && (amount > s.finance.debt || amount > s.cash)) ||
      (!repay && s.finance.debt + amount > 250e6)
    ) {
      fail(
        "Betrag prüfen: maximal 250 Mio. € Kreditrahmen; Rückzahlung aus vorhandener Liquidität.",
      );
      return;
    }
    s.finance.debt += repay ? -amount : amount;
    book(
      "financing",
      repay ? -amount : amount,
      repay ? "Kredit zurückgezahlt" : "Kredit aufgenommen",
      gameNow(),
    );
    notice = "Finanzierung verbucht.";
  }
  save();
  render();
});
app.addEventListener("input", (e) => {
  if (e.target.closest("#routeForm")) updateEstimate();
  if (e.target.id === "routeSearch") {
    routeSearch = e.target.value;
    updateRouteList();
  }
  if (e.target.id === "fleetSearch") {
    fleetSearch = e.target.value;
    updateFleetList();
  }
});
app.addEventListener("change", async (e) => {
  if (e.target.id === "airlineFilter") {
    filter = e.target.value;
    render();
    return;
  }
  if (e.target.id === "routeSort") {
    routeSort = e.target.value;
    updateRouteList();
    return;
  }
  if (e.target.name === "air" && e.target.closest("#routeForm")) {
    const select = document.querySelector('#routeForm [name="from"]');
    select.innerHTML = brands[e.target.value].hubs
      .map(
        (code) => `<option value="${code}">${code} · ${ap(code)[1]}</option>`,
      )
      .join("");
    const aircraftSelect = document.querySelector('#routeForm [name="type"]');
    const available = s.fleet.filter(
      (f) => f.air === e.target.value && free(f.air, f.type) > 0,
    );
    aircraftSelect.innerHTML = available.length
      ? available
          .map(
            (f) =>
              `<option value="${f.type}">${types[f.type][0]} · ${free(f.air, f.type)} frei</option>`,
          )
          .join("")
      : '<option value="-1">Keine freien Maschinen – erst beschaffen</option>';
    updateEstimate();
  }
  if (e.target.id === "import") {
    try {
      const data = JSON.parse(await e.target.files[0].text());
      if (!validSave(data)) throw Error("Ungültiger Spielstand");
      if (confirm("Aktuellen Spielstand durch diese Sicherung ersetzen?")) {
        s = data;
        initializeSimulation();
        infoCache.clear();
        notice = "Spielstand importiert.";
        page = "dashboard";
        render();
      }
    } catch {
      notice = "Die Datei ist kein gültiger oder unterstützter Spielstand.";
      render();
    }
  }
});
