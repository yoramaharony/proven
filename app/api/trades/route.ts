import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
        return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    try {
        const q = query(
            collection(db, "trades"),
            where("userId", "==", userId)
        );

        const snapshot = await getDocs(q);
        const trades = snapshot.docs
            .map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: (doc.data().createdAt as Timestamp)?.toDate().toISOString()
            }))
            // Avoid composite index requirement in emulator by sorting in memory
            .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

        return NextResponse.json(trades);
    } catch (error) {
        console.error("Error fetching trades:", error);
        // Fallback if index missing
        return NextResponse.json({ error: "Failed to fetch trades (Check Indexes)" }, { status: 500 });
    }
}
