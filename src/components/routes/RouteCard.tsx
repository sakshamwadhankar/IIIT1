import Icon from '../shared/Icon';
import SignalBadge from '../shared/SignalBadge';
import { SignalBadges } from '../shared/SignalBadge';
import { ROUTE_VISUALS } from './RouteMap';
import type { RankedRoute } from '../../types/route';
import { CONFIDENCE_LABEL, formatFare, formatMinutes, formatWalking } from '../../lib/formatters';
import { routeLabelTitle } from '../../lib/ranking';

const MODE_LABEL = {
  walk: 'Walk',
  cab: 'Cab',
  mixed: 'Walk + cab',
} as const;

function TradeoffLine({ text }: { text: string }) {
  return (
    <p className="tradeoff-line">
      <Icon name="route" size={15} />
      <span>{text}</span>
    </p>
  );
}

type RouteCardProps = {
  ranked: RankedRoute;
  selected: boolean;
  onSelect: () => void;
  onViewEvidence: () => void;
  onChoose: () => void;
};

/**
 * One route option. Answers without opening details: how long, what cost,
 * how much walking, why it differs, and the main caveat — with evidence
 * and choose actions.
 */
export default function RouteCard({
  ranked,
  selected,
  onSelect,
  onViewEvidence,
  onChoose,
}: RouteCardProps) {
  const { route, totals } = ranked;
  const visuals = ROUTE_VISUALS[route.label];

  return (
    <article
      className={`route-card ${selected ? 'route-card--selected' : ''}`}
      aria-label={`${routeLabelTitle(route.label)}: ${route.name}. ${ranked.isRecommended ? 'Recommended. ' : ''}${selected ? 'Selected. ' : ''}`}
    >
      <header className="route-card__header">
        <span
          className="route-card__letter"
          style={{ borderColor: visuals.color, color: visuals.color }}
          aria-hidden="true"
        >
          {visuals.letter}
        </span>
        <div className="route-card__titles">
          <div className="route-card__badges">
            <span className="route-label-chip" style={{ backgroundColor: visuals.color }}>
              {routeLabelTitle(route.label)}
            </span>
            {ranked.isRecommended ? (
              <span className="route-card__recommended">
                <Icon name="star" size={14} />
                Recommended for your preferences
              </span>
            ) : null}
            {selected ? (
              <span className="route-card__selected-tag">
                <Icon name="check" size={14} />
                Selected
              </span>
            ) : null}
          </div>
          <h3 className="route-card__name">
            <button
              type="button"
              className="route-card__select"
              aria-pressed={selected}
              onClick={() => onSelect()}
            >
              {route.name}
              <span className="sr-only"> — select route and highlight on map</span>
            </button>
          </h3>
          <p className="route-card__via">{route.viaSummary}</p>
        </div>
        <span className="route-card__mode">
          <Icon name={route.mode === 'walk' ? 'walk' : route.mode === 'cab' ? 'cab' : 'mixed'} size={16} />
          {MODE_LABEL[route.mode]}
        </span>
      </header>

      <dl className="route-card__metrics">
        <div className="route-metric">
          <dt>
            <Icon name="clock" size={15} />
            <span className="sr-only">Total time</span>
          </dt>
          <dd>{formatMinutes(totals.etaMinutes)}</dd>
        </div>
        <div className="route-metric">
          <dt>
            <Icon name="rupee" size={15} />
            <span className="sr-only">Cost</span>
          </dt>
          <dd>{formatFare(totals.fareInr)}</dd>
        </div>
        <div className="route-metric">
          <dt>
            <Icon name="walk" size={15} />
            <span className="sr-only">Walking distance</span>
          </dt>
          <dd>{formatWalking(totals.walkingMeters)}</dd>
        </div>
      </dl>

      <TradeoffLine text={ranked.tradeoff} />

      <SignalBadges>
        <SignalBadge
          icon="bulb"
          label={`${route.safety.lightingPercent}% well-lit`}
          tone={route.safety.lightingPercent >= 80 ? 'positive' : 'neutral'}
        />
        <SignalBadge
          icon="users"
          label={`${route.safety.populatedPercent}% populated`}
          tone={route.safety.populatedPercent >= 70 ? 'positive' : 'neutral'}
        />
        <SignalBadge
          icon="rain"
          label={`Rain exposure: ${route.weatherImpact}`}
          tone={route.weatherImpact === 'low' ? 'positive' : route.weatherImpact === 'high' ? 'warning' : 'caution'}
        />
        <SignalBadge
          icon="cab"
          label={`Traffic: ${route.traffic}`}
          tone={route.traffic === 'light' ? 'positive' : 'caution'}
        />
      </SignalBadges>

      <p className="route-card__caveat">
        <Icon name="alert" size={15} />
        <span>
          <strong>Caveat:</strong> {ranked.caveat}
        </span>
      </p>

      <p className="route-card__confidence">
        <Icon name="info" size={14} />
        {CONFIDENCE_LABEL[route.confidence]} · Updated recently
      </p>

      <footer className="route-card__actions">
        <button type="button" className="btn btn--secondary" onClick={onViewEvidence}>
          <Icon name="doc" size={17} />
          View evidence
        </button>
        <button type="button" className="btn btn--primary" onClick={onChoose}>
          Choose route
          <Icon name="check" size={17} />
        </button>
      </footer>
    </article>
  );
}
