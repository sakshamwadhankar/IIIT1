import { useState } from 'react';
import Icon from '../shared/Icon';
import RouteMap from './RouteMap';
import RouteLegend from './RouteLegend';
import RouteCard from './RouteCard';
import RouteSummaryBar from './RouteSummaryBar';
import NoPerfectMatchState from '../app/NoPerfectMatchState';
import StopList from '../stops/StopList';
import { getPlace } from '../../data/places';
import type { RouteRankingResult } from '../../types/route';
import type { PlannerState } from '../../types/planner';

type ComparisonViewProps = {
  state: PlannerState;
  result: RouteRankingResult | null;
  isComparing: boolean;
  onSelectRoute: (routeId: string) => void;
  onOpenEvidence: (routeId: string) => void;
  onChooseRoute: (routeId: string) => void;
  onEditTrip: () => void;
  onAddStop: () => void;
  onRemoveStop: (index: number) => void;
  onUndoRemove: () => void;
  onMoveStop: (from: number, to: number) => void;
  onRelaxPreference: (key: string) => void;
  onShowAllRoutes: () => void;
};

/**
 * Screen C — the hero comparison. Two-column on desktop (map + list),
 * map/list toggle on mobile, sticky summary, synchronized selection.
 */
export default function ComparisonView({
  state,
  result,
  isComparing,
  onSelectRoute,
  onOpenEvidence,
  onChooseRoute,
  onEditTrip,
  onAddStop,
  onRemoveStop,
  onUndoRemove,
  onMoveStop,
  onRelaxPreference,
  onShowAllRoutes,
}: ComparisonViewProps) {
  const [mobilePane, setMobilePane] = useState<'map' | 'list'>('list');
  const ranked = result?.ranked ?? [];
  const selectedRouteId = state.selectedRouteId;

  return (
    <div className="comparison">
      <RouteSummaryBar state={state} routeCount={ranked.length} onEditTrip={onEditTrip} />

      {result?.noPerfectMatch ? (
        <NoPerfectMatchState
          info={result.noPerfectMatch}
          onRelax={onRelaxPreference}
          onShowAll={onShowAllRoutes}
        />
      ) : null}

      <div className="comparison__mobile-toggle" role="tablist" aria-label="Map or list view">
        <button
          type="button"
          role="tab"
          aria-selected={mobilePane === 'map'}
          className={`segment ${mobilePane === 'map' ? 'segment--active' : ''}`}
          onClick={() => setMobilePane('map')}
        >
          <Icon name="pin" size={16} />
          Map
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mobilePane === 'list'}
          className={`segment ${mobilePane === 'list' ? 'segment--active' : ''}`}
          onClick={() => setMobilePane('list')}
        >
          <Icon name="doc" size={16} />
          List
        </button>
      </div>

      <div className="comparison__layout">
        <div className={`comparison__map ${mobilePane === 'map' ? 'comparison__pane--active' : ''}`}>
          <RouteMap
            routes={ranked.map((entry) => entry.route)}
            selectedRouteId={selectedRouteId}
            stopIds={state.stopIds}
            onSelectRoute={onSelectRoute}
          />
          <RouteLegend
            ranked={ranked}
            selectedRouteId={selectedRouteId}
            onSelect={onSelectRoute}
          />
          <div className="comparison__map-actions">
            <button type="button" className="btn btn--secondary" onClick={onAddStop}>
              <Icon name="plus" size={16} />
              Add stop
            </button>
          </div>
        </div>

        <div className={`comparison__list ${mobilePane === 'list' ? 'comparison__pane--active' : ''}`}>
          <h1 className="sr-only">Route comparison</h1>

          <section className="comparison__stops card" aria-labelledby="comparison-stops-title">
            <div className="comparison__stops-header">
              <h2 id="comparison-stops-title">Trip stops</h2>
              <button type="button" className="btn btn--secondary btn--small" onClick={onAddStop}>
                <Icon name="plus" size={16} />
                Add stop
              </button>
            </div>
            <StopList
              origin={state.originId ? getPlace(state.originId) : null}
              destination={state.destinationId ? getPlace(state.destinationId) : null}
              stopIds={state.stopIds}
              onRemove={onRemoveStop}
              onMove={onMoveStop}
              onUndo={onUndoRemove}
              canUndo={state.lastRemovedStop !== null}
              compact
            />
          </section>

          {isComparing ? (
            <div className="comparison-loading" aria-busy="true" aria-live="polite">
              <p className="comparison-loading__text">
                <span className="spinner" aria-hidden="true" />
                Comparing routes with your preferences…
              </p>
              {[0, 1, 2].map((index) => (
                <div key={index} className="route-card route-card--skeleton" aria-hidden="true">
                  <div className="skeleton-line skeleton-line--title" />
                  <div className="skeleton-line" />
                  <div className="skeleton-line skeleton-line--short" />
                </div>
              ))}
            </div>
          ) : (
            <div className="route-card-list">
              {ranked.map((entry) => (
                <RouteCard
                  key={entry.route.id}
                  ranked={entry}
                  selected={entry.route.id === selectedRouteId}
                  onSelect={() => onSelectRoute(entry.route.id)}
                  onViewEvidence={() => onOpenEvidence(entry.route.id)}
                  onChoose={() => onChooseRoute(entry.route.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
