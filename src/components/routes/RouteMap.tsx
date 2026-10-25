import Icon from '../shared/Icon';
import type { DemoRoute, RouteLabel } from '../../types/route';
import { getPlace } from '../../data/places';

export const ROUTE_VISUALS: Record<RouteLabel, { color: string; dash: string; letter: string }> = {
  'safest-fit': { color: '#253b9b', dash: '0', letter: 'S' },
  fastest: { color: '#ef3025', dash: '2 5', letter: 'F' },
  cleanest: { color: '#23864a', dash: '10 4', letter: 'C' },
  'best-value': { color: '#9a6200', dash: '1 6', letter: 'V' },
  balanced: { color: '#202124', dash: '8 3 2 3', letter: 'B' },
};

/**
 * The illustrated 2D city canvas (public/raah-map.svg) is drawn in a
 * 1558 × 1010 coordinate space. All overlay geometry — route lines,
 * markers, callouts — uses the same space and is hand-aligned to the
 * artwork's white streets.
 */
const MAP_VIEWBOX = { width: 1558, height: 1010 };

const ORIGIN_POINT = { x: 250, y: 855 };
const DEST_POINT = { x: 1230, y: 262 };

type RouteMapProps = {
  routes: DemoRoute[];
  selectedRouteId: string | null;
  stopIds: string[];
  onSelectRoute: (routeId: string) => void;
  /** When set, only this route is drawn (active preview). */
  focusRouteId?: string | null;
  compact?: boolean;
};

function pathFrom(route: DemoRoute): string {
  return route.mapPath.map((point, index) => {
    const command = index === 0 ? 'M' : 'L';
    return `${command} ${point.x} ${point.y}`;
  }).join(' ');
}

function midPointOf(route: DemoRoute): { x: number; y: number } {
  const mid = route.mapPath[Math.floor(route.mapPath.length / 2)];
  return { x: mid.x, y: mid.y };
}

/**
 * Illustrated route canvas: the hand-drawn city artwork stays a flat 2D
 * layer while five stable route lines are overlaid on its streets. Colour
 * is never the only distinction — each line has a dash pattern, a letter
 * chip, and a text legend + route list elsewhere.
 */
