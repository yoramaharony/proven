import { db } from "@/lib/firebase";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    try {
        const docRef = doc(db, "markets", id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return NextResponse.json({ error: "Market not found" }, { status: 404 });
        }

        const data = docSnap.data();
        const market = {
            id: docSnap.id,
            ...data,
            tradingClosesAt: (data.tradingClosesAt as Timestamp)?.toDate().toISOString(),
            expectedResolutionAt: (data.expectedResolutionAt as Timestamp)?.toDate().toISOString(),
            createdAt: (data.createdAt as Timestamp)?.toDate().toISOString(),
        };

        return NextResponse.json(market);
    } catch (error) {
        console.error("Error fetching market:", error);
        return NextResponse.json({ error: "Failed to fetch market" }, { status: 500 });
    }
}
