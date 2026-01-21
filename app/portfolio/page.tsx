"use client";

import { Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/ui/Navigation";
import { PositionJson, TradeJson } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { useSearchParams } from "next/navigation";
import { useAccount } from "wagmi";

// Demo User ID
const USER_ID = "user_demo";

function PortfolioInner() {
    const searchParams = useSearchParams();
    const paramUserId = searchParams.get("userId") || undefined;
    const { address } = useAccount();
    const effectiveUserId = paramUserId || address || USER_ID;

    const { data: positions, isLoading: posLoading } = useQuery({
        queryKey: ["positions", effectiveUserId],
        queryFn: async () => {
            const res = await fetch(`/api/positions?userId=${effectiveUserId}`);
            if (!res.ok) throw new Error("Failed to fetch positions");
            return res.json() as Promise<PositionJson[]>;
        }
    });

    const { data: trades, isLoading: tradesLoading } = useQuery({
        queryKey: ["trades", effectiveUserId],
        queryFn: async () => {
            const res = await fetch(`/api/trades?userId=${effectiveUserId}`);
            if (!res.ok) throw new Error("Failed to fetch trades");
            return res.json() as Promise<TradeJson[]>;
        }
    });

    return (
        <div className="min-h-screen bg-black text-white">
            <Navigation />

            <main className="max-w-7xl mx-auto px-6 py-8">
                <h1 className="text-3xl font-light mb-8">Your Track Record</h1>
                <div className="text-sm text-zinc-500 mb-8">
                    Viewing as: <span className="text-zinc-300">{effectiveUserId}</span>
                    {!paramUserId && !address && (
                        <span className="ml-2 text-zinc-600">(demo user)</span>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Open Positions */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-xl font-medium text-zinc-300">Open Positions</h2>

                        {posLoading ? <div>Loading...</div> : (
                            <div className="space-y-4">
                                {positions?.filter(p => p.quantity > 0).length === 0 && (
                                    <div className="text-zinc-500 py-4">No open positions.</div>
                                )}
                                {positions?.filter(p => p.quantity > 0).map((pos) => (
                                    <div key={pos.id} className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 flex items-center justify-between">
                                        <div>
                                            <div className="text-xs text-zinc-500 mb-1">Market ID: {pos.marketId}</div>
                                            <div className="flex gap-2 items-center">
                                                <span className={`text-lg font-medium ${pos.side === 'YES' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                    {pos.side}
                                                </span>
                                                <span className="text-zinc-400">
                                                    {pos.quantity.toFixed(1)} Contracts
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-zinc-500">Avg Entry</div>
                                            <div className="text-white font-medium">{pos.avgEntryPrice.toFixed(2)} USDC</div>
                                        </div>
                                        <div className="text-right">
                                            <Button size="sm" variant="outline">Trade</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <h2 className="text-xl font-medium text-zinc-300 mt-12">History</h2>
                        {tradesLoading ? <div>Loading...</div> : (
                            <div className="bg-zinc-900/30 rounded-lg border border-zinc-800 overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-zinc-900 text-zinc-500 font-medium">
                                        <tr>
                                            <th className="px-4 py-3">Time</th>
                                            <th className="px-4 py-3">Market</th>
                                            <th className="px-4 py-3">Side</th>
                                            <th className="px-4 py-3 text-right">Size</th>
                                            <th className="px-4 py-3 text-right">Price</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-800">
                                        {trades?.map((trade) => (
                                            <tr key={trade.id} className="hover:bg-zinc-800/50 transition-colors">
                                                <td className="px-4 py-3 text-zinc-400">
                                                    {new Date(trade.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-3 truncate max-w-[200px] text-zinc-300">
                                                    {trade.marketId}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`${trade.side === 'YES' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                        {trade.side}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right text-zinc-300">
                                                    {Math.abs(trade.quantity).toFixed(0)}
                                                </td>
                                                <td className="px-4 py-3 text-right text-zinc-300">
                                                    {trade.price.toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Summary / Proven Outcomes */}
                    <div className="lg:col-span-1">
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                            <h3 className="text-lg font-medium mb-4">Performance</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Realized P&L</span>
                                    <span className="text-white font-medium">$0.00</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Volume Traded</span>
                                    <span className="text-white font-medium">$0.00</span>
                                </div>
                            </div>
                            <div className="mt-8 pt-6 border-t border-zinc-800">
                                <h4 className="text-sm font-medium text-zinc-300 mb-2">Proven Outcomes</h4>
                                <p className="text-xs text-zinc-500">No resolved positions to redeem yet.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function PortfolioPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black text-white">Loading...</div>}>
            <PortfolioInner />
        </Suspense>
    );
}
