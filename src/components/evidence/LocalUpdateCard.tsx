import Icon from '../shared/Icon';
import type { EvidenceItem } from '../../types/evidence';

/** Restrained local-update card (fictional news), never an alarming feed. */
export function LocalUpdateCard({ item }: { item: EvidenceItem }) {
  return (
    <div className={`local-update-card ${item.severity === 'caution' ? 'local-update-card--caution' : ''}`}>
      <p className="local-update-card__kicker">Recent local update · Demo item</p>
      <h4>{item.title}</h4>
      <p className="local-update-card__summary">{item.summary}</p>
      <p className="local-update-card__meta">
        Source: {item.sourceLabel} · {item.observedAt}
      </p>
      <p className="local-update-card__why">
        <Icon name="info" size={14} />
        Why it matters for this route: the update is included in this route’s signals above.
      </p>
    </div>
  );
}
