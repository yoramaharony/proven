interface FinalLogoProps {
  size?: "small" | "medium" | "large";
  className?: string;
}

import Image from "next/image";

export function FinalLogo({
  size = "medium",
  className = ""
}: FinalLogoProps) {
  const sizes = {
    small: {
      width: 180,
      height: 60,
    },
    medium: {
      width: 270,
      height: 90,
    },
    large: {
      width: 360,
      height: 120,
    }
  };

  const config = sizes[size];

  return (
    <Image
      src="/brand/logo.png"
      alt="Proven"
      width={config.width}
      height={config.height}
      priority={size === "small"}
      unoptimized
      className={className}
    />
  );
}
