import { TrendingUp } from "lucide-react";
import { useState } from "react";

export function CategoryTabs() {
  const [active, setActive] = useState("All");
  
  const categories = [
    { name: "All", icon: null },
    { name: "Trending", icon: TrendingUp },
    { name: "Politics", icon: null },
    { name: "Sports", icon: null },
    { name: "Crypto", icon: null },
    { name: "Finance", icon: null },
    { name: "Tech", icon: null },
    { name: "Culture", icon: null },
    { name: "World", icon: null },
    { name: "Economy", icon: null }
  ];

  return (
    <div className="border-b border-zinc-800">
      <div className="flex gap-1 overflow-x-auto pb-px scrollbar-hide">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <button
              key={category.name}
              onClick={() => setActive(category.name)}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors relative flex items-center gap-1.5 ${
                active === category.name
                  ? "text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {Icon && <Icon className="w-4 h-4" />}
              {category.name}
              {active === category.name && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
