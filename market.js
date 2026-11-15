/* Local, deterministic airline competition. No network or account required. */
const AirlineMarket = (() => {
  const interval = 6 * 3600000;
  const profiles = [
    { name: "Delta Air Lines", hub: "JFK", quality: 1.12, fare: 1.05 },
    { name: "United Airlines", hub: "ORD", quality: 1.08, fare: 1.02 },
    { name: "American Airlines", hub: "MIA", quality: 1.02, fare: 0.98 },
    { name: "Emirates", hub: "DXB", quality: 1.22, fare: 1.12 },
    { name: "Air France", hub: "CDG", quality: 1.1, fare: 1.02 },
    { name: "KLM", hub: "AMS", quality: 1.08, fare: 1 },
    { name: "British Airways", hub: "LHR", quality: 1.12, fare: 1.05 },
    { name: "Turkish Airlines", hub: "IST", quality: 1.04, fare: 0.88 },
    { name: "Qatar Airways", hub: "DOH", quality: 1.24, fare: 1.08 },
    { name: "Ryanair", hub: "DUB", quality: 0.76, fare: 0.57 },
  ];
  const key = (a, b) => [a, b].sort().join("-");
  const hash = (str) =>
    [...str].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  const reference = (distance) => Math.max(95, 95 + distance * 0.078);
  function create(airports, distance, now) {
    const lanes = [];
    for (let i = 0; i < airports.length; i++)
      for (let j = i + 1; j < airports.length; j++) {
        const a = airports[i][0],
          b = airports[j][0],
          d = distance(airports[i], airports[j]);
        if (d < 180) continue;
        const k = key(a, b),
          h = hash(k),
          short = d < 3300;
        const candidates = profiles
          .map((p, id) => ({
            id,
            rank:
              (hash(k + p.name) % 100) + (p.hub === a || p.hub === b ? 140 : 0),
          }))
          .filter((x) => short || x.id !== 9)
          .sort((x, y) => y.rank - x.rank);
        const n = 1 + (h % 3);
        const rivals = candidates
          .slice(0, n)
          .map(({ id }, idx) => ({
            id,
            price: Math.round(reference(d) * profiles[id].fare),
            capacity: 120 + ((h + idx * 71) % 240),
            share: 0,
          }));
        lanes.push({
          key: k,
          from: a,
          to: b,
          distance: d,
          demand: 200 + (h % 460),
          rivals,
        });
      }
    return { version: 1, next: now + interval, round: 0, lanes, events: [] };
  }
  function economy(m) {
    if (m.companies) return;
    m.companies = profiles.map((p, id) => {
      const used = m.lanes.reduce(
        (n, l) =>
          n +
          l.rivals
            .filter((r) => r.id === id)
            .reduce((v, r) => v + Math.ceil(r.capacity / 180), 0),
        0,
      );
      return {
        id,
        cash: 800000000,
        fleet: used + 10,
        startFleet: used + 10,
        profit: 0,
        lastProfit: 0,
        flights: 0,
        passengers: 0,
        purchased: 0,
      };
    });
  }
  function used(m, id) {
    return m.lanes.reduce(
      (n, l) =>
        n +
        l.rivals
          .filter((r) => r.id === id)
          .reduce((v, r) => v + Math.ceil(r.capacity / 180), 0),
      0,
    );
  }
  function lane(m, a, b) {
    return m.lanes.find((l) => l.key === key(a, b));
  }
  // Passenger choice includes competing group airlines and the option not to fly.
  // Capped allocation redistributes excess demand when an airline sells out.
  function outcome(m, l, routes, types) {
    if (!l) return { players: [], rivals: [], demand: 0 };
    const ref = reference(l.distance),
      hours = Math.max(0.5, l.distance / 850 + 0.35) + 0.9;
    const stamp = m.time || 0,
      month = new Date(stamp).getUTCMonth(),
      weekday = new Date(stamp).getUTCDay();
    const season =
      1 +
      0.1 * Math.cos(((month - 7) * Math.PI) / 6) +
      (weekday === 0 || weekday === 6 ? -0.06 : 0.035);
    const affected =
      m.weather && (l.from === m.weather.airport || l.to === m.weather.airport);
    const demand = Math.round(l.demand * season * (affected ? 0.94 : 1));
    const options = l.rivals.map((r) => ({
      kind: "rival",
      id: r.id,
      price: r.price,
      cap: r.capacity,
      quality: profiles[r.id].quality,
    }));
    routes
      .filter((r) => !r.retiring && key(r.from, r.to) === l.key)
      .forEach((r) =>
        options.push({
          kind: "player",
          id: r.id,
          price: r.price,
          cap:
            (types[r.type][1] * r.count * hours) /
            (r.duration / 3600000 +
              (r.turnMinutes || 60) / 60 +
              (r.buffer || 0) / 60 +
              (r.frequency
                ? Math.max(
                    0,
                    24 / (r.frequency * 2) -
                      (r.duration / 3600000 + (r.turnMinutes || 60) / 60),
                  )
                : 0)),
          quality:
            (m.playerQuality?.[r.air] || 1.1) *
            (r.service === "premium" ? 1.14 : r.service === "light" ? 0.87 : 1),
        }),
      );
    options.forEach((o) => {
      o.weight =
        o.quality *
        Math.exp(-1.65 * (o.price / ref - 1)) *
        Math.sqrt(o.cap / 180);
      o.pax = 0;
    });
    let remaining = demand;
    let active = options.slice();
    for (let pass = 0; pass <= options.length && active.length; pass++) {
      const total = active.reduce((n, o) => n + o.weight, 0.65);
      const full = active.filter(
        (o) => (remaining * o.weight) / total >= o.cap,
      );
      if (!full.length) {
        active.forEach((o) => (o.pax = (remaining * o.weight) / total));
        break;
      }
      full.forEach((o) => {
        o.pax = o.cap;
        remaining -= o.cap;
      });
      active = active.filter((o) => !full.includes(o));
    }
    return {
      players: options.filter((o) => o.kind === "player"),
      rivals: options.filter((o) => o.kind === "rival"),
      demand,
    };
  }
  function flight(m, r, routes, types) {
    const l = lane(m, r.from, r.to),
      result = outcome(m, l, routes, types),
      own = result.players.find((o) => o.id === r.id);
    if (!own) return { pax: 0, load: 0, share: 0, rivals: 0 };
    const pax = Math.floor(
      Math.min(types[r.type][1], (own.pax / own.cap) * types[r.type][1]),
    );
    return {
      pax,
      load: pax / types[r.type][1],
      share: own.pax / result.demand,
      rivals: l.rivals.length,
    };
  }
  function advance(m, routes, types, time, elapsed = interval) {
    economy(m);
    const earnings = profiles.map(() => 0);
    const results = new Map(
      m.lanes.map((l) => [l, outcome(m, l, routes, types)]),
    );
    m.time = time;
    const before = profiles.map((p, id) => used(m, id));
    // Flights repeat automatically, including a 45-minute ground turnaround.
    for (const l of m.lanes) {
      const result = results.get(l),
        hours = Math.max(0.5, l.distance / 850),
        cycles = elapsed / 3600000 / (hours + 0.75);
      for (const o of result.rivals) {
        const c = m.companies[o.id],
          flights = (o.cap / 180) * cycles;
        const revenue = o.pax * o.price * cycles;
        const costs =
          flights *
            (850 +
              180 * 6.2 +
              l.distance +
              hours * 700 +
              hours * 2600 * (m.fuelPrice || 0.9)) +
          o.pax * 34 * cycles;
        earnings[o.id] += revenue - costs;
        c.flights += flights;
        c.passengers += o.pax * cycles;
      }
    }
    m.companies.forEach((c) => {
      const result = earnings[c.id] - (c.fleet * 17150 * elapsed) / 86400000;
      c.cash += result;
      c.profit += result;
      c.lastProfit = (result * 86400000) / elapsed;
    });
    m.round++;
    for (const l of m.lanes) {
      const result = results.get(l),
        ref = reference(l.distance);
      for (const r of l.rivals) {
        const o = result.rivals.find((o) => o.id === r.id),
          load = o.pax / r.capacity,
          old = r.price;
        r.share = o.pax / result.demand;
        const target = ref * profiles[r.id].fare * (0.83 + 0.28 * load);
        r.price = Math.round(
          Math.max(
            ref * 0.38,
            Math.min(ref * 1.55, old * 0.65 + target * 0.35),
          ),
        );
        if (load > 0.8 && m.companies[r.id].cash > 100000000) {
          const capacity = Math.min(700, Math.round(r.capacity * 1.08));
          const extra = Math.ceil(capacity / 180) - Math.ceil(r.capacity / 180);
          if (before[r.id] + extra <= m.companies[r.id].fleet) {
            r.capacity = capacity;
            before[r.id] += extra;
          }
        } else if (load < 0.38) {
          const oldPlanes = Math.ceil(r.capacity / 180);
          r.capacity = Math.max(70, Math.round(r.capacity * 0.92));
          before[r.id] += Math.ceil(r.capacity / 180) - oldPlanes;
        }
        if (result.players.length && Math.abs(r.price - old) >= 4)
          m.events.unshift({
            time,
            text: `${profiles[r.id].name}: ${l.from} ↔ ${l.to} jetzt ${r.price} € (${r.price < old ? "Preissenkung" : "Preiserhöhung"}).`,
          });
      }
      // A rival can enter or leave a market, with at most four rival offers.
      if (m.round % 4 === 0) {
        const served =
          result.rivals.reduce((n, o) => n + o.pax, 0) +
          result.players.reduce((n, o) => n + o.pax, 0);
        const id = hash(l.key + m.round) % profiles.length;
        if (
          served / l.demand < 0.8 &&
          l.rivals.length < 4 &&
          !l.rivals.some((r) => r.id === id) &&
          (l.distance < 3300 || id !== 9) &&
          before[id] < m.companies[id].fleet &&
          m.companies[id].cash > 100000000
        ) {
          before[id]++;
          l.rivals.push({
            id,
            price: Math.round(ref * profiles[id].fare),
            capacity: 140,
            share: 0,
          });
          if (result.players.length)
            m.events.unshift({
              time,
              text: `${profiles[id].name} steigt auf ${l.from} ↔ ${l.to} ein.`,
            });
        } else if (l.rivals.length > 1) {
          const weak = l.rivals.find((r) => r.share < 0.055);
          if (weak) {
            before[weak.id] -= Math.ceil(weak.capacity / 180);
            l.rivals = l.rivals.filter((r) => r !== weak);
            if (result.players.length)
              m.events.unshift({
                time,
                text: `${profiles[weak.id].name} zieht sich von ${l.from} ↔ ${l.to} zurück.`,
              });
          }
        }
      }
    }
    if (m.round % 4 === 0)
      for (const c of m.companies) {
        const count =
          c.lastProfit > 0
            ? Math.max(
                0,
                Math.min(3, Math.floor((c.cash - 400000000) / 65000000)),
              )
            : 0;
        if (count) {
          c.cash -= count * 65000000;
          c.fleet += count;
          c.purchased += count;
          m.events.unshift({
            time,
            text: `${profiles[c.id].name} kauft ${count} Flugzeuge und baut die Flotte auf ${c.fleet} aus.`,
          });
        }
      }
    m.events = m.events.slice(0, 30);
    m.next = time + interval;
  }
  return {
    profiles,
    interval,
    key,
    reference,
    create,
    economy,
    lane,
    outcome,
    flight,
    advance,
  };
})();
if (typeof module !== "undefined") module.exports = AirlineMarket;
