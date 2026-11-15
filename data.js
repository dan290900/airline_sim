const KEY = "lufthansa-manager-v2";
const airports = [
  ["FRA", "Frankfurt", 50.04, 8.56],
  ["MUC", "München", 48.35, 11.79],
  ["ZRH", "Zürich", 47.46, 8.55],
  ["VIE", "Wien", 48.11, 16.57],
  ["LHR", "London", 51.47, -0.45],
  ["CDG", "Paris", 49.01, 2.55],
  ["AMS", "Amsterdam", 52.31, 4.76],
  ["MAD", "Madrid", 40.47, -3.56],
  ["FCO", "Rom", 41.8, 12.25],
  ["BER", "Berlin", 52.37, 13.5],
  ["HAM", "Hamburg", 53.63, 10],
  ["BCN", "Barcelona", 41.3, 2.08],
  ["ATH", "Athen", 37.94, 23.94],
  ["IST", "Istanbul", 41.26, 28.74],
  ["JFK", "New York", 40.64, -73.78],
  ["EWR", "Newark", 40.69, -74.17],
  ["LAX", "Los Angeles", 33.94, -118.41],
  ["SFO", "San Francisco", 37.62, -122.38],
  ["ORD", "Chicago", 41.98, -87.9],
  ["MIA", "Miami", 25.79, -80.29],
  ["BOS", "Boston", 42.36, -71],
  ["YYZ", "Toronto", 43.68, -79.63],
  ["GRU", "São Paulo", -23.43, -46.47],
  ["MEX", "Mexiko-Stadt", 19.44, -99.07],
  ["DXB", "Dubai", 25.25, 55.36],
  ["DEL", "Neu-Delhi", 28.56, 77.1],
  ["BOM", "Mumbai", 19.09, 72.87],
  ["HND", "Tokio", 35.55, 139.78],
  ["PVG", "Shanghai", 31.14, 121.81],
  ["PEK", "Peking", 40.08, 116.59],
  ["SIN", "Singapur", 1.36, 103.99],
  ["BKK", "Bangkok", 13.69, 100.75],
  ["JNB", "Johannesburg", -26.14, 28.25],
  ["CPT", "Kapstadt", -33.97, 18.6],
  ["CAI", "Kairo", 30.12, 31.41],
  ["LIS", "Lissabon", 38.77, -9.13],
  ["OSL", "Oslo", 60.19, 11.1],
  ["ARN", "Stockholm", 59.65, 17.92],
  ["PRG", "Prag", 50.1, 14.26],
  ["BUD", "Budapest", 47.44, 19.26],
];
const types = [
  ["Airbus A319-100", 138, 6900, 830, 55, 2400],
  ["Airbus A320-200", 180, 6100, 830, 65, 2600],
  ["Airbus A320neo", 180, 6300, 830, 85, 2200],
  ["Airbus A321-200", 200, 5900, 830, 80, 3100],
  ["Airbus A321neo", 215, 7400, 830, 105, 2600],
  ["Airbus A220-300", 145, 6300, 820, 75, 1900],
  ["Embraer E195", 120, 4200, 800, 48, 1700],
  ["Airbus A330-300", 255, 11750, 870, 155, 5700],
  ["Airbus A340-300", 279, 13000, 880, 135, 7200],
  ["Airbus A340-600", 297, 14000, 880, 180, 9000],
  ["Airbus A350-900", 293, 15000, 900, 240, 5600],
  ["Boeing 747-400", 371, 13450, 900, 210, 10500],
  ["Boeing 747-8", 364, 14320, 900, 300, 9500],
  ["Boeing 777-300ER", 340, 13650, 900, 270, 8000],
  ["Boeing 787-9", 294, 14100, 900, 230, 5600],
  ["Airbus A380-800", 509, 14800, 900, 350, 12000],
  ["Boeing 777-200ER", 306, 13000, 890, 150, 7800],
  ["Boeing 737 MAX 8", 189, 6500, 840, 100, 2400],
];
airports.push(
  ["BRU", "Brüssel", 50.9, 4.48],
  ["DUS", "Düsseldorf", 51.29, 6.77],
  ["PMI", "Palma de Mallorca", 39.55, 2.74],
  ["HER", "Heraklion", 35.34, 25.18],
  ["TFS", "Teneriffa", 28.04, -16.57],
  ["IBZ", "Ibiza", 38.87, 1.37],
  ["FAO", "Faro", 37.01, -7.97],
);
const brands = {
  LH: {
    name: "Lufthansa",
    hub: "FRA",
    hubs: ["FRA", "MUC"],
    color: "#ffb800",
    role: "Netzwerk-Airline",
    country: "Deutschland",
    quality: 1.13,
  },
  LX: {
    name: "SWISS",
    hub: "ZRH",
    hubs: ["ZRH"],
    color: "#d71920",
    role: "Premium-Netzwerk",
    country: "Schweiz",
    quality: 1.19,
  },
  OS: {
    name: "Austrian Airlines",
    hub: "VIE",
    hubs: ["VIE"],
    color: "#d51d36",
    role: "Netzwerk-Airline",
    country: "Österreich",
    quality: 1.1,
  },
  SN: {
    name: "Brussels Airlines",
    hub: "BRU",
    hubs: ["BRU"],
    color: "#b01745",
    role: "Netzwerk-Airline",
    country: "Belgien",
    quality: 1.06,
  },
  EW: {
    name: "Eurowings",
    hub: "DUS",
    hubs: ["DUS", "HAM", "BER"],
    color: "#a60055",
    role: "Value-Airline",
    country: "Deutschland",
    quality: 0.97,
  },
  "4Y": {
    name: "Discover Airlines",
    hub: "FRA",
    hubs: ["FRA", "MUC"],
    color: "#00a0ce",
    role: "Ferienflug",
    country: "Deutschland",
    quality: 1.04,
  },
  WK: {
    name: "Edelweiss",
    hub: "ZRH",
    hubs: ["ZRH"],
    color: "#cf1639",
    role: "Ferienflug",
    country: "Schweiz",
    quality: 1.08,
  },
  EN: {
    name: "Air Dolomiti",
    hub: "MUC",
    hubs: ["MUC", "FRA"],
    color: "#008e8e",
    role: "Regional-Zubringer",
    country: "Italien",
    quality: 1.03,
  },
};
const SERVICES = {
  standard: { name: "Classic", quality: 1, cost: 9 },
  premium: { name: "Premium", quality: 1.14, cost: 22 },
  light: { name: "Light", quality: 0.87, cost: 3 },
};
const HUB_RULES = {
  FRA: { zone: "Europe/Berlin", close: 23, open: 5 },
  MUC: { zone: "Europe/Berlin", close: 0, open: 5 },
  ZRH: { zone: "Europe/Zurich", close: 23, open: 6 },
};
const HOUR = 3600000,
  DAY = 24 * HOUR;
