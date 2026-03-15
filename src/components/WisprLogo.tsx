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
 * Full logo: icon + "Whisper" wordmark as a single inline SVG.
 * Same SVG used in public/logo-full.svg for the README.
 */
export function WisprLogoFull({ height = 28, className }: { height?: number; className?: string }) {
  // viewBox is 260x68, scale to desired height
  const width = (260 / 68) * height;
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 260 68"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Icon */}
      <g transform="translate(2, 2) scale(0.75)" fill="#005EF8" stroke="#005EF8" strokeWidth="3" strokeLinejoin="round" style={{ paintOrder: "stroke" }}>
        <polygon points="1,0 20,18 0,30" />
        <polygon points="50,10 50,46 0,80 0,46" />
        <polygon points="100,10 100,46 50,80 50,46" />
      </g>
      {/* Wordmark */}
      <text x="86" y="48" fontFamily="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" fontSize="38" fontWeight="800" letterSpacing="-1.8" fill="#005EF8">Whisper</text>
    </svg>
  );
}
