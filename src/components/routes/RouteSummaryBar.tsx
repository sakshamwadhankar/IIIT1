import Icon from '../shared/Icon';
import { preferenceSummaryLabel } from '../../lib/ranking';
import type { PlannerState } from '../../types/planner';

type RouteSummaryBarProps = {
  state: PlannerState;
  routeCount: number;
  onEditTrip: () => void;
};

/** Sticky comparison summary: "5 routes · Safety-first · Demo time 7:20 PM". */
export default function RouteSummaryBar({ state, routeCount, onEditTrip }: RouteSummaryBarProps) {
  return (
    <div className="route-summary-bar">
      <p className="route-summary-bar__text">
        <Icon name="route" size={16} />
        <strong>
          {routeCount} routes · {preferenceSummaryLabel(state.preferences, state.primaryPreference)}
        </strong>
        <span className="route-summary-bar__meta">
        </span>
      </p>
      <button type="button" className="btn btn--ghost btn--small" onClick={onEditTrip}>
        Edit trip
      </button>
    </div>
  );
}
