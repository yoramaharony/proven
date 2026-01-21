import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore";
import { NextResponse } from "next/server";
import { Market, MarketJson } from "@/lib/types";

function toIso(value: unknown): string {
    if (value instanceof Timestamp) return value.toDate().toISOString();
    if (typeof value === "string") return value;
    // Fallback: avoid throwing from the API layer; consumers can treat epoch as "missing"
    return new Date(0).toISOString();
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");

    try {
        const q = collection(db, "markets");
        // Note: Complex queries in Firestore might require composite indexes.
        // For demo, we might fetch all and filter in memory if volume is low, or stick to simple queries.
        // Let's try simple filtering.

        const constraints = [];
        if (category && category !== "ALL") {
            constraints.push(where("category", "==", category));
        }
        if (status) {
            constraints.push(where("status", "==", status));
        }

        // Order by createdAt desc (Newest first)
        // Firestore requires index for filtering + sorting. 
        // If it fails, check console link to create index.
        // For now, let's just sort in JS to avoid index setup for demo speed.

        // const finalQuery = query(q, ...constraints, orderBy("createdAt", "desc"));
        const finalQuery = constraints.length ? query(q, ...constraints) : q; // Just filter

        const querySnapshot = await getDocs(finalQuery);
        const markets: MarketJson[] = [];

        querySnapshot.forEach((snap) => {
            const data = snap.data() as Omit<Market, "id">;
            // Convert Timestamps to JS Dates or serializable strings if needed by client,
            // but usually JSON serializes them as object. 
            // Better to map them to strings or numbers for client consumption.
            const { tradingClosesAt, expectedResolutionAt, createdAt, updatedAt, ...rest } = data;
            markets.push({
                id: snap.id,
                ...rest,
                tradingClosesAt: toIso(tradingClosesAt),
                expectedResolutionAt: toIso(expectedResolutionAt),
                createdAt: toIso(createdAt),
                updatedAt: toIso(updatedAt),
            });
        });

        // In-memory sort
        markets.sort((a, b) => {
            const tA = Date.parse(a.createdAt);
            const tB = Date.parse(b.createdAt);
            return tB - tA;
        });

        return NextResponse.json(markets);
    } catch (error) {
        console.error("Error fetching markets:", error);
        return NextResponse.json({ error: "Failed to fetch markets" }, { status: 500 });
    }
}
