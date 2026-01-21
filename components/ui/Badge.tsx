interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "danger" | "warning" | "info";
  className?: string;
}

export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  const variants = {
    default: "bg-zinc-800/50 text-zinc-400 border border-zinc-700/50",
    success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30",
    danger: "bg-rose-500/10 text-rose-400 border border-rose-500/30",
    warning: "bg-amber-500/10 text-amber-400 border border-amber-500/30",
    info: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}