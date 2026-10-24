import { ROUTE_VISUALS } from './RouteMap';
import type { RankedRoute } from '../../types/route';
import { formatFare, formatMinutes } from '../../lib/formatters';

type RouteLegendProps = {
  ranked: RankedRoute[];
  selectedRouteId: string | null;
  onSelect: (routeId: string) => void;
};

/**
 * Text legend for the schematic map — the non-visual alternative to the
 * map lines. Selecting a legend entry syncs with the map and cards.
 */
export default function RouteLegend({ ranked, selectedRouteId, onSelect }: RouteLegendProps) {
  return (
    <div className="route-legend">
      <h3 className="route-legend__title" id="route-legend-title">
        Map legend
      </h3>
      <ul className="route-legend__list" aria-labelledby="route-legend-title">
        {ranked.map((entry) => {
          const visuals = ROUTE_VISUALS[entry.route.label];
          const selected = entry.route.id === selectedRouteId;
          return (
            <li key={entry.route.id}>
              <button
                type="button"
                className={`route-legend__item ${selected ? 'route-legend__item--selected' : ''}`}
                aria-pressed={selected}
                onClick={() => onSelect(entry.route.id)}
              >
                <svg width="34" height="12" viewBox="0 0 34 12" aria-hidden="true">
                  <line
                    x1="2"
                    y1="6"
                    x2="32"
                    y2="6"
                    stroke={visuals.color}
                    strokeWidth={selected ? 4 : 2.5}
                    strokeDasharray={visuals.dash === '0' ? undefined : visuals.dash}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="route-legend__letter" aria-hidden="true">
                  {visuals.letter}
                </span>
                <span className="route-legend__name">{entry.route.name}</span>
                <span className="route-legend__meta">
                  {formatMinutes(entry.totals.etaMinutes)} · {formatFare(entry.totals.fareInr)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
