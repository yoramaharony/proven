import { db } from "@/lib/firebase";
import {
    collection,
    Timestamp,
    doc,
    runTransaction
} from "firebase/firestore";
import { NextResponse } from "next/server";
import { Market, Position } from "@/lib/types";

// Simple matching engine (Option A: Instant Quote)
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { marketId, userId, side, usdcAmount } = body; // Input mode: USDC amount for simplicity

        if (!marketId || !userId || !side || !usdcAmount) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const marketRef = doc(db, "markets", marketId);

        // Run in transaction to ensure consistency
        const result = await runTransaction(db, async (transaction) => {
            const marketDoc = await transaction.get(marketRef);
            if (!marketDoc.exists()) {
                throw new Error("Market not found");
            }

            const market = marketDoc.data() as Market;

            if (market.status !== "OPEN") {
                throw new Error("Market is not open");
            }

            // Determine fill price
            // If buying YES, price is yesPrice.
            // If buying NO, price is (1 - yesPrice). e.g. if yes is 0.60, no is 0.40.
            const fillPrice = side === "YES" ? market.yesPrice : (1 - market.yesPrice);

            // Calculate contracts
            // contacts = usdcAmount / fillPrice
            const quantity = usdcAmount / fillPrice;

            // Update Position
            // Actually, Firestore SDK transaction requires reads to come before writes.
            // Let's use a deterministic ID for position to make it easy.
            const positionId = `${userId}_${marketId}_${side}`;
            const positionRef = doc(db, "positions", positionId);
            const positionDoc = await transaction.get(positionRef);

            let newQuantity = quantity;
            let newAvgEntryPrice = fillPrice;

            if (positionDoc.exists()) {
                const currentPos = positionDoc.data() as Position;
                const totalCost = (currentPos.quantity * currentPos.avgEntryPrice) + usdcAmount;
                newQuantity = currentPos.quantity + quantity;
                newAvgEntryPrice = totalCost / newQuantity;

                transaction.update(positionRef, {
                    quantity: newQuantity,
                    avgEntryPrice: newAvgEntryPrice,
                    updatedAt: Timestamp.now()
                });
            } else {
                transaction.set(positionRef, {
                    id: positionId,
                    userId,
                    marketId,
                    side,
                    quantity: newQuantity,
                    avgEntryPrice: newAvgEntryPrice,
                    realizedPnl: 0,
                    updatedAt: Timestamp.now()
                });
            }

            // Record Trade
            const tradeRef = doc(collection(db, "trades"));
            transaction.set(tradeRef, {
                marketId,
                userId,
                side,
                price: fillPrice,
                quantity,
                usdcAmount,
                createdAt: Timestamp.now()
            });

            // Move Price (Simple Bonding Curve / Impact)
            // Increase probability of the side bought by small factor.
            // e.g. 0.01 per 100 USDC? Let's be aggressive for demo: 0.01 per trade or pro-rata.
            const PRICE_IMPACT = 0.02; // Fixed step for demo
            let newYesPrice = market.yesPrice;
            if (side === "YES") {
                newYesPrice = Math.min(0.99, market.yesPrice + PRICE_IMPACT);
            } else {
                newYesPrice = Math.max(0.01, market.yesPrice - PRICE_IMPACT);
            }

            transaction.update(marketRef, {
                yesPrice: newYesPrice,
                volumeUSDC: (market.volumeUSDC || 0) + usdcAmount,
                updatedAt: Timestamp.now()
            });

            // Record Price Tick
            const tickRef = doc(collection(db, "priceTicks"));
            transaction.set(tickRef, {
                marketId,
                yesPrice: newYesPrice,
                createdAt: Timestamp.now()
            });

            return {
                fillPrice,
                quantity,
                newYesPrice
            };
        });

        return NextResponse.json(result);

    } catch (error: unknown) {
        console.error("Error executing trade:", error);
        const message = error instanceof Error ? error.message : "Trade failed";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
