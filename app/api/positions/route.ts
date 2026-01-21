import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy, Timestamp } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
        return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    try {
        const q = query(
            collection(db, "positions"),
            where("userId", "==", userId)
        );
        // Ideally order by updatedAt, but simpler query first

        const snapshot = await getDocs(q);
        const positions = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            updatedAt: (doc.data().updatedAt as Timestamp)?.toDate().toISOString()
        }));

        return NextResponse.json(positions);
    } catch (error) {
        console.error("Error fetching positions:", error);
        return NextResponse.json({ error: "Failed to fetch positions" }, { status: 500 });
    }
}
