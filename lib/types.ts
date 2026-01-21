import { Timestamp } from "firebase/firestore";

export type MarketCategory = "TECH" | "GEO" | "CROSSOVER";
export type MarketStatus = "OPEN" | "LOCKED" | "RESOLVED";
export type Side = "YES" | "NO";
export type ISODateString = string;

export interface Market {
    id: string;
    question: string;
    category: MarketCategory;
    description?: string;
    resolutionCriteria: string;
    status: MarketStatus;
    tradingClosesAt: Timestamp;
    expectedResolutionAt: Timestamp;
    yesPrice: number; // 0.01 - 0.99
    createdAt: Timestamp;
    updatedAt: Timestamp;
    resolvedOutcome?: Side | null;
    resolutionSourceUrl?: string | null;
    resolutionNotes?: string | null;
    volumeUSDC: number;
    openInterest: number;
}

// JSON-friendly DTOs for API responses (Firestore Timestamps serialized to ISO strings)
export type MarketJson = Omit<
    Market,
    "tradingClosesAt" | "expectedResolutionAt" | "createdAt" | "updatedAt"
> & {
    tradingClosesAt: ISODateString;
    expectedResolutionAt: ISODateString;
    createdAt: ISODateString;
    updatedAt: ISODateString;
};

export interface User {
    id: string; // wallet address
    walletAddress: string;
    createdAt: Timestamp;
}

export interface Position {
    id: string;
    userId: string;
    marketId: string;
    side: Side;
    quantity: number;
    avgEntryPrice: number;
    realizedPnl: number;
    updatedAt: Timestamp;
}

export type PositionJson = Omit<Position, "updatedAt"> & { updatedAt: ISODateString };

export interface Trade {
    id: string;
    marketId: string;
    userId: string;
    side: Side;
    price: number;
    quantity: number;
    usdcAmount: number;
    createdAt: Timestamp;
}

export type TradeJson = Omit<Trade, "createdAt"> & { createdAt: ISODateString };

export interface PriceTick {
    id: string;
    marketId: string;
    yesPrice: number;
    createdAt: Timestamp;
}
