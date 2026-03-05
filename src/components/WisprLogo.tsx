export function WisprIcon({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="currentColor"
      className={className}
    >
      <polygon points="1,0 20,22 0,40" />
      <polygon points="50,13 50,56 0,100 0,57" />
      <polygon points="100,13 100,56 50,100 50,57" />
    </svg>
  );
}

export function WisprWordmark({ className }: { className?: string }) {
  return (
    <span className={`text-[17px] font-bold tracking-[-0.04em] ${className ?? ""}`}>
      Wispr
    </span>
  );
}
