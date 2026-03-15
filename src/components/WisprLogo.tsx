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

export function WisprLogoFull({ height = 28, className }: { height?: number; className?: string }) {
  const iconSize = height;
  const fontSize = height * 0.65;
  return (
    <div className={`flex items-center gap-2.5 ${className ?? ""}`}>
      <WisprIcon size={iconSize} className="text-[#005EF8]" />
      <span
        className="font-bold tracking-[-0.04em] text-white"
        style={{ fontSize: `${fontSize}px` }}
      >
        Whisper
      </span>
    </div>
  );
}
