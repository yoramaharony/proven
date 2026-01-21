import { initializeApp, getApps } from "firebase/app";
import {
  Timestamp,
  collection,
  connectFirestoreEmulator,
  doc,
  getDocs,
  getFirestore,
  writeBatch,
} from "firebase/firestore";
import net from "node:net";

/**
 * Seeds the local Firestore emulator with realistic demo data.
 *
 * Usage:
 *   node scripts/seed-emulator.mjs            # seed (non-destructive for existing docs with same IDs)
 *   node scripts/seed-emulator.mjs --wipe     # delete seeded collections first, then seed
 */

const args = new Set(process.argv.slice(2));
const WIPE = args.has("--wipe") || args.has("--clear");

function canConnect(host, port, timeoutMs = 800) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const done = (ok) => {
      try {
        socket.destroy();
      } catch {
        // ignore
      }
      resolve(ok);
    };
    socket.setTimeout(timeoutMs);
    socket.once("error", () => done(false));
    socket.once("timeout", () => done(false));
    socket.connect(port, host, () => done(true));
  });
}

const firebaseConfig = {
  apiKey: "demo-key",
  authDomain: "demo-project.firebaseapp.com",
  projectId: "demo-project",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
connectFirestoreEmulator(db, "127.0.0.1", 8080);

const now = Date.now();
const isoDay = 24 * 60 * 60 * 1000;

const users = [
  // Wallet-like ids to match UI’s wagmi address usage
  { id: "0x1111111111111111111111111111111111111111", label: "Alice" },
  { id: "0x2222222222222222222222222222222222222222", label: "Bob" },
  { id: "0x3333333333333333333333333333333333333333", label: "Charlie" },
];

const markets = [
  {
    id: "m_gpt5_2026",
    question: "Will OpenAI release GPT-5 before July 2026?",
    category: "TECH",
    yesPrice: 0.35,
    status: "OPEN",
    volumeUSDC: 1245000,
  },
  {
    id: "m_btc_150k_2026",
    question: "Will Bitcoin exceed $150,000 in 2026?",
    category: "CROSSOVER",
    yesPrice: 0.62,
    status: "OPEN",
    volumeUSDC: 8500000,
  },
  {
    id: "m_tiktok_ban_2026",
    question: "Will TikTok be banned in the US by end of 2026?",
    category: "GEO",
    yesPrice: 0.45,
    status: "OPEN",
    volumeUSDC: 5600000,
  },
  {
    id: "m_fed_below_3_2026",
    question: "Will the US Federal Reserve cut rates below 3% in 2026?",
    category: "GEO",
    yesPrice: 0.75,
    status: "RESOLVED",
    resolvedOutcome: "YES",
    volumeUSDC: 3200000,
  },
  {
    id: "m_spacex_mars_2030",
    question: "Will SpaceX land humans on Mars before 2030?",
    category: "TECH",
    yesPrice: 0.28,
    status: "LOCKED",
    volumeUSDC: 980000,
  },
];

async function wipeCollections() {
  const collectionsToWipe = ["markets", "positions", "trades", "priceTicks"];
  for (const colName of collectionsToWipe) {
    const snap = await getDocs(collection(db, colName));
    if (snap.empty) continue;
    // Delete in chunks (batch limit 500)
    const docs = snap.docs;
    for (let i = 0; i < docs.length; i += 450) {
      const batch = writeBatch(db);
      for (const d of docs.slice(i, i + 450)) {
        batch.delete(d.ref);
      }
      await batch.commit();
    }
  }
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function mkTicks(marketId, baseYesPrice) {
  // 30 days of ticks with gentle drift
  const ticks = [];
  let p = baseYesPrice;
  for (let day = 30; day >= 0; day--) {
    const t = now - day * isoDay;
    const drift = (Math.sin(day / 3) * 0.015) + (Math.cos(day / 7) * 0.01);
    p = clamp(p + drift, 0.01, 0.99);
    ticks.push({
      id: `pt_${marketId}_${day}`,
      marketId,
      yesPrice: Number(p.toFixed(4)),
      createdAt: Timestamp.fromMillis(t),
    });
  }
  return ticks;
}

function mkTradesAndPositions() {
  const trades = [];
  const positions = new Map(); // key: `${userId}_${marketId}_${side}`

  // A simple deterministic pattern so it’s consistent across seeds.
  const tradeTemplates = [
    { userIdx: 0, marketIdx: 0, side: "YES", usdc: 250 },
    { userIdx: 1, marketIdx: 1, side: "NO", usdc: 500 },
    { userIdx: 2, marketIdx: 2, side: "YES", usdc: 125 },
    { userIdx: 0, marketIdx: 1, side: "YES", usdc: 300 },
    { userIdx: 1, marketIdx: 2, side: "YES", usdc: 200 },
    { userIdx: 2, marketIdx: 0, side: "NO", usdc: 400 },
  ];

  let tradeCounter = 0;
  for (const tpl of tradeTemplates) {
    const userId = users[tpl.userIdx].id;
    const m = markets[tpl.marketIdx];
    const fillPrice = tpl.side === "YES" ? m.yesPrice : 1 - m.yesPrice;
    const quantity = tpl.usdc / fillPrice;
    const createdAt = Timestamp.fromMillis(now - (14 - tradeCounter) * isoDay);
    const tradeId = `t_${userId.slice(2, 6)}_${m.id}_${tradeCounter}`;

    trades.push({
      id: tradeId,
      marketId: m.id,
      userId,
      side: tpl.side,
      price: Number(fillPrice.toFixed(4)),
      quantity: Number(quantity.toFixed(6)),
      usdcAmount: tpl.usdc,
      createdAt,
    });

    // Accumulate into deterministic position id (matches the API logic)
    const posId = `${userId}_${m.id}_${tpl.side}`;
    const existing = positions.get(posId);
    if (!existing) {
      positions.set(posId, {
        id: posId,
        userId,
        marketId: m.id,
        side: tpl.side,
        quantity,
        avgEntryPrice: fillPrice,
        realizedPnl: 0,
        updatedAt: createdAt,
      });
    } else {
      const totalCost = existing.quantity * existing.avgEntryPrice + tpl.usdc;
      const newQty = existing.quantity + quantity;
      existing.quantity = newQty;
      existing.avgEntryPrice = totalCost / newQty;
      existing.updatedAt = createdAt;
    }

    tradeCounter++;
  }

  return {
    trades,
    positions: Array.from(positions.values()).map((p) => ({
      ...p,
      quantity: Number(p.quantity.toFixed(6)),
      avgEntryPrice: Number(p.avgEntryPrice.toFixed(6)),
    })),
  };
}

async function seed() {
  const ok = await canConnect("127.0.0.1", 8080);
  if (!ok) {
    console.error(
      "Firestore emulator is not reachable at 127.0.0.1:8080. Start it first (firebase emulators:start)."
    );
    process.exit(1);
  }

  if (WIPE) {
    console.log("Wiping emulator collections...");
    await wipeCollections();
  }

  console.log("Seeding markets...");
  const batch = writeBatch(db);

  for (const m of markets) {
    const ref = doc(db, "markets", m.id);
    batch.set(ref, {
      id: m.id,
      question: m.question,
      category: m.category,
      description: `Market for: ${m.question}. Resolution based on major news outlets.`,
      resolutionCriteria: "Resolution by consensus of AP, Reuters, and Bloomberg.",
      status: m.status,
      tradingClosesAt: Timestamp.fromMillis(now + 45 * isoDay),
      expectedResolutionAt: Timestamp.fromMillis(now + 60 * isoDay),
      yesPrice: m.yesPrice,
      createdAt: Timestamp.fromMillis(now - 21 * isoDay),
      updatedAt: Timestamp.fromMillis(now - 1 * isoDay),
      resolvedOutcome: m.resolvedOutcome ?? null,
      resolutionSourceUrl:
        m.status === "RESOLVED" ? "https://example.com/resolution" : null,
      resolutionNotes: m.status === "RESOLVED" ? "Resolved in seed data." : null,
      volumeUSDC: m.volumeUSDC,
      openInterest: Math.round(m.volumeUSDC * 0.8),
    });
  }

  await batch.commit();

  console.log("Seeding price ticks...");
  const ticks = markets.flatMap((m) => mkTicks(m.id, m.yesPrice));
  for (let i = 0; i < ticks.length; i += 450) {
    const b = writeBatch(db);
    for (const t of ticks.slice(i, i + 450)) {
      b.set(doc(db, "priceTicks", t.id), t);
    }
    await b.commit();
  }

  console.log("Seeding trades + positions...");
  const { trades, positions } = mkTradesAndPositions();

  for (let i = 0; i < trades.length; i += 450) {
    const b = writeBatch(db);
    for (const tr of trades.slice(i, i + 450)) {
      b.set(doc(db, "trades", tr.id), tr);
    }
    await b.commit();
  }

  for (let i = 0; i < positions.length; i += 450) {
    const b = writeBatch(db);
    for (const p of positions.slice(i, i + 450)) {
      b.set(doc(db, "positions", p.id), p);
    }
    await b.commit();
  }

  console.log("Seed complete.");
  console.log(
    `Created: ${markets.length} markets, ${ticks.length} priceTicks, ${positions.length} positions, ${trades.length} trades.`
  );
}

await seed();
