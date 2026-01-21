interface FinalLogoProps {
  size?: "small" | "medium" | "large";
  className?: string;
}

export function FinalLogo({
  size = "medium",
  className = ""
}: FinalLogoProps) {
  const sizes = {
    small: {
      width: 180,
      height: 60,
      fontSize: 48,
      checkSize: 30,
      gap: 2
    },
    medium: {
      width: 270,
      height: 90,
      fontSize: 72,
      checkSize: 45,
      gap: 3
    },
    large: {
      width: 360,
      height: 120,
      fontSize: 96,
      checkSize: 60,
      gap: 4
    }
  };

  const config = sizes[size];

  return (
    <svg
      width={config.width}
      height={config.height}
      viewBox={`0 0 ${config.width} ${config.height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* "pro" text */}
      <text
        x="0"
        y={config.height - 12}
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize={config.fontSize}
        fontWeight="300"
        fill="#ffffff"
      >
        pro
      </text>

      {/* Checkmark circle - positioned after "pro" */}
      <g transform={`translate(${config.fontSize * 1.38}, ${config.height - 12 - config.checkSize + 6})`}>
        <circle
          cx={config.checkSize / 2}
          cy={config.checkSize / 2}
          r={config.checkSize / 2 - 2}
          stroke="#22d3ee"
          strokeWidth="2"
          fill="none"
        />

        <g transform={`translate(${config.checkSize / 2}, ${config.checkSize / 2}) scale(1.21) translate(${-config.checkSize / 2}, ${-config.checkSize / 2})`}>
          <path
            d={`M ${config.checkSize * 0.33} ${config.checkSize * 0.48} L ${config.checkSize * 0.44} ${config.checkSize * 0.58} L ${config.checkSize * 0.69} ${config.checkSize * 0.33}`}
            stroke="#22d3ee"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </g>

      {/* "en" text */}
      <text
        x={config.fontSize * 1.38 + config.checkSize + config.gap}
        y={config.height - 12}
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize={config.fontSize}
        fontWeight="300"
        fill="#ffffff"
      >
        en
      </text>
    </svg>
  );
}
