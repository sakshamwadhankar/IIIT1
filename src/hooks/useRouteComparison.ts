import { useEffect, useMemo, useState } from 'react';
import type { PlannerAction } from './usePlannerState';
import type { PlannerState } from '../types/planner';
import type { RouteRankingResult } from '../types/route';
import { ROUTES } from '../data/routes';
import { getPlace, PLACE_MAP } from '../data/places';
import { rankRoutes } from '../lib/ranking';
import { computeTotals } from '../lib/stops';

/** Simulated local comparison delay — keeps a visible loading state without network. */
export const COMPARISON_DELAY_MS = 450;

export type RouteComparison = {
  result: RouteRankingResult | null;
  isComparing: boolean;
  hasDestination: boolean;
};

/**
 * Derives the ranked route set from planner state. Computation is fully
 * local and synchronous; the short "comparing" delay is cosmetic and
 * driven by a timer that dispatches COMPARISON_READY.
 */
export function useRouteComparison(
  state: PlannerState,
  dispatch: (action: PlannerAction) => void,
): RouteComparison {
  const hasDestination = Boolean(state.destinationId);

  const result = useMemo<RouteRankingResult | null>(() => {
    if (!state.destinationId) return null;
    const inputs = ROUTES.map((route) => ({
      route,
      totals: computeTotals(route, state.stopIds),
    }));
    return rankRoutes(inputs, state.preferences, state.mode, state.primaryPreference);
  }, [
    state.destinationId,
    state.stopIds,
    state.preferences,
    state.mode,
    state.primaryPreference,
  ]);

  const isComparing = state.comparisonStatus === 'comparing';

  useEffect(() => {
    if (!isComparing) return;
    const timer = window.setTimeout(() => {
      dispatch({ type: 'COMPARISON_READY' });
    }, COMPARISON_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [isComparing, dispatch]);

  return { result, isComparing, hasDestination };
}

/** Suggested stop places for the add-stop panel. */
export function useStopSuggestions(stopIds: string[]) {
  return useMemo(
    () => stopIds.map((id) => PLACE_MAP[id]).filter(Boolean),
    [stopIds],
  );
}

/** Resolve place ids to typed places. */
export function usePlaces(placeIds: string[]) {
  return useMemo(
    () => placeIds.map((id) => (PLACE_MAP[id] ? getPlace(id) : null)).filter(Boolean),
    [placeIds],
  );
}

/** Tracks online/offline so the demo banner can react, without blocking anything. */
export function useOfflineStatus(): boolean {
  const [offline, setOffline] = useState(() =>
    typeof navigator === 'undefined' ? false : navigator.onLine === false,
  );
  useEffect(() => {
    const goOffline = () => setOffline(true);
    const goOnline = () => setOffline(false);
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);
  return offline;
}
