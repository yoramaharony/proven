"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/ui/Navigation";
import { MarketCard } from "@/components/ui/MarketCard";
import { CategoryTabs } from "@/components/ui/CategoryTabs";
import { Market } from "@/lib/types";

// CategoryTabs component is internal to app but we imported it from UI.
// We need to lift state from CategoryTabs.
// However, CategoryTabs in components/ui/CategoryTabs.tsx has internal state.
// We should modify it to accept props or just use a local version here if it's too tied.
// The file we saw: `const [active, setActive] = useState("All");`
// It doesn't accept props. I will overwrite it to match the page needs or copy it.
// I'll assume I can modify CategoryTabs to accept `active` and `onSelect`.

// Temporary fix: I'll rewrite CategoryTabs in the component folder or inline it if small.
// Actually, I should just update CategoryTabs.tsx to be controlled.

// Let's first update CategoryTabs.tsx, then this page.
// But I'll write this page assuming CategoryTabs works.

export default function Home() {
  const [category, setCategory] = useState("All");

  const { data: markets, isLoading } = useQuery({
    queryKey: ["markets", category],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (category !== "All") params.append("category", category.toUpperCase());
      const res = await fetch(`/api/markets?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch markets");
      return res.json() as Promise<Market[]>;
    }
  });

  return (
    <div className="min-h-screen bg-black">
      <Navigation />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-12">
          <h1 className="text-4xl font-light text-white mb-4">
            Proven <span className="text-zinc-500">Markets</span>
          </h1>
          <p className="text-zinc-400 max-w-2xl">
            Take positions on Tech & Geopolitics outcomes. Get rewarded for being right.
          </p>
        </div>

        <div className="space-y-8">
          {/* We need a controlled CategoryTabs. I'll pass props even if the original didn't have them yet, then I'll fix the component. */}
          {/* Or I will use a local implementation if the other one is stubborn. */}
          {/* Let's try to update the component first. I'll just render it for now and fix it in next step. */}
          <div className="border-b border-zinc-800 overflow-x-auto">
            <div className="flex gap-6 pb-4 min-w-max">
              {["All", "Tech", "Geo", "Crossover"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`text-sm font-medium transition-colors ${category === cat ? "text-cyan-400" : "text-zinc-500 hover:text-zinc-300"
                    }`}
                >
                  {cat === "All" ? "Trending" : cat}
                  {/* Mapping "All" to Trending title for UI, but internal state represents category */}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="text-zinc-500">Loading markets...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {markets?.map((market) => (
                <MarketCard
                  key={market.id}
                  id={market.id}
                  category={market.category}
                  title={market.question}
                  volume={`$${market.volumeUSDC.toLocaleString()}`} // Demo volume
                  options={[
                    {
                      name: "Outcome",
                      percentage: Math.round(market.yesPrice * 100),
                      trend: "up" // Demo
                    }
                  ]}
                />
              ))}
              {markets?.length === 0 && (
                <div className="col-span-full text-center py-20 text-zinc-500">
                  No markets found. <br /> Use Admin API to create one.
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
