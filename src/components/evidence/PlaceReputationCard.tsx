import Icon from '../shared/Icon';
import { REPUTATION_FIXTURES } from '../../data/reputation';
import type { ReputationBadge } from '../../types/evidence';

const BADGE_LABEL: Record<ReputationBadge, string> = {
  trusted: 'Trusted',
  premium: 'Premium',
  'safety-supporting': 'Safety-supporting',
};

/**
 * Place reputation card. Badges are separated: Premium means comfort and
 * service level, never safety. Reputation belongs to places, not people
 * or neighbourhoods.
 */
export function PlaceReputationCard({ placeId }: { placeId: string }) {
  const record = REPUTATION_FIXTURES.find((entry) => entry.placeId === placeId);
  if (!record) return null;

  return (
    <div className="reputation-card">
      <div className="reputation-card__head">
        <Icon name="pin" size={18} />
        <div>
          <h4>{record.placeName}</h4>
          <p className="reputation-card__rating">
            {record.rating.toFixed(1)}/5 reputation · {record.verifiedAt.toLowerCase()} ·{' '}
            {record.staffed ? 'staffed' : 'unstaffed'} · open until {record.openUntil}
          </p>
        </div>
      </div>
      <p className="reputation-card__summary">{record.summary}</p>
      <p className="reputation-card__context">Safety context: {record.safetyContext}</p>
      <div className="reputation-card__badges">
        {record.badges.map((badge) => (
          <span key={badge} className={`rep-badge rep-badge--${badge}`}>
            {badge === 'trusted' ? <Icon name="shield" size={13} /> : null}
            {badge === 'premium' ? <Icon name="star" size={13} /> : null}
            {badge === 'safety-supporting' ? <Icon name="info" size={13} /> : null}
            {BADGE_LABEL[badge]}
          </span>
        ))}
      </div>
      {record.badges.includes('premium') ? (
        <p className="reputation-card__premium-note">
          Premium describes comfort and service level — it does not mean safer.
        </p>
      ) : null}
      <p className="reputation-card__meta">Source: {record.sourceLabel} · Demo data</p>
    </div>
  );
}