const compact = (n) =>
  Math.abs(n) >= 1e9
    ? (n / 1e9).toLocaleString("de-DE", { maximumFractionDigits: 2 }) +
      " Mrd. €"
    : Math.abs(n) >= 1e6
      ? (n / 1e6).toLocaleString("de-DE", { maximumFractionDigits: 1 }) +
        " Mio. €"
      : money(n);
const pct = (n) =>
  Number.isFinite(n)
    ? (n * 100).toLocaleString("de-DE", { maximumFractionDigits: 0 }) + " %"
    : "Nicht erreichbar";
const duration = (ms) => {
  const minutes = Math.max(0, Math.ceil(ms / 60000));
  return (
    Math.floor(minutes / 60) +
    "h " +
    String(minutes % 60).padStart(2, "0") +
    "m"
  );
};
const timeLabel = (t) =>
  new Date(t).toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
const dateLabel = (t) =>
  new Date(t).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  });
function hash(str) {
  return [...String(str)].reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 7);
}
const money = (n) =>
    new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(n),
  num = (n) => Math.round(n).toLocaleString("de-DE"),
  ap = (c) => airports.find((a) => a[0] === c),
  esc = (s) =>
    String(s).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
function km(a, b) {
  let r = Math.PI / 180,
    d = (b[2] - a[2]) * r,
    e = (b[3] - a[3]) * r;
  return Math.round(
    12742 *
      Math.asin(
        Math.sqrt(
          Math.sin(d / 2) ** 2 +
            Math.cos(a[2] * r) * Math.cos(b[2] * r) * Math.sin(e / 2) ** 2,
        ),
      ),
  );
}

