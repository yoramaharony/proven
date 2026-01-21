import { FinalLogo } from "@/components/FinalLogo";

interface DownloadButtonProps {
  size: "small" | "medium" | "large";
  label: string;
}

export function DownloadButton({ size, label }: DownloadButtonProps) {
  const pixelSizes = {
    small: 512,
    medium: 1024,
    large: 2048
  };

  const handleDownload = () => {
    // Create a temporary container
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    document.body.appendChild(container);

    // Render the logo
    const tempDiv = document.createElement('div');
    container.appendChild(tempDiv);
    
    // Get SVG element by creating one
    const svgString = `
      <svg width="360" height="120" viewBox="0 0 360 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <text x="0" y="100" font-family="system-ui, -apple-system, sans-serif" font-size="96" font-weight="300" fill="#ffffff">pro</text>
        <g transform="translate(132.48, 20)">
          <circle cx="40" cy="40" r="38" stroke="#22d3ee" stroke-width="2" fill="none"/>
          <path d="M 26.4 38.4 L 35.2 46.4 L 55.2 26.4" stroke="#22d3ee" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
        <text x="192.48" y="100" font-family="system-ui, -apple-system, sans-serif" font-size="96" font-weight="300" fill="#ffffff">en</text>
      </svg>
    `;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const pixelSize = pixelSizes[size];
    
    // Set canvas size (maintaining aspect ratio)
    canvas.width = pixelSize;
    canvas.height = pixelSize / 3; // Logo is roughly 3:1 aspect ratio

    if (ctx) {
      // Fill with transparent background
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Create image from SVG
      const img = new Image();
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Convert to PNG and download
        canvas.toBlob((blob) => {
          if (blob) {
            const link = document.createElement('a');
            link.download = `proven-logo-${size}.png`;
            link.href = URL.createObjectURL(blob);
            link.click();
            URL.revokeObjectURL(link.href);
          }
        }, 'image/png');
        
        URL.revokeObjectURL(url);
        document.body.removeChild(container);
      };
      
      img.src = url;
    }
  };

  return (
    <button
      onClick={handleDownload}
      className="px-6 py-3 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-400 text-sm font-medium transition-colors"
    >
      {label}
    </button>
  );
}
