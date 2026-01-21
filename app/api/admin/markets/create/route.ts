import { db } from "@/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            question,
            category,
            description,
            resolutionCriteria,
            tradingClosesAt,
            expectedResolutionAt,
            initialProbability = 0.5
        } = body;

        const marketData = {
            question,
            category,
            description: description || "",
            resolutionCriteria,
            status: "OPEN",
            tradingClosesAt: Timestamp.fromDate(new Date(tradingClosesAt)), // Expecting ISO string
            expectedResolutionAt: Timestamp.fromDate(new Date(expectedResolutionAt)),
            yesPrice: initialProbability,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            resolvedOutcome: null,
            resolutionSourceUrl: null,
            resolutionNotes: null,
            volumeUSDC: 0,
            openInterest: 0,
        };

        const docRef = await addDoc(collection(db, "markets"), marketData);

        return NextResponse.json({ id: docRef.id, ...marketData });
    } catch (error) {
        console.error("Error creating market:", error);
        return NextResponse.json({ error: "Failed to create market" }, { status: 500 });
    }
}