function base() {
  const now = Date.now(),
    fleet = [],
    routes = [];
  const add = (air, type, count) =>
    fleet.push({
      id: fleet.length + 1,
      air,
      type,
      count,
      condition: 92 + (fleet.length % 7),
    });
  [
    ["LH", 2, 18],
    ["LH", 4, 10],
    ["LH", 10, 12],
    ["LH", 12, 5],
    ["LH", 14, 6],
    ["LX", 5, 10],
    ["LX", 13, 7],
    ["LX", 7, 5],
    ["OS", 6, 8],
    ["OS", 1, 8],
    ["OS", 14, 4],
    ["SN", 1, 6],
    ["SN", 7, 4],
    ["EW", 2, 10],
    ["EW", 4, 6],
    ["4Y", 1, 4],
    ["4Y", 7, 4],
    ["WK", 1, 4],
    ["WK", 10, 3],
    ["EN", 6, 6],
  ].forEach((x) => add(...x));
  function seed(air, from, to, type, count = 1) {
    const distance = km(ap(from), ap(to));
    routes.push({
      id: routes.length + 1,
      air,
      from,
      to,
      type,
      count,
      price: Math.round(AirlineMarket.reference(distance) * 1.04),
      duration: blockTime(distance, type),
      service: air === "EW" ? "light" : "standard",
      buffer: 15,
      phase: "ground",
      next: now + (10 + (routes.length % 6) * 12) * 60000,
      legs: 0,
    });
  }
  [
    "LHR",
    "CDG",
    "AMS",
    "MAD",
    "FCO",
    "BER",
    "HAM",
    "BCN",
    "ATH",
    "IST",
    "LIS",
    "OSL",
  ].forEach((to, i) =>
    seed(
      "LH",
      i % 3 === 0 ? "MUC" : "FRA",
      to,
      i % 4 === 0 ? 4 : 2,
      i < 4 ? 2 : 1,
    ),
  );
  [
    "JFK",
    "LAX",
    "SFO",
    "ORD",
    "MIA",
    "SIN",
    "HND",
    "DEL",
    "GRU",
    "JNB",
  ].forEach((to, i) =>
    seed("LH", i % 3 === 0 ? "MUC" : "FRA", to, [10, 12, 14][i % 3], 1),
  );
  ["LHR", "CDG", "BER", "BCN", "FCO", "AMS"].forEach((to) =>
    seed("LX", "ZRH", to, 5),
  );
  ["JFK", "SIN", "HND", "BKK", "MIA"].forEach((to) =>
    seed("LX", "ZRH", to, 13),
  );
  ["FRA", "LHR", "CDG", "BER", "FCO"].forEach((to, i) =>
    seed("OS", "VIE", to, i % 2 ? 1 : 6),
  );
  ["JFK", "BKK", "HND"].forEach((to) => seed("OS", "VIE", to, 14));
  ["LHR", "MAD", "FCO"].forEach((to) => seed("SN", "BRU", to, 1));
  ["JFK", "JNB"].forEach((to) => seed("SN", "BRU", to, 7));
  ["PMI", "BCN", "HER", "TFS", "LHR", "BER"].forEach((to) =>
    seed("EW", "DUS", to, 2),
  );
  ["PMI", "TFS"].forEach((to) => seed("4Y", "FRA", to, 1));
  ["MIA", "CPT"].forEach((to) => seed("4Y", "FRA", to, 7));
  ["PMI", "HER"].forEach((to) => seed("WK", "ZRH", to, 1));
  ["CPT", "BKK"].forEach((to) => seed("WK", "ZRH", to, 10));
  ["FCO", "PRG", "BUD", "VIE"].forEach((to) => seed("EN", "MUC", to, 6));
  return {
    version: 2,
    operationsVersion: 3,
    cash: 900000000,
    fuel: 8500000,
    staff: 0,
    fleet,
    routes,
    orders: [],
    completed: 0,
    profit: 0,
    last: now,
    log: [
      "Willkommen im Operations Center. Dein Auftrag: die Gruppe profitabel und zuverlässig führen.",
    ],
    nextId: routes.length + 1,
  };
}
function blockTime(distance, type) {
  return (
    Math.round(((0.35 + distance / (types[type][3] * 0.88)) * HOUR) / 60000) *
    60000
  );
}
