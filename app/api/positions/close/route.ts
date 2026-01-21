import { db } from "@/lib/firebase";
import { doc, runTransaction, Timestamp, collection } from "firebase/firestore";
import { NextResponse } from "next/server";
import { Market, Position } from "@/lib/types";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { marketId, userId, side, quantity } = body;

        if (!marketId || !userId || !side || !quantity) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const marketRef = doc(db, "markets", marketId);

        // Deterministic Position ID
        const positionId = `${userId}_${marketId}_${side}`;
        const positionRef = doc(db, "positions", positionId);

        const result = await runTransaction(db, async (transaction) => {
            const marketDoc = await transaction.get(marketRef);
            const positionDoc = await transaction.get(positionRef);

            if (!marketDoc.exists()) throw new Error("Market not found");
            if (!positionDoc.exists()) throw new Error("Position not found");

            const market = marketDoc.data() as Market;
            const position = positionDoc.data() as Position;

            if (market.status !== "OPEN") throw new Error("Market is not open");
            if (position.quantity < quantity) throw new Error("Insufficient position balance");

            // Sell Price = Current Price (simplified)
            // If selling YES, sell at yesPrice.
            const sellPrice = side === "YES" ? market.yesPrice : (1 - market.yesPrice);

            // Calculate Payout
            const payoutUSDC = quantity * sellPrice;

            // Update Position
            const newQuantity = position.quantity - quantity;
            // Realized PNL update:
            // entry cost for this portion = (position.avgEntryPrice * quantity)
            // pnl = payoutUSDC - entry cost
            const pnl = payoutUSDC - (position.avgEntryPrice * quantity);

            transaction.update(positionRef, {
                quantity: newQuantity,
                realizedPnl: (position.realizedPnl || 0) + pnl,
                updatedAt: Timestamp.now()
            });

            // Record Trade (Sell)
            // Side is "YES" (selling YES)
            // Store negative quantity? Or specify action?
            // "side" in Trade usually means what did I buy?
            // If I close a YES position, I am selling YES.
            // Let's store as side=YES, quantity negative? Or just add a "type" field?
            // Spec: "Trade: side YES/NO".
            // Let's implicitly say negative quantity = sell? Or just keep it simple.
            // We will store as "SELL" action but Trade interface only has side.
            // Let's use negative quantity for SELL.
            const tradeRef = doc(collection(db, "trades"));
            transaction.set(tradeRef, {
                marketId,
                userId,
                side, // "YES"
                price: sellPrice,
                quantity: -quantity, // Negative
                usdcAmount: payoutUSDC, // Positive cash back
                createdAt: Timestamp.now()
            });

            // Price Impact? selling YES drives price down.
            const PRICE_IMPACT = 0.02;
            let newYesPrice = market.yesPrice;
            if (side === "YES") {
                newYesPrice = Math.max(0.01, market.yesPrice - PRICE_IMPACT);
            } else {
                // Selling NO means buying YES essentially? No, distinct contracts in this model.
                // If I sell NO, I decrease demand for NO -> NO price down -> YES price up.
                newYesPrice = Math.min(0.99, market.yesPrice + PRICE_IMPACT);
            }

            transaction.update(marketRef, {
                yesPrice: newYesPrice,
                volumeUSDC: (market.volumeUSDC || 0) + payoutUSDC, // Volume includes sells? Yes usually.
                updatedAt: Timestamp.now()
            });

            return { success: true, payoutUSDC, newYesPrice };
        });

        return NextResponse.json(result);

    } catch (error: unknown) {
        console.error("Error closing position:", error);
        const message = error instanceof Error ? error.message : "Close failed";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
