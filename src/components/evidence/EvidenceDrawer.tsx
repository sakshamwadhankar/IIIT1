import Icon from '../shared/Icon';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import type { RankedRoute } from '../../types/route';
import { getEvidenceByIds } from '../../data/evidence';
import { routeLabelTitle } from '../../lib/ranking';
import { formatFare, formatMinutes, formatWalking } from '../../lib/formatters';
import EvidenceTimeline from './EvidenceTimeline';
import StaleDataState from './StaleDataState';
import { WeatherImpactCard, IncidentTrendCard } from './WeatherImpactCard';
import { LocalUpdateCard } from './LocalUpdateCard';
import { PlaceReputationCard } from './PlaceReputationCard';

type EvidenceDrawerProps = {
  open: boolean;
  ranked: RankedRoute | null;
  stopIds: string[];
  onClose: () => void;
};

function SignalRow({
  label,
  value,
  meterPercent,
  note,
}: {
  label: string;
  value: string;
  meterPercent?: number;
  note?: string;
}) {
  return (
    <div className="signal-row">
      <div className="signal-row__top">
        <span className="signal-row__label">{label}</span>
        <span className="signal-row__value">{value}</span>
      </div>
      {typeof meterPercent === 'number' ? (
        <div
          className="signal-row__meter"
          role="img"
          aria-label={`${label}: ${meterPercent}%`}
        >
          <span style={{ width: `${meterPercent}%` }} />
        </div>
      ) : null}
      {note ? <p className="signal-row__note">{note}</p> : null}
    </div>
  );
}

/**
 * Route evidence drawer (dialog). Explains the route with plain-language
 * reasons, trade-offs, safety/comfort/live-like signals, reputation, and a
 * timestamped evidence timeline — all synthetic demo data.
 */
