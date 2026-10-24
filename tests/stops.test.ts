import { describe, it, expect } from 'vitest';
import { getRoute } from '../src/data/routes';
import {
  computeTotals,
  insertStop,
  moveStop,
  removeStopAt,
  reorderDeltaMinutes,
  reorderAnnouncement,
  restoreStop,
} from '../src/lib/stops';

const SAFEST = getRoute('route-safest-fit');
const PHARMACY = 'place-greencare-pharmacy';
const CAFE = 'place-corner-cafe';

describe('stop totals', () => {
  it('starts from the fixture totals with no stops', () => {
    const totals = computeTotals(SAFEST, []);
    expect(totals).toEqual({
      etaMinutes: 32,
      fareInr: 180,
      walkingMeters: 420,
      stopCount: 0,
      stopDetourMinutes: 0,
    });
  });

  it('adds the pharmacy detour: +6 min, +200 m walking, ₹0 extra', () => {
    const totals = computeTotals(SAFEST, [PHARMACY]);
    expect(totals.etaMinutes).toBe(38);
    expect(totals.walkingMeters).toBe(620);
    expect(totals.fareInr).toBe(180);
    expect(totals.stopCount).toBe(1);
  });

  it('sums multiple stop detours deterministically', () => {
    const totals = computeTotals(SAFEST, [PHARMACY, CAFE]);
    // Pharmacy is served as the first leg, so its early detour (4) applies:
    // 32 + 4 + 4 (café) = 40.
    expect(totals.etaMinutes).toBe(40);
    expect(totals.walkingMeters).toBe(740); // 420 + 200 + 120
    expect(totals.stopCount).toBe(2);
  });

  it('removing the stop restores the original route totals', () => {
    const withStop = computeTotals(SAFEST, [PHARMACY]);
    const { stopIds } = removeStopAt([PHARMACY], 0);
    const withoutStop = computeTotals(SAFEST, stopIds);
    expect(withoutStop.etaMinutes).toBe(32);
    expect(withoutStop.walkingMeters).toBe(420);
    expect(withoutStop.stopCount).toBe(0);
    expect(withStop.stopCount).toBe(1);
  });
});

describe('stop list operations', () => {
  it('inserts a stop once', () => {
    expect(insertStop([], PHARMACY)).toEqual([PHARMACY]);
    expect(insertStop([PHARMACY], PHARMACY)).toEqual([PHARMACY]);
  });

  it('removes by index and reports what was removed', () => {
    const { stopIds, removed } = removeStopAt([PHARMACY, CAFE], 0);
    expect(stopIds).toEqual([CAFE]);
    expect(removed).toEqual({ placeId: PHARMACY, index: 0 });
    expect(removeStopAt([], 3).removed).toBeNull();
  });

  it('restores a removed stop at its previous index', () => {
    const restored = restoreStop([CAFE], PHARMACY, 0);
    expect(restored).toEqual([PHARMACY, CAFE]);
    expect(restoreStop([PHARMACY], PHARMACY, 0)).toEqual([PHARMACY]);
  });

  it('moves a stop down and up without drag and drop', () => {
    expect(moveStop([PHARMACY, CAFE], 0, 1)).toEqual([CAFE, PHARMACY]);
    expect(moveStop([CAFE, PHARMACY], 1, 0)).toEqual([PHARMACY, CAFE]);
    expect(moveStop([PHARMACY], 0, 5)).toEqual([PHARMACY]);
  });
});

describe('reorder effects', () => {
  it('computes the +2 min change when the pharmacy moves later in the order', () => {
    const before = [PHARMACY, CAFE];
    const after = [CAFE, PHARMACY];
    // Before: pharmacy first (4 min early detour) + café (4) = 40 min total.
    expect(computeTotals(SAFEST, before).etaMinutes).toBe(40);
    // After: café first (4) + pharmacy (6) = 42 min total.
    expect(computeTotals(SAFEST, after).etaMinutes).toBe(42);
    expect(reorderDeltaMinutes(SAFEST, before, after)).toBe(2);
    expect(reorderAnnouncement(2)).toBe(
      'Route updated for the new stop order · +2 min compared with the previous order.',
    );
  });

  it('announces a faster order with a minus sign', () => {
    expect(reorderAnnouncement(-2)).toBe(
      'Route updated for the new stop order · −2 min compared with the previous order.',
    );
    expect(reorderAnnouncement(0)).toBe(
      'Route updated for the new stop order · same total time.',
    );
  });

  it('ignores reorders when the stop set changed', () => {
    expect(reorderDeltaMinutes(SAFEST, [PHARMACY], [CAFE])).toBe(0);
    expect(reorderDeltaMinutes(SAFEST, [PHARMACY], [])).toBe(0);
  });
});
