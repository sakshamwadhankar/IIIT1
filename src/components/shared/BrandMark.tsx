type BrandMarkProps = {
  /** Rendered width/height in px. */
  size?: number;
  /** Mono variant uses currentColor (for browser/system contexts). */
  variant?: 'color' | 'mono';
  className?: string;
};

/**
 * The Raah mark: a rounded square with a single curved route line forming a
 * subtle "R", terminating in a waypoint dot. Matches public/logo.svg.
 */
export default function BrandMark({ size = 32, variant = 'color', className }: BrandMarkProps) {
  const mono = variant === 'mono';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      role="img"
      aria-label="Raah"
      className={className}
    >
      {!mono && <rect x="16" y="16" width="480" height="480" rx="112" fill="#283593" />}
      <path
        d="M176 400 L176 150 Q176 118 216 116 Q300 112 312 168 Q322 220 258 234 L192 248 L338 392"
        fill="none"
        stroke={mono ? 'currentColor' : '#f6f7fb'}
        strokeWidth="30"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {mono ? (
        <circle cx="356" cy="400" r="34" fill="none" stroke="currentColor" strokeWidth="22" />
      ) : (
        <>
          <circle cx="356" cy="400" r="34" fill="#5eead4" />
          <circle cx="356" cy="400" r="14" fill="#283593" />
        </>
      )}
    </svg>
  );
}