export default function EvidenceDrawer({ open, ranked, stopIds, onClose }: EvidenceDrawerProps) {
  const panelRef = useFocusTrap<HTMLDivElement>(open, onClose);
  if (!open || !ranked) return null;

  const { route, totals } = ranked;
  const evidence = getEvidenceByIds(route.evidenceIds);
  const traffic = evidence.filter((item) => item.kind === 'traffic');
  const news = evidence.filter((item) => item.kind === 'news');
  const hasStaleSignal =
    route.confidence === 'limited' ||
    evidence.some((item) => /stale/i.test(item.freshnessLabel));

  return (
    <div className="overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="evidence-drawer-title"
        className="overlay__panel overlay__panel--drawer"
      >
        <header className="overlay__header overlay__header--sticky">
          <div>
            <p className="overlay__kicker">Route evidence · Demo data</p>
            <h2 id="evidence-drawer-title">{route.name}</h2>
            <p className="overlay__sub">
              {routeLabelTitle(route.label)} · {formatMinutes(totals.etaMinutes)} ·{' '}
              {formatFare(totals.fareInr)} · {formatWalking(totals.walkingMeters)} walking
            </p>
          </div>
          <button type="button" className="btn btn--icon" aria-label="Close evidence drawer" onClick={onClose}>
            <Icon name="close" size={18} />
          </button>
        </header>

        <div className="overlay__body">
          <section aria-labelledby="evidence-why">
            <h3 id="evidence-why">Why this route</h3>
            <ul className="reason-list">
              {ranked.reasons.map((reason) => (
                <li key={reason}>
                  <Icon name="check" size={15} />
                  {reason}
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="evidence-tradeoffs">
            <h3 id="evidence-tradeoffs">Trade-offs</h3>
            <p className="evidence-tradeoff">{ranked.tradeoff}</p>
            <p className="evidence-caveat-line">
              <Icon name="alert" size={15} />
              {ranked.caveat}
            </p>
          </section>

          {hasStaleSignal ? (
            <StaleDataState
              detail={
                route.confidence === 'limited'
                  ? 'Signals for this route are incomplete in the demo data — the listed freshness times show which items are older.'
                  : 'One or more signals below were last refreshed yesterday.'
              }
            />
          ) : null}

          <section aria-labelledby="evidence-safety">
            <h3 id="evidence-safety">Safety signals</h3>
            <div className="signal-rows">
              <SignalRow
                label="Lighting coverage"
                value={`${route.safety.lightingPercent}%`}
                meterPercent={route.safety.lightingPercent}
                note="Share of the walking segments in lit zones (demo survey)."
              />
              <SignalRow
                label="Populated segments"
                value={`${route.safety.populatedPercent}%`}
                meterPercent={route.safety.populatedPercent}
                note="Share of segments with evening activity: shops, vendors, homes."
              />
              <SignalRow
                label="Nightlife exposure"
                value={route.safety.nightlifeExposure}
                note={
                  route.safety.nightlifeExposure === 'high'
                    ? 'Passes one nightlife-heavy segment. This is a routing preference, not a claim about any venue.'
                    : 'A preference-based measure of how many nightlife-cluster segments the route passes.'
                }
              />
              <SignalRow
                label="Incident trend"
                value={
                  route.safety.incidentTrend === 'lower'
                    ? 'Below 30-day baseline'
                    : route.safety.incidentTrend === 'baseline'
                      ? 'Near 30-day baseline'
                      : 'Above 30-day baseline'
                }
                note="Area-level context for the demo corridor — not a prediction for any individual journey."
              />
              <SignalRow label="Road crossings" value={`${route.comfort.crossings} crossings`} />
            </div>
          </section>

          <section aria-labelledby="evidence-comfort">
            <h3 id="evidence-comfort">Comfort signals</h3>
            <div className="signal-rows">
              <SignalRow
                label="Sidewalk cleanliness"
                value={route.comfort.cleanliness}
                note="From the demo civic survey, refreshed yesterday."
              />
              <SignalRow
                label="Covered walking"
                value={`${route.comfort.coveredWalkingMeters} m of ${route.walkingMeters} m`}
                note="Distance under arcades, shelters, or the metro approach during the rain window."
              />
              <SignalRow
                label="Construction"
                value={route.comfort.construction ? 'Reported on this route' : 'None reported'}
              />
            </div>
          </section>

          <section aria-labelledby="evidence-live">
            <h3 id="evidence-live">Live-like signals</h3>
            {traffic.length > 0 ? (
              <ul className="traffic-list">
                {traffic.map((item) => (
                  <li key={item.id} className={/stale|yesterday/i.test(item.freshnessLabel) ? 'traffic-item--stale' : ''}>
                    <Icon name="cab" size={16} />
                    <div>
                      <p className="traffic-item__title">{item.title}</p>
                      <p className="traffic-item__meta">
                        {item.freshnessLabel} · Observed {item.observedAt} · Source: {item.sourceLabel} ·{' '}
                        {item.confidence === 'high' ? 'High confidence' : item.confidence === 'medium' ? 'Medium confidence' : 'Limited evidence'}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="evidence-empty">No traffic signals for this route in the demo area.</p>
            )}
            <WeatherImpactCard route={route} />
            <IncidentTrendCard />
          </section>

          <section aria-labelledby="evidence-news">
            <h3 id="evidence-news">Recent local update</h3>
            {news.length > 0 ? (
              news.map((item) => <LocalUpdateCard key={item.id} item={item} />)
            ) : (
              <p className="evidence-empty">
                <Icon name="info" size={16} />
                No recent route-relevant updates in this demo area.
              </p>
            )}
          </section>

          <section aria-labelledby="evidence-reputation">
            <h3 id="evidence-reputation">Reputation</h3>
            <div className="reputation-list">
              {reputationPlaceIds(stopIds).map((placeId) => (
                <PlaceReputationCard key={placeId} placeId={placeId} />
              ))}
            </div>
          </section>

          <section aria-labelledby="evidence-timeline">
            <h3 id="evidence-timeline">Evidence timeline</h3>
            <EvidenceTimeline items={evidence} />
          </section>

          <footer className="evidence-disclaimer">
            <Icon name="shield" size={16} />
            <p>
              Raah is a planning aid. Route signals are synthetic demo data and do not guarantee
              personal safety.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}

function reputationPlaceIds(stopIds: string[]): string[] {
  // Stops first, then the destination — both have demo reputation cards.
  return [...stopIds, 'place-indiranagar-metro-gate-3'];
}
