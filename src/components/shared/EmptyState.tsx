import BrandMark from './BrandMark';
import Icon from './Icon';

type EmptyStateProps = {
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
};

/**
 * In-planner empty state — a compact utility hint with a real app action,
 * not a promotional section. Shown only when no origin/destination exists
 * and the context suggestion was dismissed.
 */
export default function EmptyState({
  title,
  body,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
}: EmptyStateProps) {
  return (
    <section className="empty-state" aria-labelledby="empty-state-title">
      <div className="empty-state__art" aria-hidden="true">
        <BrandMark size={40} />
        <svg width="110" height="36" viewBox="0 0 150 60" className="empty-state__doodle">
          <path
            d="M8 48 C 40 20, 70 56, 96 28 S 138 18, 142 12"
            fill="none"
            stroke="var(--raah-indigo-600)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="1 7"
          />
          <circle cx="8" cy="48" r="5" fill="var(--raah-indigo-700)" />
          <circle cx="142" cy="12" r="6" fill="var(--raah-mint-300)" />
          <circle cx="142" cy="12" r="2.5" fill="var(--raah-indigo-700)" />
        </svg>
      </div>
      <h2 id="empty-state-title">{title}</h2>
      <p>{body}</p>
      {(actionLabel || secondaryLabel) && (
        <div className="empty-state__actions">
          {actionLabel && onAction ? (
            <button type="button" className="btn btn--secondary" onClick={onAction}>
              <Icon name="pin" size={17} />
              {actionLabel}
            </button>
          ) : null}
          {secondaryLabel && onSecondary ? (
            <button type="button" className="btn btn--ghost" onClick={onSecondary}>
              {secondaryLabel}
            </button>
          ) : null}
        </div>
      )}
    </section>
  );
}
