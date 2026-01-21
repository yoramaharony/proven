"use client";

import { useState } from "react";
import { Navigation } from "@/components/ui/Navigation";
import { Button } from "@/components/ui/Button";
import { useMutation } from "@tanstack/react-query";

export default function AdminPage() {
    // Create Market State
    const [question, setQuestion] = useState("");
    const [category, setCategory] = useState("TECH");
    const [criteria, setCriteria] = useState("");
    const [date, setDate] = useState("");

    const createMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/admin/markets/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    question, category, resolutionCriteria: criteria,
                    tradingClosesAt: new Date(date).toISOString(),
                    expectedResolutionAt: new Date(date).toISOString(), // same for demo
                    initialProbability: 0.5
                })
            });
            if (!res.ok) throw new Error("Failed");
            return res.json();
        },
        onSuccess: () => alert("Market Created!")
    });

    // Resolve Market (Simple ID input)
    const [resolveId, setResolveId] = useState("");
    const [outcome, setOutcome] = useState("YES");

    const resolveMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`/api/admin/markets/${resolveId}/resolve`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ outcome, resolutionSourceUrl: "http://example.com" })
            });
            if (!res.ok) throw new Error("Failed");
            return res.json();
        },
        onSuccess: () => alert("Market Resolved!")
    });

    return (
        <div className="min-h-screen bg-black text-white">
            <Navigation />
            <main className="max-w-4xl mx-auto px-6 py-8">
                <h1 className="text-3xl font-light mb-8">Admin Desk</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Create */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-medium">Create Market</h2>
                        <div className="space-y-4">
                            <input className="w-full bg-zinc-900 border border-zinc-700 p-3 rounded text-white"
                                placeholder="Question" value={question} onChange={e => setQuestion(e.target.value)} />

                            <select className="w-full bg-zinc-900 border border-zinc-700 p-3 rounded text-white"
                                value={category} onChange={e => setCategory(e.target.value)}>
                                <option value="TECH">TECH</option>
                                <option value="GEO">GEO</option>
                                <option value="CROSSOVER">CROSSOVER</option>
                            </select>

                            <textarea className="w-full bg-zinc-900 border border-zinc-700 p-3 rounded text-white"
                                placeholder="Resolution Criteria" value={criteria} onChange={e => setCriteria(e.target.value)} />

                            <input className="w-full bg-zinc-900 border border-zinc-700 p-3 rounded text-white"
                                type="date" value={date} onChange={e => setDate(e.target.value)} />

                            <Button onClick={() => createMutation.mutate()}>
                                {createMutation.isPending ? "Creating..." : "Create Market"}
                            </Button>
                        </div>
                    </div>

                    {/* Resolve */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-medium">Resolve Market</h2>
                        <div className="space-y-4">
                            <input className="w-full bg-zinc-900 border border-zinc-700 p-3 rounded text-white"
                                placeholder="Market ID" value={resolveId} onChange={e => setResolveId(e.target.value)} />

                            <select className="w-full bg-zinc-900 border border-zinc-700 p-3 rounded text-white"
                                value={outcome} onChange={e => setOutcome(e.target.value)}>
                                <option value="YES">YES</option>
                                <option value="NO">NO</option>
                            </select>

                            <Button variant="outline" onClick={() => resolveMutation.mutate()}>
                                {resolveMutation.isPending ? "Resolving..." : "Resolve"}
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
