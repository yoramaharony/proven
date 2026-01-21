import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { TrendingUp, TrendingDown, Bookmark } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface MarketOption {
  name: string;
  percentage: number;
  trend?: "up" | "down";
}

interface MarketCardProps {
  id: string;
  category: string;
  title: string;
  options: MarketOption[];
  volume: string;
}

export function MarketCard({ id, category, title, options, volume }: MarketCardProps) {
  const router = useRouter();

  const handleTrade = (e: React.MouseEvent, side: "YES" | "NO") => {
    e.preventDefault();
    e.stopPropagation();
    // Navigate to market page with side pre-selected (query param? or just go to page)
    router.push(`/markets/${id}?side=${side}`);
  };

  return (
    <Link href={`/markets/${id}`} className="block group">
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-all hover:shadow-lg hover:shadow-cyan-500/5 h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <Badge variant="default">{category}</Badge>
          <button className="text-zinc-600 hover:text-cyan-400 transition-colors z-10 relative">
            <Bookmark className="w-4 h-4" />
          </button>
        </div>

        {/* Title */}
        <h3 className="text-white font-normal mb-4 leading-snug group-hover:text-cyan-50 transition-colors line-clamp-2 min-h-[3rem]">
          {title}
        </h3>

        {/* Options */}
        <div className="space-y-3 mb-4">
          {options.map((option, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-zinc-300">{option.name}</span>
                  {option.trend === "up" && (
                    <TrendingUp className="w-3 h-3 text-emerald-400" />
                  )}
                  {option.trend === "down" && (
                    <TrendingDown className="w-3 h-3 text-rose-400" />
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-medium text-white">{option.percentage}%</span>
                  <div className="flex gap-1 z-10 relative">
                    <Button variant="success" size="sm" onClick={(e) => handleTrade(e, "YES")}>Yes</Button>
                    <Button variant="danger" size="sm" onClick={(e) => handleTrade(e, "NO")}>No</Button>
                  </div>
                </div>
              </div>
              {/* Progress bar */}
              <div className="h-1.5 bg-zinc-800/50 rounded-full overflow-hidden border border-zinc-800">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500/80 to-cyan-400/60 rounded-full transition-all"
                  style={{ width: `${option.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
          <span className="text-xs text-zinc-500">{volume}</span>
          <span className="text-xs text-zinc-600 group-hover:text-cyan-500 transition-colors">
            View market →
          </span>
        </div>
      </div>
    </Link>
  );
}