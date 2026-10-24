export type IconName =
  | 'walk'
  | 'cab'
  | 'mixed'
  | 'bulb'
  | 'users'
  | 'moon'
  | 'rain'
  | 'broom'
  | 'rupee'
  | 'clock'
  | 'doc'
  | 'info'
  | 'alert'
  | 'close'
  | 'plus'
  | 'chevron-up'
  | 'chevron-down'
  | 'grip'
  | 'star'
  | 'shield'
  | 'install'
  | 'offline'
  | 'check'
  | 'pin'
  | 'flag'
  | 'pharmacy'
  | 'share'
  | 'route';

const PATHS: Record<IconName, JSX.Element> = {
  walk: (
    <>
      <circle cx="13" cy="4.5" r="1.9" />
      <path d="M10 20.5l2-5.5-2.4-3 1.4-5 3 3.4 2.8 1.2" />
      <path d="M9.6 12.6L7 15l-1.4 3.5" />
      <path d="M12 15l1.8 2.2 1 3.3" />
    </>
  ),
  cab: (
    <>
      <path d="M4 16v-3.2L6 8h12l2 4.8V16" />
      <path d="M4 16h16" />
      <circle cx="7.5" cy="16.5" r="1.6" />
      <circle cx="16.5" cy="16.5" r="1.6" />
      <path d="M7 8l1-3h8l1 3" />
    </>
  ),
  mixed: (
    <>
      <circle cx="6" cy="5" r="1.6" />
      <path d="M4.5 12l1-3.4 2.6 2.2 2.4-.8" />
      <path d="M5 12l-1 3 1.6 3" />
      <path d="M12 20h8" />
      <path d="M15 16l3-3h-4l3-3" />
    </>
  ),
  bulb: (
    <>
      <path d="M9 18h6" />
      <path d="M10 21h4" />
      <path d="M12 3a6 6 0 0 0-3.5 10.9c.8.6 1.5 1.2 1.5 2.1h4c0-.9.7-1.5 1.5-2.1A6 6 0 0 0 12 3z" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19c.6-3 2.7-5 5.5-5s4.9 2 5.5 5" />
      <circle cx="16.5" cy="9" r="2.4" />
      <path d="M15.5 14.2c2.4.3 4.2 2 4.8 4.8" />
    </>
  ),
  moon: <path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z" />,
  rain: (
    <>
      <path d="M7 15a4.5 4.5 0 0 1-.4-9A5.5 5.5 0 0 1 17.3 7 3.8 3.8 0 0 1 17 15H7z" />
      <path d="M8.5 18l-1 2.5M12.5 18l-1 2.5M16.5 18l-1 2.5" />
    </>
  ),
  broom: (
    <>
      <path d="M14 3l-4.5 8" />
      <path d="M9.5 11l-5 9h9a7 7 0 0 0-4-9z" />
      <path d="M6.5 16.5l3 1M8 14l3 1.2" />
    </>
  ),
  rupee: (
    <>
      <path d="M7 4h9" />
      <path d="M7 8.5h9" />
      <path d="M7 4c0 4.5 2.5 6.5 6 6.5L18 20" />
      <path d="M7 12.5h5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  doc: (
    <>
      <path d="M7 3h7l4 4v14H7z" />
      <path d="M14 3v4h4" />
      <path d="M10 12h5M10 15.5h5M10 8.5h1.5" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5" />
      <circle cx="12" cy="8" r="0.6" fill="currentColor" />
    </>
  ),
  alert: (
    <>
      <path d="M12 4L2.8 20h18.4L12 4z" />
      <path d="M12 10v4.5" />
      <circle cx="12" cy="17.2" r="0.6" fill="currentColor" />
    </>
  ),
  close: <path d="M6 6l12 12M18 6L6 18" />,
  plus: <path d="M12 5v14M5 12h14" />,
  'chevron-up': <path d="M6 14l6-6 6 6" />,
  'chevron-down': <path d="M6 10l6 6 6-6" />,
  grip: (
    <>
      <circle cx="9" cy="7" r="1" fill="currentColor" />
      <circle cx="15" cy="7" r="1" fill="currentColor" />
      <circle cx="9" cy="12" r="1" fill="currentColor" />
      <circle cx="15" cy="12" r="1" fill="currentColor" />
      <circle cx="9" cy="17" r="1" fill="currentColor" />
      <circle cx="15" cy="17" r="1" fill="currentColor" />
    </>
  ),
  star: (
    <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1.1 5.8-5.3-2.9-5.3 2.9 1.1-5.8L3.5 9.7l5.9-.8L12 3.5z" />
  ),
  shield: (
    <>
      <path d="M12 3.5l7 2.5v6c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6l7-2.5z" />
      <path d="M9 12l2.2 2.2L15.5 10" />
    </>
  ),
  install: (
    <>
      <rect x="4" y="4" width="16" height="12" rx="1.5" />
      <path d="M12 8v7M9 12.5l3 3 3-3" />
      <path d="M8 20h8" />
    </>
  ),
  offline: (
    <>
      <path d="M5 10.5a10 10 0 0 1 4-2.2M12 7c2.8 0 5.4 1.2 7 3.5" />
      <path d="M8 14a6 6 0 0 1 2.2-1.6M15.5 13a6 6 0 0 1 1 1" />
      <circle cx="12" cy="18" r="1" fill="currentColor" />
      <path d="M4 4l16 16" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  pin: (
    <>
      <path d="M12 21s6.5-6.2 6.5-11a6.5 6.5 0 1 0-13 0c0 4.8 6.5 11 6.5 11z" />
      <circle cx="12" cy="10" r="2.4" />
    </>
  ),
  flag: (
    <>
      <path d="M6 21V4" />
      <path d="M6 5h11l-2.5 3.5L17 12H6" />
    </>
  ),
  pharmacy: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M12 8v8M8 12h8" />
    </>
  ),
  share: (
    <>
      <circle cx="6" cy="12" r="2.2" />
      <circle cx="17.5" cy="6" r="2.2" />
      <circle cx="17.5" cy="18" r="2.2" />
      <path d="M8 11l7.5-4M8 13l7.5 4" />
    </>
  ),
  route: (
    <>
      <circle cx="6" cy="18.5" r="2" />
      <circle cx="18" cy="5.5" r="2" />
      <path d="M8 18.5h6a4 4 0 0 0 0-8H10a4 4 0 0 1 0-8h6" />
    </>
  ),
};

type IconProps = {
  name: IconName;
  size?: number;
  className?: string;
};

/** Inline stroke icon set — no remote icon fonts or images. */
export default function Icon({ name, size = 20, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {PATHS[name]}
    </svg>
  );
}
