import { describe, it, expect } from 'vitest';
import { ROUTES } from '../src/data/routes';
import { computeTotals } from '../src/lib/stops';
import { rankRoutes } from '../src/lib/ranking';
import { EMPTY_PREFERENCES, type RoutePreferences } from '../src/types/planner';

const NO_PREFS: RoutePreferences = { ...EMPTY_PREFERENCES };

function prefs(overrides: Partial<RoutePreferences>): RoutePreferences {
  return { ...EMPTY_PREFERENCES, ...overrides };
}

function rank(preferences = NO_PREFS, mode: 'walk' | 'cab' | 'mixed' = 'mixed', primary: 'fastest' | 'safest' | 'cleanest' | 'lowest-cost' = 'fastest') {
  const inputs = ROUTES.map((route) => ({ route, totals: computeTotals(route, []) }));
  return rankRoutes(inputs, preferences, mode, primary);
}

const SAFETY_FIRST = prefs({ wellLit: true, avoidNightlife: true });

describe('route ranking', () => {
  it('recommends the safest-fit route for Safety-first with well-lit + avoid nightlife', () => {
    const result = rank(SAFETY_FIRST, 'mixed', 'safest');
    expect(result.recommendedId).toBe('route-safest-fit');
    expect(result.ranked[0].isRecommended).toBe(true);
    expect(result.ranked[0].reasons.length).toBeGreaterThanOrEqual(3);
    expect(result.ranked[0].route.id).toBe('route-safest-fit');
    // All five routes stay visible and ordered.
    expect(result.ranked).toHaveLength(5);
    expect(new Set(result.ranked.map((r) => r.route.id)).size).toBe(5);
  });

  it('selects the 30-minute fixture for the Fastest preference', () => {
    const result = rank(NO_PREFS, 'mixed', 'fastest');
    expect(result.recommendedId).toBe('route-fastest');
    expect(result.ranked[0].route.etaMinutes).toBe(30);
    expect(result.ranked[0].totals.etaMinutes).toBe(30);
  });

  it('exposes the ₹110 route for the Lowest-cost preference', () => {
    const result = rank(NO_PREFS, 'mixed', 'lowest-cost');
    expect(result.recommendedId).toBe('route-best-value');
    expect(result.ranked[0].route.fareInr).toBe(110);
  });

  it('recommends the cleanest route for the Cleanest preference', () => {
    const result = rank(NO_PREFS, 'mixed', 'cleanest');
    expect(result.recommendedId).toBe('route-cleanest');
    expect(result.ranked[0].route.comfort.cleanliness).toBe('excellent');
  });

  it('avoids the nightlife-heavy fastest route when Avoid nightlife clusters is on', () => {
    const withoutChip = rank(NO_PREFS, 'mixed', 'fastest');
    expect(withoutChip.recommendedId).toBe('route-fastest');
    const withChip = rank(prefs({ avoidNightlife: true }), 'mixed', 'fastest');
    expect(withChip.recommendedId).not.toBe('route-fastest');
    expect(withChip.recommendedId).toBe('route-safest-fit');
    expect(withChip.ranked[0].route.safety.nightlifeExposure).toBe('low');
  });

  it('favors covered walking when Avoid rain exposure is on', () => {
    const withChip = rank(prefs({ avoidRain: true }), 'mixed', 'fastest');
    const fastestRoute = ROUTES.find((route) => route.id === 'route-fastest');
    expect(withChip.recommendedId).not.toBe('route-fastest');
    expect(withChip.ranked[0].route.weatherImpact).toBe('low');
    expect(withChip.ranked[0].route.comfort.coveredWalkingMeters).toBeGreaterThan(
      fastestRoute?.comfort.coveredWalkingMeters ?? 0,
    );
  });

  it('keeps the women-focused preset deterministic and preference-based', () => {
    const result = rank(prefs({ womenFocused: true }), 'mixed', 'safest');
    expect(result.recommendedId).toBe('route-safest-fit');
    expect(result.ranked[0].satisfiesAllPreferences).toBe(true);
    expect(result.ranked[0].reasons.join(' ')).toMatch(/Women-focused/);
  });

  it('returns ordered routes with ranks 1..5', () => {
    const result = rank(SAFETY_FIRST, 'mixed', 'safest');
    expect(result.ranked.map((entry) => entry.rank)).toEqual([1, 2, 3, 4, 5]);
  });

  it('gives every route a trade-off sentence with a benefit and a caveat', () => {
    const result = rank(SAFETY_FIRST, 'mixed', 'safest');
    for (const entry of result.ranked) {
      expect(entry.tradeoff).toContain('·');
      expect(entry.caveat.length).toBeGreaterThan(0);
      expect(entry.tradeoff.length).toBeGreaterThan(entry.caveat.length);
    }
  });

  it('shows the demo trade-off lines: 2 min slower, ₹70 cheaper, 50 m more walking', () => {
    const result = rank(SAFETY_FIRST, 'mixed', 'safest');
    const byId = Object.fromEntries(result.ranked.map((entry) => [entry.route.id, entry]));
    expect(byId['route-safest-fit'].tradeoff).toContain('2 min slower');
    expect(byId['route-safest-fit'].tradeoff).toContain('₹70 cheaper');
    // The "walk 50 m more / save ₹70" line belongs to the best-value route
    // when it is compared against the recommended safest-fit pick.
    expect(byId['route-best-value'].tradeoff).toContain('50 m');
    expect(byId['route-best-value'].tradeoff).toContain('₹70');
  });

  it('reports no perfect match only when no route satisfies every active chip', () => {
    const satisfiable = rank(prefs({ avoidRain: true, wellLit: true }), 'mixed', 'safest');
    expect(satisfiable.noPerfectMatch).toBeNull();

    const impossible = rank(prefs({ avoidRain: true, reduceWalking: true }), 'mixed', 'fastest');
    expect(impossible.noPerfectMatch).not.toBeNull();
    expect(impossible.noPerfectMatch?.message).toBe(
      'No route matches every preference. Relax one preference to see the closest options.',
    );
    expect(impossible.noPerfectMatch?.suggestions.length).toBeGreaterThan(0);
    for (const entry of impossible.ranked) {
      expect(entry.satisfiesAllPreferences).toBe(false);
    }
    // Relaxing either chip must leave at least one matching route.
    for (const suggestion of impossible.noPerfectMatch?.suggestions ?? []) {
      expect(suggestion.wouldMatchCount).toBeGreaterThan(0);
    }
  });

  it('recomputes totals with a stop while keeping the same recommendation', () => {
    const inputs = ROUTES.map((route) => ({
      route,
      totals: computeTotals(route, ['place-greencare-pharmacy']),
    }));
    const result = rankRoutes(inputs, SAFETY_FIRST, 'mixed', 'safest');
    const safest = result.ranked.find((entry) => entry.route.id === 'route-safest-fit');
    expect(safest?.totals.etaMinutes).toBe(38);
    expect(safest?.totals.walkingMeters).toBe(620);
    expect(result.recommendedId).toBe('route-safest-fit');
  });

  it('never claims guaranteed safety anywhere in the explanations', () => {
    for (const primary of ['fastest', 'safest', 'cleanest', 'lowest-cost'] as const) {
      const result = rank(NO_PREFS, 'mixed', primary);
      const copy = result.ranked
        .flatMap((entry) => [...entry.reasons, entry.tradeoff, entry.caveat])
        .join(' ')
        .toLowerCase();
      expect(copy).not.toContain('guaranteed');
      expect(copy).not.toContain('crime-free');
      expect(copy).not.toContain('100% safe');
    }
  });

  it('does not display a fabricated safety percentage', () => {
    const result = rank(SAFETY_FIRST, 'mixed', 'safest');
    for (const entry of result.ranked) {
      const copy = [...entry.reasons, entry.tradeoff].join(' ');
      // Lighting/populated percentages come from fixtures and are allowed;
      // a generic "safety score" is not.
      expect(copy.toLowerCase()).not.toContain('safety score');
    }
  });
});
