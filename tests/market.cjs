const assert = require("node:assert/strict");
const fs = require("node:fs"),
  vm = require("node:vm"),
  path = require("node:path");
const root = path.resolve(__dirname, ".."),
  A = require(path.join(root, "market.js"));
const airports = [
    ["FRA", "Frankfurt", 0, 0],
    ["LHR", "London", 0, 1],
    ["JFK", "New York", 0, 2],
  ],
  types = [["Test", 180, 6000, 850, 65, 2600]];
const market = A.create(airports, () => 1000, Date.UTC(2026, 10, 16, 12));
const r = {
  id: 1,
  air: "LH",
  from: "FRA",
  to: "LHR",
  type: 0,
  count: 2,
  price: 180,
  duration: 3600000,
};
const low = A.flight(market, r, [r], types),
  expensive = { ...r, price: 500 };
assert(A.flight(market, expensive, [expensive], types).pax < low.pax);
assert(A.flight(market, r, [r, { ...r, id: 2 }], types).pax <= low.pax);
for (let n = 0; n < 124; n++) {
  A.advance(market, [r], types, market.next);
  for (const l of market.lanes) {
    assert(l.rivals.length >= 1 && l.rivals.length <= 4);
    const o = A.outcome(market, l, [r], types);
    assert(
      o.players.concat(o.rivals).reduce((n, x) => n + x.pax, 0) <=
        o.demand + 1e-8,
    );
    for (const x of o.players.concat(o.rivals))
      assert(Number.isFinite(x.pax) && x.pax >= 0 && x.pax <= x.cap + 1e-8);
  }
  for (const c of market.companies)
    assert(
      market.lanes.reduce(
        (n, l) =>
          n +
          l.rivals
            .filter((r) => r.id === c.id)
            .reduce((v, r) => v + Math.ceil(r.capacity / 180), 0),
        0,
      ) <= c.fleet,
    );
}
assert.deepEqual(JSON.parse(JSON.stringify(market)), market);
function boot(saved) {
  const store = new Map(
      saved ? [["lufthansa-manager-v2", JSON.stringify(saved)]] : [],
    ),
    handlers = {},
    app = { addEventListener: (type, fn) => (handlers[type] = fn) };
  let wall = saved?.clock?.wall || Date.UTC(2026, 10, 16, 12);
  class TestDate extends Date {
    constructor(...args) {
      super(...(args.length ? args : [wall]));
    }
    static now() {
      return wall;
    }
  }
  const ctx = vm.createContext({
    console,
    Intl,
    Date: TestDate,
    confirm: () => true,
    Math,
    JSON,
    Number,
    String,
    Set,
    Map,
    Array,
    localStorage: {
      getItem: (k) => store.get(k),
      setItem: (k, v) => store.set(k, v),
    },
    document: {
      querySelector: (q) => (q === "#app" ? app : null),
      addEventListener() {},
    },
    setInterval() {},
    render() {},
  });
  for (const name of ["market.js", "data.js", "game.js"])
    vm.runInContext(fs.readFileSync(path.join(root, name), "utf8"), ctx);
  return {
    handlers,
    eval: (code) => vm.runInContext(code, ctx),
    setWall: (value) => (wall = value),
    advanceGame: (ms) => {
      wall += ms / 12;
      vm.runInContext("sync()", ctx);
    },
  };
}
const game = boot();
assert.equal(game.eval("Object.keys(brands).length"), 8);
assert(game.eval("s.routes.every(r=>r.aircraft.length===r.count)"));
assert.equal(
  game.eval("new Set(s.routes.flatMap(r=>r.aircraft)).size"),
  game.eval("s.routes.reduce((n,r)=>n+r.count,0)"),
);
assert(
  game.eval("s.routes.every(r=>km(ap(r.from),ap(r.to))<=types[r.type][2]*.95)"),
);
// Existing state is preserved, including the local clock and tail IDs.
const legacy = game.eval("JSON.parse(JSON.stringify(s))");
delete legacy.operationsVersion;
delete legacy.finance;
const migrated = boot(legacy);
assert.equal(migrated.eval("s.cash"), legacy.cash);
assert.equal(
  migrated.eval("s.fleet[0].aircraft[0]"),
  legacy.fleet[0].aircraft[0],
);
assert.equal(migrated.eval("s.operationsVersion"), 3);
// Start -> frozen bookings -> landing -> ground time -> automatic return.
const flights = boot();
flights.eval(
  "s.routes=[s.routes.find(r=>r.from==='FRA'&&r.to==='CDG')];s.routes[0].count=1;s.routes[0].aircraft=s.routes[0].aircraft.slice(0,1);s.routes[0].next=s.last+60000;s.automation={fuel:false,maintenance:false}",
);
const fuel = flights.eval("s.fuel");
flights.advanceGame(60000);
assert.equal(flights.eval("s.routes[0].phase"), "flight");
assert(flights.eval("s.fuel") < fuel);
const booked = flights.eval("s.routes[0].manifest.rev"),
  arrival = flights.eval("s.routes[0].next-gameNow()");