export default function RouteMap({
  routes,
  selectedRouteId,
  stopIds,
  onSelectRoute,
  focusRouteId,
  compact = false,
}: RouteMapProps) {
  const visibleRoutes = focusRouteId
    ? routes.filter((route) => route.id === focusRouteId)
    : routes;
  const stops = stopIds.map(getPlace);

  return (
    <figure className={`route-map ${compact ? 'route-map--compact' : ''}`}>
      <svg
        viewBox={`0 0 ${MAP_VIEWBOX.width} ${MAP_VIEWBOX.height}`}
        className="route-map__svg"
        role="img"
        aria-label={`Illustrated map with ${visibleRoutes.length} route ${visibleRoutes.length === 1 ? 'line' : 'lines'} from North Campus Library to Indiranagar Metro Gate 3. The same routes are listed as cards and in the legend.`}
      >
        {/* Illustrated city artwork (decorative 2D layer) */}
        <image
          href="/raah-map.svg"
          x="0"
          y="0"
          width={MAP_VIEWBOX.width}
          height={MAP_VIEWBOX.height}
          aria-hidden="true"
        />

        {/* Route lines */}
        {visibleRoutes.map((route) => {
          const visuals = ROUTE_VISUALS[route.label];
          const isSelected = route.id === selectedRouteId;
          const dimmed = !focusRouteId && selectedRouteId !== null && !isSelected;
          const d = pathFrom(route);
          const mid = midPointOf(route);
          return (
            <g key={route.id} className={`route-map__route ${isSelected ? 'route-map__route--selected' : ''}`}>
              {/* Invisible generous hit area for tap/keyboard selection */}
              {!focusRouteId ? (
                <path
                  d={d}
                  fill="none"
                  stroke="transparent"
                  strokeWidth={70}
                  style={{ cursor: 'pointer' }}
                  tabIndex={0}
                  role="button"
                  aria-pressed={isSelected}
                  aria-label={`Select ${route.name}: ${route.etaMinutes} minutes, ₹${route.fareInr}, ${route.walkingMeters} metres walking`}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onSelectRoute(route.id);
                    }
                  }}
                  onClick={() => onSelectRoute(route.id)}
                  onFocus={() => onSelectRoute(route.id)}
                />
              ) : null}
              <path
                d={d}
                fill="none"
                stroke={visuals.color}
                strokeWidth={isSelected || focusRouteId ? 18 : 9}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={visuals.dash === '0' ? undefined : visuals.dash}
                opacity={focusRouteId ? 1 : dimmed ? 0.4 : isSelected ? 1 : 0.75}
                className={isSelected ? 'route-map__line--selected' : ''}
              />
              {/* Letter chip */}
              {!focusRouteId ? (
                <g
                  aria-hidden="true"
                  transform={`translate(${mid.x} ${mid.y})`}
                  className="route-map__chip"
                  opacity={dimmed ? 0.5 : 1}
                >
                  <circle r="30" fill="#fff8e9" stroke={visuals.color} strokeWidth="7" />
                  <text
                    y="12"
                    textAnchor="middle"
                    fontSize="34"
                    fontWeight="700"
                    fill={visuals.color}
                  >
                    {visuals.letter}
                  </text>
                </g>
              ) : null}
            </g>
          );
        })}

        {/* Callouts for the demo story */}
        {!focusRouteId ? (
          <g aria-hidden="true" className="route-map__callouts">
            <g transform="translate(430 700)">
              <rect x="-170" y="-31" width="340" height="62" rx="28" fill="#9a6200" opacity="0.92" />
              <text x="0" y="10" textAnchor="middle" fontSize="32" fontWeight="600" fill="#fff">
                ₹70 cheaper
              </text>
            </g>
            {selectedRouteId === 'route-cleanest' || selectedRouteId === 'route-safest-fit' ? (
              <g transform="translate(690 440)">
                <rect x="-200" y="-31" width="400" height="62" rx="28" fill="#23864a" opacity="0.92" />
                <text x="0" y="10" textAnchor="middle" fontSize="32" fontWeight="600" fill="#fff">
                  covered segment
                </text>
              </g>
            ) : null}
          </g>
        ) : null}

        {/* Origin / destination markers */}
        <g aria-hidden="true">
          <circle cx={ORIGIN_POINT.x} cy={ORIGIN_POINT.y} r="34" fill="#ffffff" stroke="#253b9b" strokeWidth="11" />
          <circle cx={ORIGIN_POINT.x} cy={ORIGIN_POINT.y} r="13" fill="#253b9b" />
          <text x={ORIGIN_POINT.x - 24} y={ORIGIN_POINT.y + 86} fontSize="34" fontWeight="600" fill="#202124">
            North Campus Library
          </text>
          <circle cx={DEST_POINT.x} cy={DEST_POINT.y} r="34" fill="#23864a" />
          <circle cx={DEST_POINT.x} cy={DEST_POINT.y} r="13" fill="#ffffff" />
          <text x={DEST_POINT.x - 170} y={DEST_POINT.y - 50} fontSize="34" fontWeight="600" fill="#202124">
            Indiranagar Metro Gate 3
          </text>
        </g>

        {/* Stop markers */}
        {stops.map((stop) => (
          <g key={stop.id} aria-hidden="true" transform={`translate(${stop.mapPoint.x} ${stop.mapPoint.y})`}>
            <rect x="-24" y="-24" width="48" height="48" rx="11" transform="rotate(45)" fill="#ffffff" stroke="#9a6200" strokeWidth="9" />
            <text y="-42" textAnchor="middle" fontSize="32" fontWeight="600" fill="#202124">
              {stop.name}
            </text>
          </g>
        ))}
      </svg>
      {!compact ? (
        <figcaption className="route-map__caption">
          <Icon name="info" size={14} />
          Illustrated map — route lines are overlays on the artwork, not to scale. Every route
          is fully described in the cards and legend.
        </figcaption>
      ) : null}
    </figure>
  );
}
