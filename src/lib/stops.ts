import type { DemoRoute, RouteTotals } from '../types/route';
import type { DemoPlace } from '../types/planner';
import { getPlace } from '../data/places';

/**
 * Deterministic stop handling. Totals are recalculated locally from fixture
 * detour values. When several stops exist, a stop served as the first leg
 * after the origin uses its early detour (it is closer to the origin), which
 * is why reordering can change the total by a couple of minutes. A single
 * stop always uses its canonical detour.
 */

export function detourMinutesForPosition(
  place: DemoPlace,
  position: number,
  totalStops: number,
): number {
  if (position === 0 && totalStops > 1 && typeof place.detourMinutesEarly === 'number') {
    return place.detourMinutesEarly;
  }
  return place.detourMinutes ?? 0;
}

export function computeTotals(route: DemoRoute, stopIds: string[]): RouteTotals {
  const stops = stopIds.map(getPlace);
  let detourMinutes = 0;
  let detourFare = 0;
  let detourWalking = 0;
  stops.forEach((place, position) => {
    detourMinutes += detourMinutesForPosition(place, position, stops.length);
    detourFare += place.detourFareInr ?? 0;
    detourWalking += place.detourWalkingMeters ?? 0;
  });
  return {
    etaMinutes: route.etaMinutes + detourMinutes,
    fareInr: route.fareInr + detourFare,
    walkingMeters: route.walkingMeters + detourWalking,
    stopCount: stops.length,
    stopDetourMinutes: detourMinutes,
  };
}

export function insertStop(stopIds: string[], placeId: string): string[] {
  if (stopIds.includes(placeId)) {
    return stopIds;
  }
  return [...stopIds, placeId];
}

export function removeStopAt(
  stopIds: string[],
  index: number,
): { stopIds: string[]; removed: { placeId: string; index: number } | null } {
  if (index < 0 || index >= stopIds.length) {
    return { stopIds, removed: null };
  }
  const placeId = stopIds[index];
  return {
    stopIds: stopIds.filter((_, i) => i !== index),
    removed: { placeId, index },
  };
}

export function restoreStop(stopIds: string[], placeId: string, index: number): string[] {
  if (stopIds.includes(placeId)) {
    return stopIds;
  }
  const next = [...stopIds];
  next.splice(Math.max(0, Math.min(index, next.length)), 0, placeId);
  return next;
}

export function moveStop(stopIds: string[], from: number, to: number): string[] {
  if (from === to) return stopIds;
  if (from < 0 || from >= stopIds.length) return stopIds;
  const clampedTo = Math.max(0, Math.min(to, stopIds.length - 1));
  const next = [...stopIds];
  const [moved] = next.splice(from, 1);
  next.splice(clampedTo, 0, moved);
  return next;
}

/**
 * Total-time difference caused by a reorder (after minus before).
 * Positive means the new order takes longer, e.g. +2 min.
 */
export function reorderDeltaMinutes(
  route: DemoRoute,
  before: string[],
  after: string[],
): number {
  if (before.length !== after.length) return 0;
  const sameSet = [...before].sort().join('|') === [...after].sort().join('|');
  if (!sameSet) return 0;
  return computeTotals(route, after).etaMinutes - computeTotals(route, before).etaMinutes;
}

export function reorderAnnouncement(deltaMinutes: number): string {
  const rounded = Math.round(Math.abs(deltaMinutes));
  if (rounded === 0) {
    return 'Route updated for the new stop order · same total time.';
  }
  const sign = deltaMinutes > 0 ? '+' : '−';
  return `Route updated for the new stop order · ${sign}${rounded} min compared with the previous order.`;
}
