import { db } from "@/lib/firebase";
import { doc, runTransaction, Timestamp } from "firebase/firestore";
import { NextResponse } from "next/server";
import { Market } from "@/lib/types";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    try {
        const body = await request.json();
        const { outcome, resolutionSourceUrl, notes } = body; // outcome: "YES" | "NO"

        if (!id || !outcome) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const marketRef = doc(db, "markets", id);

        await runTransaction(db, async (transaction) => {
            const marketDoc = await transaction.get(marketRef);
            if (!marketDoc.exists()) {
                throw new Error("Market not found");
            }
            const market = marketDoc.data() as Market;

            if (market.status === "RESOLVED") {
                throw new Error("Market already resolved");
            }

            // Update Market
            transaction.update(marketRef, {
                status: "RESOLVED",
                resolvedOutcome: outcome,
                resolutionSourceUrl,
                resolutionNotes: notes,
                updatedAt: Timestamp.now(),
                // Set prices to reflect outcome?
                // YES wins -> yesPrice = 1.0, NO wins -> yesPrice = 0.0
                yesPrice: outcome === "YES" ? 1.0 : 0.0
            });

            // Payouts?
            // In a real system, we might process payouts async or allow users to "redeem".
            // The Spec says "Winning positions become redeemable".
            // So we don't auto-transfer USDC here, we just mark market resolved.
            // Users will call a "Redeem" action later (or we update their position status).
            // For this demo, let's just resolve the market. The UI will show "Redeem" button if resolved.

            // Optionally, we could calculate realizedPnl for all positions here, but that might be heavy for a txn.
            // Let's rely on the Redeem action (which we haven't specced but is implied).
            // Or just compute on the fly in UI.
        });

        return NextResponse.json({ success: true, id, outcome });
    } catch (error: unknown) {
        console.error("Error resolving market:", error);
        const message = error instanceof Error ? error.message : "Resolution failed";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
