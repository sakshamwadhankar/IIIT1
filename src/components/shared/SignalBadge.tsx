import type { ReactNode } from 'react';
import Icon, { type IconName } from './Icon';

type SignalBadgeTone = 'neutral' | 'positive' | 'caution' | 'warning' | 'brand';

type SignalBadgeProps = {
  icon: IconName;
  label: string;
  tone?: SignalBadgeTone;
  /** Extra muted detail shown after the label. */
  detail?: string;
  className?: string;
};

const TONE_CLASS: Record<SignalBadgeTone, string> = {
  neutral: 'signal-badge--neutral',
  positive: 'signal-badge--positive',
  caution: 'signal-badge--caution',
  warning: 'signal-badge--warning',
  brand: 'signal-badge--brand',
};

/**
 * Compact icon + text badge. Tone is always paired with text and an icon
 * so colour is never the only signal.
 */
export default function SignalBadge({
  icon,
  label,
  tone = 'neutral',
  detail,
  className,
}: SignalBadgeProps) {
  return (
    <span className={`signal-badge ${TONE_CLASS[tone]} ${className ?? ''}`}>
      <Icon name={icon} size={15} />
      <span className="signal-badge__label">{label}</span>
      {detail ? <span className="signal-badge__detail">{detail}</span> : null}
    </span>
  );
}

export function SignalBadges({ children }: { children: ReactNode }) {
  return <div className="signal-badges">{children}</div>;
}