flights.eval("s.routes[0].price=5000;infoCache.clear()");
flights.advanceGame(arrival);
assert.equal(flights.eval("s.routes[0].stats.revenue"), booked);
assert.equal(flights.eval("s.routes[0].phase"), "ground");
assert.equal(flights.eval("s.routes[0].legs"), 1);
assert(flights.eval("s.routes[0].next-gameNow()>=60*60000"));
flights.advanceGame(flights.eval("s.routes[0].next-gameNow()"));
assert.equal(flights.eval("s.routes[0].phase"), "flight");
assert.equal(flights.eval("currentOrigin(s.routes[0])"), "CDG");
// Curfews constrain both takeoff and landing, in local time including DST.
assert.equal(game.eval("curfewOpen('FRA',Date.UTC(2026,10,16,22))"), false);
assert.equal(game.eval("curfewOpen('FRA',Date.UTC(2026,10,17,4))"), true);
assert.equal(game.eval("curfewOpen('FRA',Date.UTC(2026,6,16,21))"), false);
assert(
  game.eval(
    "legalDeparture({from:'FRA',to:'LHR',duration:HOUR,legs:0},Date.UTC(2026,10,16,22))>=Date.UTC(2026,10,17,4)",
  ),
);
// No fuel means no movement, no phantom arrival, and no free revenue.
const dry = boot();
dry.eval(
  "s.routes=[s.routes[0]];s.routes[0].next=s.last+60000;s.automation={fuel:false,maintenance:false};s.fuel=0",
);
dry.advanceGame(60000);
assert.equal(dry.eval("s.routes[0].legs"), 0);
assert.equal(dry.eval("s.completed"), 0);
assert(dry.eval("s.routes[0].stats.missed") > 0);
// Maintenance takes real simulation time and stops departures.
const tech = boot();
tech.eval(
  "s.routes=[];s.fleet[0].condition=60;s.fleet[0].maintenancePending=true;s.running={fuel:0,maintenance:0};startMaintenance(s.fleet[0],gameNow())",
);
assert.equal(tech.eval("s.fleet[0].condition"), 60);
assert.equal(tech.eval("s.fleet[0].maintenanceUntil-gameNow()"), 4 * 3600000);
tech.advanceGame(4 * 3600000);
assert.equal(tech.eval("s.fleet[0].condition"), 100);
// A real sale removes precisely one free tail and credits the stated value.
const sale = boot(),
  tail = sale.eval("aircraftAssignments(s.fleet[0]).find(a=>!a.route).tail"),
  before = sale.eval(
    "({cash:s.cash,count:s.fleet[0].count,value:saleValue(s.fleet[0])})",
  );
sale.eval(`sellAircraft(${JSON.stringify(tail)})`);
assert.equal(sale.eval("s.fleet[0].count"), before.count - 1);
assert.equal(sale.eval("s.cash"), before.cash + before.value);
const assigned = sale.eval("s.routes[0].aircraft[0]"),
  count = sale.eval("fleetTotal()");
sale.eval(`sellAircraft(${JSON.stringify(assigned)})`);
assert.equal(sale.eval("fleetTotal()"), count);
// Compare event-for-event active simulation and a single offline catch-up.
const shared = boot().eval("JSON.parse(JSON.stringify(s))"),
  once = boot(shared),
  often = boot(shared);
once.advanceGame(2 * 86400000);
for (let n = 0; n < 96; n++) often.advanceGame(1800000);
assert.equal(once.eval("s.completed"), often.eval("s.completed"));
assert(Math.abs(once.eval("s.cash") - often.eval("s.cash")) < 0.001);
assert.equal(once.eval("s.fuel"), often.eval("s.fuel"));
assert.equal(
  once.eval("s.market.companies[0].flights"),
  often.eval("s.market.companies[0].flights"),
);
assert(once.eval("s.market.companies.some(c=>c.purchased>0)"));
assert(
  once.eval("Number.isFinite(s.cash)&&Number.isFinite(s.fuel)&&s.fuel>=0"),
);
const ledgerNet = once.eval(
  'Object.values(s.finance.days).reduce((n,d)=>n+Object.entries(d).filter(([k])=>!["at","flights","missed","pax"].includes(k)).reduce((a,[k,v])=>a+v,0),0)',
);
assert(Math.abs(once.eval("s.cash") - shared.cash - ledgerNet) < 0.01);
const clock = game.eval("s.clock.sim"),
  wall = game.eval("s.clock.wall");
game.setWall(wall - 3600000);
game.eval("sync()");
assert.equal(game.eval("s.clock.sim"), clock);
assert(game.eval("validSave(JSON.parse(JSON.stringify(s)))"));
const invalid = game.eval("JSON.parse(JSON.stringify(s))");
invalid.routes[0].count = -1;
assert.equal(game.eval(`validSave(${JSON.stringify(invalid)})`), false);
console.log(
  "PASS: finite passenger demand, 124 AI rounds, funded capacity, eight Group airlines, unique assignments, range reserve, migration, frozen bookings, return flights, ground time, local/DST curfews, fuel cancellations, four-hour maintenance, aircraft sale/protection, two-day active/offline equivalence, ledger reconciliation, backwards clock, save validation.",
);
console.log(
  "Two-day scenario:",
  once.eval(
    "({flights:s.completed,cash:Math.round(s.cash),reliability:s.reliability,aiGrowth:s.market.companies.reduce((n,c)=>n+c.purchased,0)})",
  ),
);

// Long absence must keep clocks, inventories and company budgets finite.
const long = boot(shared);
long.advanceGame(30 * 86400000);
assert(
  long.eval("Number.isFinite(s.cash)&&s.fuel>=0&&s.market.next>gameNow()"),
);
assert(long.eval("Object.values(s.finance.days).some(d=>d.maintenance<0)"));
assert(long.eval("s.fleet.every(f=>f.condition>=0&&f.condition<=100)"));
console.log(
  "30-day scenario:",
  long.eval(
    "({flights:s.completed,cash:Math.round(s.cash),rounds:s.market.round,maintenanceSpend:Math.round(-Object.values(s.finance.days).reduce((n,d)=>n+d.maintenance,0))})",
  ),
);
