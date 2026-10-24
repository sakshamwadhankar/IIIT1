import Icon from '../shared/Icon';
import RouteMap from '../routes/RouteMap';
import type { RankedRoute } from '../../types/route';
import { DEMO_ROUTES } from '../app/routeLookup';
import { getPlace } from '../../data/places';
import { formatMinutes } from '../../lib/formatters';

type ActiveRoutePreviewProps = {
  ranked: RankedRoute;
  stopIds: string[];
  onViewEvidence: () => void;
  onChangeRoute: () => void;
  onAddStop: () => void;
  onEndPreview: () => void;
};

/**
 * Screen G — active route preview. Lightly interactive: shows the selected
 * line, the current segment, the upcoming stop, a weather notice, and a
 * reassurance panel. The user can still inspect evidence, change the
 * route, or add a stop — and ending the preview never loses the trip.
 */
export default function ActiveRoutePreview({
  ranked,
  stopIds,
  onViewEvidence,
  onChangeRoute,
  onAddStop,
  onEndPreview,
}: ActiveRoutePreviewProps) {
  const { route, totals } = ranked;
  const nextStopPlace = stopIds.length > 0 ? getPlace(stopIds[0]) : null;
  const reassurance = ranked.reasons.slice(0, 2).join(' ');

  return (
    <section className="active-preview" aria-labelledby="active-preview-title">
      <div className="active-preview__map card">
        <div className="active-preview__map-head">
          <div>
            <p className="overlay__kicker">Active route preview · demo — no real navigation</p>
            <h1 id="active-preview-title">{route.name}</h1>
          </div>
          <p className="active-preview__eta">
            <Icon name="clock" size={18} />
            {formatMinutes(totals.etaMinutes)} total
          </p>
        </div>
        <RouteMap
          routes={DEMO_ROUTES}
          selectedRouteId={route.id}
          focusRouteId={route.id}
          stopIds={stopIds}
          onSelectRoute={() => undefined}
          compact
        />
      </div>

      <div className="active-preview__panel card">
        <div className="active-preview__segment">
          <p className="active-preview__kicker-line">Current segment</p>
          <p className="active-preview__segment-text">
            <Icon name="route" size={18} />
            {route.steps[0]}
          </p>
        </div>

        <div className="active-preview__next">
          <p className="active-preview__kicker-line">Upcoming stop</p>
          <p className="active-preview__next-text">
            <Icon name="pin" size={18} />
            {nextStopPlace ? nextStopPlace.name : 'Indiranagar Metro Gate 3 (destination)'}
            {nextStopPlace?.openUntil ? (
              <span className="active-preview__next-meta"> · open until {nextStopPlace.openUntil}</span>
            ) : null}
          </p>
        </div>

        <div className="active-preview__notice" role="note">
          <p>
            <Icon name="rain" size={16} />
            Rain likely in 35–40 min (8:00–8:40 PM). This route keeps{' '}
            {route.comfort.coveredWalkingMeters} m of the walk under cover.
          </p>
        </div>

        <div className="active-preview__reassure">
          <p className="active-preview__kicker-line">You are on the route you selected because</p>
          <p>{reassurance}</p>
        </div>

        <ol className="active-preview__steps" aria-label="Route steps">
          {route.steps.map((step, index) => (
            <li key={step} className={index === 0 ? 'active-preview__step--current' : ''}>
              <span className="active-preview__step-index" aria-hidden="true">
                {index + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>

        <div className="active-preview__actions">
          <button type="button" className="btn btn--secondary" onClick={onViewEvidence}>
            <Icon name="doc" size={17} />
            View evidence
          </button>
          <button type="button" className="btn btn--secondary" onClick={onChangeRoute}>
            Change route
          </button>
          <button type="button" className="btn btn--secondary" onClick={onAddStop}>
            <Icon name="plus" size={16} />
            Add stop
          </button>
          <button type="button" className="btn btn--primary" onClick={onEndPreview}>
            End preview
          </button>
        </div>
      </div>
    </section>
  );
}
