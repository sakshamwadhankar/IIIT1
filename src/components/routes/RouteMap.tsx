import Icon from '../shared/Icon';
import type { DemoRoute, RouteLabel } from '../../types/route';
import { getPlace } from '../../data/places';

export const ROUTE_VISUALS: Record<RouteLabel, { color: string; dash: string; letter: string }> = {
  'safest-fit': { color: '#283593', dash: '0', letter: 'S' },
  fastest: { color: '#7c3aed', dash: '2 5', letter: 'F' },
  cleanest: { color: '#0f766e', dash: '10 4', letter: 'C' },
  'best-value': { color: '#b45309', dash: '1 6', letter: 'V' },
  balanced: { color: '#475569', dash: '8 3 2 3', letter: 'B' },
};

const ORIGIN_POINT = { x: 48, y: 258 };
const DEST_POINT = { x: 352, y: 58 };

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
 * Schematic route canvas: a quiet street background with five stable route
 * lines. Colour is never the only distinction — each line has a dash
 * pattern, a letter chip, and a text legend + route list elsewhere.
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
        viewBox="0 0 400 300"
        className="route-map__svg"
        role="img"
        aria-label={`Schematic map with ${visibleRoutes.length} route ${visibleRoutes.length === 1 ? 'line' : 'lines'} from North Campus Library to Indiranagar Metro Gate 3. The same routes are listed as cards and in the legend.`}
      >
        {/* Quiet street background (decorative) */}
        <g aria-hidden="true">
          <rect x="0" y="0" width="400" height="300" rx="14" fill="#eef1f8" />
          {/* City blocks */}
          <g fill="#e3e7f2">
            <rect x="18" y="24" width="82" height="56" rx="6" />
            <rect x="116" y="16" width="96" height="44" rx="6" />
            <rect x="228" y="20" width="70" height="60" rx="6" />
            <rect x="312" y="96" width="66" height="58" rx="6" />
            <rect x="20" y="120" width="64" height="70" rx="6" />
            <rect x="240" y="140" width="58" height="52" rx="6" />
            <rect x="60" y="210" width="76" height="48" rx="6" />
            <rect x="160" y="212" width="64" height="46" rx="6" />
          </g>
          {/* Park */}
          <rect x="100" y="96" width="96" height="66" rx="14" fill="#dcefe4" />
          <text x="148" y="132" fontSize="9" fill="#5f8f76" textAnchor="middle">
            Riverside Gardens
          </text>
          {/* River band */}
          <path d="M-10 296 C 80 276, 150 302, 230 288 S 360 262, 410 274 L 410 310 L -10 310 Z" fill="#dbe7f7" />
          {/* Streets */}
          <g stroke="#c9d0e2" strokeLinecap="round" fill="none">
            <path d="M-10 236 C 60 190, 120 150, 190 108 S 320 40, 420 10" strokeWidth="5" />
            <path d="M-10 190 C 80 170, 180 158, 410 120" strokeWidth="3.5" />
            <path d="M-10 270 C 90 268, 200 250, 300 210 S 390 180, 420 172" strokeWidth="5" />
            <path d="M120 -10 C 130 60, 140 130, 170 200 S 200 270, 208 310" strokeWidth="3.5" />
            <path d="M270 -10 C 262 60, 250 120, 236 170" strokeWidth="3.5" />
          </g>
          <g fontSize="9" fill="#7a8299" fontFamily="inherit">
            <text x="96" y="150" transform="rotate(-32 96 150)">College Road</text>
            <text x="150" y="176" transform="rotate(-4 150 176)">100 Feet Road</text>
            <text x="118" y="264">Market Road</text>
            <text x="286" y="96" transform="rotate(-40 286 96)">Lit Avenue</text>
            <text x="252" y="232" transform="rotate(-18 252 232)">Station Boulevard</text>
          </g>
        </g>

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
                  strokeWidth={20}
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
                strokeWidth={isSelected || focusRouteId ? 5.5 : 2.75}
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
                  <circle r="8.5" fill="#ffffff" stroke={visuals.color} strokeWidth="2" />
                  <text
                    y="3.2"
                    textAnchor="middle"
                    fontSize="9.5"
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
            <g transform="translate(206 262)">
              <rect x="-44" y="-10" width="88" height="17" rx="8" fill="#b45309" opacity="0.92" />
              <text x="0" y="2.6" textAnchor="middle" fontSize="9" fontWeight="600" fill="#fff">
                ₹70 cheaper
              </text>
            </g>
            {selectedRouteId === 'route-cleanest' || selectedRouteId === 'route-safest-fit' ? (
              <g transform="translate(150 236)">
                <rect x="-52" y="-10" width="104" height="17" rx="8" fill="#0f766e" opacity="0.92" />
                <text x="0" y="2.6" textAnchor="middle" fontSize="9" fontWeight="600" fill="#fff">
                  covered segment
                </text>
              </g>
            ) : null}
          </g>
        ) : null}

        {/* Origin / destination markers */}
        <g aria-hidden="true">
          <circle cx={ORIGIN_POINT.x} cy={ORIGIN_POINT.y} r="9" fill="#ffffff" stroke="#283593" strokeWidth="3" />
          <circle cx={ORIGIN_POINT.x} cy={ORIGIN_POINT.y} r="3.5" fill="#283593" />
          <text x={ORIGIN_POINT.x - 6} y={ORIGIN_POINT.y + 22} fontSize="9.5" fontWeight="600" fill="#1e293b">
            North Campus Library
          </text>
          <circle cx={DEST_POINT.x} cy={DEST_POINT.y} r="9" fill="#0f766e" />
          <circle cx={DEST_POINT.x} cy={DEST_POINT.y} r="3.5" fill="#ffffff" />
          <text x={DEST_POINT.x - 44} y={DEST_POINT.y - 13} fontSize="9.5" fontWeight="600" fill="#1e293b">
            Indiranagar Metro Gate 3
          </text>
        </g>

        {/* Stop markers */}
        {stops.map((stop) => (
          <g key={stop.id} aria-hidden="true" transform={`translate(${stop.mapPoint.x} ${stop.mapPoint.y})`}>
            <rect x="-6.5" y="-6.5" width="13" height="13" rx="3" transform="rotate(45)" fill="#ffffff" stroke="#b45309" strokeWidth="2.5" />
            <text y="-11" textAnchor="middle" fontSize="9" fontWeight="600" fill="#1e293b">
              {stop.name}
            </text>
          </g>
        ))}
      </svg>
      {!compact ? (
        <figcaption className="route-map__caption">
          <Icon name="info" size={14} />
          Schematic demo map — route lines are illustrative, not to scale. Every route is fully
          described in the cards and legend.
        </figcaption>
      ) : null}
    </figure>
  );
}
