interface LogoProps {
  variation?: number;
  className?: string;
}

export function Logo({ 
  variation = 1,
  className = "" 
}: LogoProps) {
  const variations = {
    1: {
      // Original
      text: "text-5xl",
      font: "font-medium",
      checkmark: 50,
      strokeWidth: "2.5",
      radius: 22,
      checkPath: "M16 23L21 28L33 16",
      gap: "gap-1"
    },
    2: {
      // Larger circle
      text: "text-5xl",
      font: "font-medium",
      checkmark: 58,
      strokeWidth: "2.5",
      radius: 22,
      checkPath: "M16 23L21 28L33 16",
      gap: "gap-1"
    },
    3: {
      // Smaller circle, compact
      text: "text-5xl",
      font: "font-medium",
      checkmark: 42,
      strokeWidth: "2.5",
      radius: 22,
      checkPath: "M16 23L21 28L33 16",
      gap: "gap-0.5"
    },
    4: {
      // Ultra thin font
      text: "text-5xl",
      font: "font-extralight",
      checkmark: 50,
      strokeWidth: "2",
      radius: 22,
      checkPath: "M16 23L21 28L33 16",
      gap: "gap-1.5"
    },
    5: {
      // Thicker strokes, bold
      text: "text-5xl",
      font: "font-semibold",
      checkmark: 50,
      strokeWidth: "3.5",
      radius: 21,
      checkPath: "M16 23L21 28L33 16",
      gap: "gap-1"
    },
    6: {
      // Thin strokes, elegant
      text: "text-5xl",
      font: "font-light",
      checkmark: 50,
      strokeWidth: "1.5",
      radius: 22.5,
      checkPath: "M16 23L21 28L33 16",
      gap: "gap-2"
    },
    7: {
      // Oversized circle
      text: "text-5xl",
      font: "font-normal",
      checkmark: 64,
      strokeWidth: "2.5",
      radius: 22,
      checkPath: "M16 23L21 28L33 16",
      gap: "gap-1"
    },
    8: {
      // Light weight, airy
      text: "text-5xl",
      font: "font-light",
      checkmark: 50,
      strokeWidth: "2",
      radius: 22,
      checkPath: "M16 23L21 28L33 16",
      gap: "gap-2.5"
    },
    9: {
      // Tight spacing, modern
      text: "text-5xl",
      font: "font-medium",
      checkmark: 48,
      strokeWidth: "2.5",
      radius: 22,
      checkPath: "M17 23L22 28L32 17",
      gap: "gap-0"
    },
    10: {
      // Extra thin, refined
      text: "text-5xl",
      font: "font-thin",
      checkmark: 52,
      strokeWidth: "1.8",
      radius: 22.5,
      checkPath: "M16 23L21 28L33 16",
      gap: "gap-3"
    }
  };

  const config = variations[variation as keyof typeof variations] || variations[1];

  return (
    <div className={`flex items-center ${config.gap} ${className}`}>
      <span className={`${config.text} ${config.font} text-white`}>pro</span>
      <svg 
        width={config.checkmark} 
        height={config.checkmark} 
        viewBox="0 0 48 48" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ marginBottom: '0.1em' }}
      >
        {/* Outer ring */}
        <circle 
          cx="24" 
          cy="24" 
          r={config.radius} 
          stroke="#22d3ee" 
          strokeWidth={config.strokeWidth}
          fill="none"
        />
        
        {/* Checkmark */}
        <path 
          d={config.checkPath}
          stroke="#22d3ee" 
          strokeWidth={config.strokeWidth}
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
      <span className={`${config.text} ${config.font} text-white`}>en</span>
    </div>
  );
}