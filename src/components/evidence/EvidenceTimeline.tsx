import Icon from '../shared/Icon';
import type { EvidenceItem } from '../../types/evidence';
import { CONFIDENCE_LABEL, SEVERITY_LABEL } from '../../lib/formatters';

type EvidenceTimelineProps = {
  items: EvidenceItem[];
};

/**
 * Timestamped evidence cards with source labels and confidence — the
 * freshness pattern every dynamic-looking item follows.
 */
export default function EvidenceTimeline({ items }: EvidenceTimelineProps) {
  if (items.length === 0) {
    return (
      <p className="evidence-empty">
        <Icon name="info" size={16} />
        No recent route-relevant updates in this demo area.
      </p>
    );
  }

  const sorted = [...items].sort((a, b) => a.kind.localeCompare(b.kind) || a.id.localeCompare(b.id));

  return (
    <ol className="evidence-timeline">
      {sorted.map((item) => (
        <li key={item.id} className={`evidence-card evidence-card--${item.severity ?? 'info'}`}>
          <div className="evidence-card__head">
            <span className={`evidence-kind evidence-kind--${item.kind}`}>{kindLabel(item.kind)}</span>
            {item.severity && item.severity !== 'info' ? (
              <span className={`evidence-severity evidence-severity--${item.severity}`}>
                <Icon name="alert" size={13} />
                {SEVERITY_LABEL[item.severity]}
              </span>
            ) : null}
          </div>
          <h4>{item.title}</h4>
          <p className="evidence-card__summary">{item.summary}</p>
          <p className="evidence-card__meta">
            <Icon name="clock" size={13} />
            {item.freshnessLabel}
            {item.period ? ` · Period: ${item.period}` : ''} · Observed {item.observedAt}
          </p>
          <p className="evidence-card__meta">
            Source: {item.sourceLabel} · {CONFIDENCE_LABEL[item.confidence]} · Demo item
          </p>
        </li>
      ))}
    </ol>
  );
}

function kindLabel(kind: EvidenceItem['kind']): string {
  switch (kind) {
    case 'traffic':
      return 'Traffic';
    case 'weather':
      return 'Weather';
    case 'incident-trend':
      return 'Incident trend';
    case 'news':
      return 'Local update';
    case 'cleanliness':
      return 'Cleanliness';
    case 'reputation':
      return 'Reputation';
    default:
      return kind;
  }
}
