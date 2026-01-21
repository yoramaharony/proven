import { db } from "@/lib/firebase";
import { collection, addDoc, Timestamp, writeBatch, doc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const batch = writeBatch(db);

        // Demo Markets
        const markets = [
            {
                question: "Will OpenAI release GPT-5 before July 2026?",
                category: "TECH",
                yesPrice: 0.35,
                volumeUSDC: 1245000,
                tags: ["AI", "OpenAI"]
            },
            {
                question: "Will Bitcoin exceed $150,000 in 2026?",
                category: "CROSSOVER",
                yesPrice: 0.62,
                volumeUSDC: 8500000,
                tags: ["Crypto", "Finance"]
            },
            {
                question: "Will Apple acquire a major EV manufacturer by Q4 2026?",
                category: "TECH",
                yesPrice: 0.12,
                volumeUSDC: 450000,
                tags: ["Apple", "Auto"]
            },
            {
                question: "Will the US Federal Reserve cut rates below 3% in 2026?",
                category: "GEO",
                yesPrice: 0.75,
                volumeUSDC: 3200000,
                tags: ["Fed", "Economy"]
            },
            {
                question: "Will SpaceX land humans on Mars before 2030?",
                category: "TECH",
                yesPrice: 0.28,
                volumeUSDC: 980000,
                tags: ["SpaceX", "Mars"]
            },
            {
                question: "Will TikTok be banned in the US by end of 2026?",
                category: "GEO",
                yesPrice: 0.45,
                volumeUSDC: 5600000,
                tags: ["TikTok", "Policy"]
            },
            {
                question: "Will NVIDIA market cap surpass $5T in 2026?",
                category: "CROSSOVER",
                yesPrice: 0.55,
                volumeUSDC: 4100000,
                tags: ["Stocks", "AI"]
            }
        ];

        const marketCol = collection(db, "markets");

        markets.forEach((m) => {
            const newRef = doc(marketCol); // Auto ID
            batch.set(newRef, {
                question: m.question,
                category: m.category,
                description: `Market for: ${m.question}. Resolution based on major news outlets.`,
                resolutionCriteria: "Resolution by consensus of AP, Reuters, and Bloomberg.",
                status: "OPEN",
                tradingClosesAt: Timestamp.fromDate(new Date("2026-12-31T23:59:59Z")),
                expectedResolutionAt: Timestamp.fromDate(new Date("2027-01-01T12:00:00Z")),
                yesPrice: m.yesPrice,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
                resolvedOutcome: null,
                resolutionSourceUrl: null,
                resolutionNotes: null,
                volumeUSDC: m.volumeUSDC,
                openInterest: m.volumeUSDC * 0.8, // Demo logic
            });
        });

        await batch.commit();

        return NextResponse.json({ success: true, message: `Seeded ${markets.length} markets` });
    } catch (error) {
        console.error("Error seeding markets:", error);
        return NextResponse.json({ error: "Failed to seed markets" }, { status: 500 });
    }
}
