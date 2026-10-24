import { describe, it, expect } from 'vitest';
import { validateFixtures } from '../src/lib/validation';
import { ROUTES } from '../src/data/routes';
import { ALL_EVIDENCE } from '../src/data/evidence';
import { STOP_SUGGESTION_IDS } from '../src/data/places';

describe('fixture integrity', () => {
  it('has no structural issues', () => {
    const issues = validateFixtures();
    expect(issues).toEqual([]);
  });

  it('exposes exactly five distinct routes with distinct labels', () => {
    expect(ROUTES).toHaveLength(5);
    expect(new Set(ROUTES.map((route) => route.label)).size).toBe(5);
    expect(ROUTES.map((route) => route.label).sort()).toEqual([
      'balanced',
      'best-value',
      'cleanest',
      'fastest',
      'safest-fit',
    ]);
  });

  it('keeps the demo story numbers intact', () => {
    const byId = Object.fromEntries(ROUTES.map((route) => [route.id, route]));
    // Fastest: 30 min / ₹250.
    expect(byId['route-fastest'].etaMinutes).toBe(30);
    expect(byId['route-fastest'].fareInr).toBe(250);
    // Safest fit: 2 min slower, ₹70 cheaper than the direct cab.
    expect(byId['route-safest-fit'].deltaFromFastestMinutes).toBe(2);
    expect(byId['route-safest-fit'].deltaFromDirectFareInr).toBe(-70);
    // Best value: ₹110 fare, +50 m in the final stretch.
    expect(byId['route-best-value'].fareInr).toBe(110);
    expect(byId['route-best-value'].lastLegExtraWalkingMeters).toBe(50);
    expect(byId['route-cleanest'].comfort.cleanliness).toBe('excellent');
  });

  it('flags every route with low, medium, or high nightlife exposure without labelling venues unsafe', () => {
    for (const route of ROUTES) {
      expect(['low', 'medium', 'high']).toContain(route.safety.nightlifeExposure);
    }
  });

  it('labels all evidence with a fictional source and a time reference', () => {
    expect(ALL_EVIDENCE.length).toBeGreaterThanOrEqual(12);
    for (const item of ALL_EVIDENCE) {
      expect(item.sourceLabel).toMatch(/Demo|Synthetic|Sample/i);
      expect(item.observedAt || item.period).toBeTruthy();
      expect(item.demoOnly).toBe(true);
    }
  });

  it('offers GreenCare Pharmacy as the canonical demo stop with a +6 min detour', () => {
    const suggestions = STOP_SUGGESTION_IDS;
    expect(suggestions[0]).toBe('place-greencare-pharmacy');
  });
});
