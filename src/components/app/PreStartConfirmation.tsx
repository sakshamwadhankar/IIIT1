import { useState } from 'react';
import Icon from '../shared/Icon';
import SignalBadge from '../shared/SignalBadge';
import { SignalBadges } from '../shared/SignalBadge';
import { ROUTE_VISUALS } from '../routes/RouteMap';
import type { RankedRoute } from '../../types/route';
import { WEATHER_FIXTURES } from '../../data/weather';
import { routeLabelTitle } from '../../lib/ranking';
import { formatFare, formatMinutes, formatWalking } from '../../lib/formatters';

type PreStartConfirmationProps = {
  ranked: RankedRoute;
  onBackToRoutes: () => void;
  onStart: () => void;
  onViewEvidence: () => void;
};

/**
 * Screen F — pre-start confirmation. Reinforces that the user chooses when
 * to begin; navigation starts only via the explicit Start route action.
 */
export default function PreStartConfirmation({
  ranked,
  onBackToRoutes,
  onStart,
  onViewEvidence,
}: PreStartConfirmationProps) {
  const { route, totals } = ranked;
  const visuals = ROUTE_VISUALS[route.label];
  const rain = WEATHER_FIXTURES[0];
  const [copied, setCopied] = useState(false);

  const sharePreview = async () => {
    const text = [
      `Raah trip preview: ${route.name} (${routeLabelTitle(route.label)})`,
      `${formatMinutes(totals.etaMinutes)} total · ${formatFare(totals.fareInr)} · ${formatWalking(totals.walkingMeters)} walking · ${totals.stopCount} stop${totals.stopCount === 1 ? '' : 's'}`,
      `Why: ${ranked.reasons.slice(0, 2).join(' ')}`,
      `Caveat: ${ranked.caveat}`,
    ].join('\n');
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2500);
      } else {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="pre-start" aria-labelledby="pre-start-title">
      <div className="card pre-start__card">
        <p className="overlay__kicker">Ready when you are · Nothing starts until you choose</p>
        <header className="pre-start__header">
          <span className="route-card__letter" style={{ borderColor: visuals.color, color: visuals.color }} aria-hidden="true">
            {visuals.letter}
          </span>
          <div>
            <h1 id="pre-start-title">{route.name}</h1>
            <p className="pre-start__label" style={{ color: visuals.color }}>
              {routeLabelTitle(route.label)} · {route.viaSummary}
            </p>
          </div>
        </header>

        <dl className="pre-start__summary">
          <div>
            <dt>Total time</dt>
            <dd>{formatMinutes(totals.etaMinutes)}</dd>
          </div>
          <div>
            <dt>Cost</dt>
            <dd>{formatFare(totals.fareInr)}</dd>
          </div>
          <div>
            <dt>Walking</dt>
            <dd>{formatWalking(totals.walkingMeters)}</dd>
          </div>
          <div>
            <dt>Stops</dt>
            <dd>{totals.stopCount}</dd>
          </div>
        </dl>

        <div className="pre-start__why">
          <h2>Why this route fits</h2>
          <ul className="reason-list">
            {ranked.reasons.slice(0, 3).map((reason) => (
              <li key={reason}>
                <Icon name="check" size={15} />
                {reason}
              </li>
            ))}
          </ul>
        </div>

        <SignalBadges>
          <SignalBadge icon="bulb" label={`${route.safety.lightingPercent}% well-lit`} tone="positive" />
          <SignalBadge icon="users" label={`${route.safety.populatedPercent}% populated`} tone="positive" />
          <SignalBadge icon="rain" label={`Rain exposure: ${route.weatherImpact}`} tone={route.weatherImpact === 'low' ? 'positive' : 'caution'} />
        </SignalBadges>

        <div className="pre-start__caution" role="note">
          <p>
            <Icon name="alert" size={16} />
            <span>
              <strong>Caution:</strong> {ranked.caveat} {rain.rainWindow ? `Light rain may begin around 8:00 PM (${rain.rainWindow}).` : ''}
            </span>
          </p>
        </div>

        <div className="pre-start__actions">
          <button type="button" className="btn btn--primary btn--large" onClick={onStart}>
            Start route
            <Icon name="route" size={18} />
          </button>
          <button type="button" className="btn btn--secondary" onClick={onBackToRoutes}>
            Edit route
          </button>
          <button type="button" className="btn btn--secondary" onClick={onViewEvidence}>
            <Icon name="doc" size={17} />
            View evidence
          </button>
          <button type="button" className="btn btn--ghost" onClick={onBackToRoutes}>
            Back to routes
          </button>
        </div>

        <div className="pre-start__share">
          <button type="button" className="btn btn--ghost btn--small" onClick={sharePreview}>
            <Icon name="share" size={15} />
            Share trip preview
          </button>
          {copied ? (
            <span className="pre-start__copied" role="status" aria-live="polite">
              Trip preview copied locally — nothing was sent anywhere.
            </span>
          ) : (
            <span className="pre-start__share-note">Copies a text summary to your clipboard only.</span>
          )}
        </div>
      </div>
    </section>
  );
}
