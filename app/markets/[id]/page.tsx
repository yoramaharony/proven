"use client";

import { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigation } from "@/components/ui/Navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { MarketJson } from "@/lib/types";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";

// Mock Chart Data
const mockChartData = [
    { time: "00:00", price: 0.45 },
    { time: "04:00", price: 0.48 },
    { time: "08:00", price: 0.52 },
    { time: "12:00", price: 0.50 },
    { time: "16:00", price: 0.55 },
    { time: "20:00", price: 0.60 },
    { time: "Now", price: 0.63 }, // Will overlay current price
];

export default function MarketPage() {
    const { id } = useParams() as { id: string };
    const searchParams = useSearchParams();
    const defaultSide = ((searchParams.get("side") as string)?.toUpperCase() === "NO") ? "NO" : "YES";

    const [side, setSide] = useState<"YES" | "NO">(defaultSide as "YES" | "NO");
    const [amount, setAmount] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const queryClient = useQueryClient();

    // Wallet Connection
    const { address, isConnected } = useAccount();
    const { openConnectModal } = useConnectModal();

    const { data: market, isLoading } = useQuery({
        queryKey: ["market", id],
        queryFn: async () => {
            const res = await fetch(`/api/markets/${id}`);
            if (!res.ok) throw new Error("Failed to fetch market");
            return res.json() as Promise<MarketJson>;
        }
    });

    // Calculate current prices
    const yesPrice = market ? market.yesPrice : 0.5;
    const noPrice = 1 - yesPrice;
    const currentPrice = side === "YES" ? yesPrice : noPrice;

    // Potential Return
    const potentialReturn = amount ? (parseFloat(amount) / currentPrice).toFixed(2) : "0.00";
    const payout = amount ? (parseFloat(amount) / currentPrice).toFixed(2) : "0.00"; // 1 USDC per contract

    const handleTrade = async () => {
        if (!isConnected || !address) {
            if (openConnectModal) openConnectModal();
            return;
        }

        if (!amount || isNaN(parseFloat(amount))) return;
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/positions/take", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    marketId: id,
                    userId: address, // Real wallet address
                    side,
                    usdcAmount: parseFloat(amount)
                })
            });
            if (!res.ok) throw new Error("Trade failed");

            // Refetch market
            queryClient.invalidateQueries({ queryKey: ["market", id] });
            setAmount("");
            alert("Position taken successfully!");
        } catch (error) {
            console.error(error);
            alert("Failed to take position");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading || !market) {
        return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <Navigation />

            <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Info & Chart */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <Badge variant="default" className="bg-zinc-800 text-zinc-300">{market.category}</Badge>
                            <div className={`text-xs px-2 py-1 rounded border ${market.status === 'OPEN' ? 'border-emerald-500/50 text-emerald-500' : 'border-zinc-700 text-zinc-500'}`}>
                                {market.status}
                            </div>
                        </div>

                        <h1 className="text-3xl font-light leading-tight">{market.question}</h1>

                        <div className="flex items-center gap-6 text-sm text-zinc-400">
                            <span>Closes: {new Date(market.tradingClosesAt).toLocaleDateString()}</span>
                            <span>Volume: ${market.volumeUSDC.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 h-[400px]">
                        <div className="mb-4 flex justify-between items-center">
                            <h3 className="text-zinc-400 text-sm">YES Price History</h3>
                            <div className="text-2xl font-medium text-cyan-400">{(yesPrice * 100).toFixed(0)}%</div>
                        </div>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={[...mockChartData.slice(0, -1), { time: "Now", price: yesPrice }]}>
                                <XAxis dataKey="time" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} domain={[0, 1]} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a" }}
                                    itemStyle={{ color: "#22d3ee" }}
                                />
                                <Line type="monotone" dataKey="price" stroke="#22d3ee" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Rules */}
                    <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
                        <h3 className="text-lg font-medium mb-4">Resolution Rules</h3>
                        <p className="text-zinc-400 leading-relaxed">
                            {market.resolutionCriteria || "This market will verify the outcome based on public consensus and official reports."}
                        </p>
                    </div>
                </div>

                {/* Right Column: Trading */}
                <div className="lg:col-span-1">
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 sticky top-24">
                        <div className="flex bg-zinc-900 rounded-lg p-1 mb-6 border border-zinc-800">
                            <button
                                onClick={() => setSide("YES")}
                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${side === "YES" ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/50" : "text-zinc-500 hover:text-zinc-300"}`}
                            >
                                YES <span className="ml-1 opacity-75">{(yesPrice * 100).toFixed(0)}%</span>
                            </button>
                            <button
                                onClick={() => setSide("NO")}
                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${side === "NO" ? "bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/50" : "text-zinc-500 hover:text-zinc-300"}`}
                            >
                                NO <span className="ml-1 opacity-75">{(noPrice * 100).toFixed(0)}%</span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-zinc-400 mb-1 block">Amount (USDC)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full bg-zinc-950 border border-zinc-700 rounded-lg pl-4 pr-16 py-3 text-white placeholder:text-zinc-600 focus:border-cyan-500 focus:outline-none transition-colors"
                                    />
                                    <span className="absolute right-4 top-3 text-zinc-500">USDC</span>
                                </div>
                            </div>

                            <div className="space-y-2 py-4 border-t border-zinc-800 border-b">
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-400">Avg Price</span>
                                    <span className="text-white">{currentPrice.toFixed(2)} USDC</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-400">Est. Contracts</span>
                                    <span className="text-white">{potentialReturn}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-400">Potential Payout</span>
                                    <span className="text-emerald-400 font-medium">{payout} USDC</span>
                                </div>
                            </div>

                            <Button
                                variant={side === "YES" ? "success" : "danger"}
                                className="w-full py-3 text-base"
                                onClick={() => handleTrade()}
                            >
                                {isSubmitting ? "Confirming..." : (!isConnected ? "Connect Wallet to Trade" : `Take ${side} Position`)}
                            </Button>

                            <p className="text-xs text-center text-zinc-600">
                                By trading you agree to the Terms of Service.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
