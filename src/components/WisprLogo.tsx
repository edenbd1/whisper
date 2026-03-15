export function WisprIcon({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="-2 -2 104 84"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinejoin="round"
      style={{ paintOrder: "stroke" }}
      className={className}
    >
      <polygon points="1,0 20,18 0,30" />
      <polygon points="50,10 50,46 0,80 0,46" />
      <polygon points="100,10 100,46 50,80 50,46" />
    </svg>
  );
}

export function WisprWordmark({ className }: { className?: string }) {
  return (
    <span className={`text-[17px] font-bold tracking-[-0.04em] ${className ?? ""}`}>
      Whisper
    </span>
  );
}

/**
 * Full logo: icon + "Whisper" as a single inline SVG.
 * Uses the exact same viewBox and coordinates as public/logo-full.svg.
 */
export function WisprLogoFull({ height = 32, className }: { height?: number; className?: string }) {
  const width = (236 / 44) * height;
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 236 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g transform="translate(0, 2) scale(0.48)" fill="#005EF8" stroke="#005EF8" strokeWidth="3" strokeLinejoin="round" style={{ paintOrder: "stroke" }}>
        <polygon points="1,0 20,18 0,30" />
        <polygon points="50,10 50,46 0,80 0,46" />
        <polygon points="100,10 100,46 50,80 50,46" />
      </g>
      <text x="56" y="34" fontFamily="var(--font-poppins), Poppins, sans-serif" fontSize="34" fontWeight="700" letterSpacing="-0.3" fill="#005EF8">Whisper</text>
    </svg>
  );
}
