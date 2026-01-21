interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "success" | "danger";
  size?: "sm" | "md" | "lg";
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  onClick,
  className = ""
}: ButtonProps) {
  const baseStyles = "font-medium rounded-lg transition-all inline-flex items-center justify-center relative overflow-hidden";

  const variants = {
    primary: "bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/50 hover:border-cyan-400 text-cyan-400 hover:text-cyan-300 shadow-lg shadow-cyan-500/10",
    secondary: "bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-600 text-zinc-300 hover:text-white",
    outline: "border border-zinc-700 hover:border-cyan-500/50 text-zinc-300 hover:text-cyan-400 hover:bg-cyan-500/5",
    ghost: "text-zinc-400 hover:text-cyan-400 hover:bg-zinc-800/30",
    success: "bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/50 hover:border-emerald-400 text-emerald-400 hover:text-emerald-300 shadow-lg shadow-emerald-500/10",
    danger: "bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/50 hover:border-rose-400 text-rose-400 hover:text-rose-300 shadow-lg shadow-rose-500/10"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3.5 text-base"
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}