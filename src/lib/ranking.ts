import type {
  DemoRoute,
  RouteLabel,
  RouteRankingResult,
  RouteTotals,
  RankedRoute,
  NoPerfectMatchInfo,
  RelaxSuggestion,
} from '../types/route';
import type {
  PreferenceKey,
  RoutePreferences,
  PrimaryPreference,
  TravelMode,
} from '../types/planner';
import { PREFERENCE_CHIPS, PREFERENCE_SUMMARY_LABEL } from '../data/preferences';
import { buildExplanation } from './explanations';

/**
 * Local deterministic ranking. This exists to make the demo respond to
 * preferences — it is NOT a real safety model and produces no "objective
 * safety score". Raw weighted scores are never displayed to users.
 */

export type RouteRankingInput = {
  route: DemoRoute;
  totals: RouteTotals;
};

/** Base preference weights (TRD §8.2). */
const PREFERENCE_WEIGHTS: Record<
  PrimaryPreference,
  { time: number; safety: number; cost: number; comfort: number }
> = {
  fastest: { time: 0.7, safety: 0.1, cost: 0.1, comfort: 0.1 },
  safest: { time: 0.15, safety: 0.55, cost: 0.1, comfort: 0.2 },
  cleanest: { time: 0.15, safety: 0.2, cost: 0.1, comfort: 0.55 },
  'lowest-cost': { time: 0.15, safety: 0.15, cost: 0.6, comfort: 0.1 },
};

/** Travel mode nudges the weights; every route stays visible. */
const MODE_WEIGHT_ADJUSTMENTS: Record<TravelMode, Partial<{ time: number; safety: number; cost: number; comfort: number }>> = {
  walk: { time: -0.06, safety: 0.06, cost: -0.06, comfort: 0.06 },
  cab: { time: 0.04, safety: -0.06, cost: 0.08, comfort: -0.06 },
  mixed: {},
};

/** Each enabled chip contributes this much weight to its own sub-score. */
const CHIP_WEIGHT = 0.15;

/* ---------- factor sub-scores (0..1, higher is better) ---------- */

function normalize(value: number, min: number, max: number): number {
  if (max === min) return 1;
  return 1 - (value - min) / (max - min);
}

const CLEANLINESS_SCORE: Record<string, number> = {
  excellent: 1,
  good: 0.8,
  fair: 0.5,
  poor: 0.2,
};

const NIGHTLIFE_SCORE: Record<string, number> = { low: 1, medium: 0.5, high: 0 };
const INCIDENT_SCORE: Record<string, number> = { lower: 1, baseline: 0.6, higher: 0.2 };
const WEATHER_IMPACT_SCORE: Record<string, number> = { low: 1, medium: 0.5, high: 0 };

export function coveredRatio(route: DemoRoute): number {
  return Math.min(1, route.comfort.coveredWalkingMeters / Math.max(route.walkingMeters, 1));
}

function safetyFactor(route: DemoRoute): number {
  return (
    0.4 * (route.safety.lightingPercent / 100) +
    0.3 * (route.safety.populatedPercent / 100) +
    0.2 * (NIGHTLIFE_SCORE[route.safety.nightlifeExposure] ?? 0.5) +
    0.1 * (INCIDENT_SCORE[route.safety.incidentTrend] ?? 0.6)
  );
}

function comfortFactor(route: DemoRoute): number {
  return (
    0.55 * (CLEANLINESS_SCORE[route.comfort.cleanliness] ?? 0.5) +
    0.2 * (1 - route.comfort.crossings / 6) +
    0.1 * (route.comfort.construction ? 0 : 1) +
    0.15 * coveredRatio(route)
  );
}

export function chipScores(
  route: DemoRoute,
  extents: { minWalk: number; maxWalk: number },
): Record<PreferenceKey, number> {
  const lighting = route.safety.lightingPercent / 100;
  const populated = route.safety.populatedPercent / 100;
  const nightlife = NIGHTLIFE_SCORE[route.safety.nightlifeExposure] ?? 0.5;
  const weather =
    0.6 * (WEATHER_IMPACT_SCORE[route.weatherImpact] ?? 0.5) + 0.4 * coveredRatio(route);
  return {
    wellLit: lighting,
    populated,
    avoidNightlife: nightlife,
    reduceWalking: normalize(route.walkingMeters, extents.minWalk, extents.maxWalk),
    avoidRain: weather,
    womenFocused: 0.45 * lighting + 0.35 * populated + 0.2 * nightlife,
  };
}

/* ---------- hard requirements for the no-perfect-match check ---------- */

/**
 * Fixture-level matching rules behind each chip. These are preference
 * matching conditions on demo data — never safety measurements.
 */
export function satisfiesHardRequirement(route: DemoRoute, key: PreferenceKey): boolean {
  switch (key) {
    case 'wellLit':
      return route.safety.lightingPercent >= 80;
    case 'populated':
      return route.safety.populatedPercent >= 70;
    case 'avoidNightlife':
      return route.safety.nightlifeExposure === 'low';
    case 'reduceWalking':
      return route.walkingMeters <= 400;
    case 'avoidRain':
      return route.weatherImpact === 'low';
    case 'womenFocused':
      return route.safety.lightingPercent >= 80 && route.safety.populatedPercent >= 70;
    default:
      return true;
  }
}

function activeHardChips(preferences: RoutePreferences): PreferenceKey[] {
  return PREFERENCE_CHIPS.filter((chip) => preferences[chip.key]).map((chip) => chip.key);
}

function satisfiesAll(route: DemoRoute, keys: PreferenceKey[]): boolean {
  return keys.every((key) => satisfiesHardRequirement(route, key));
}

/* ---------- main entry ---------- */

export function rankRoutes(
  inputs: RouteRankingInput[],
  preferences: RoutePreferences,
  mode: TravelMode,
  primaryPreference: PrimaryPreference,
): RouteRankingResult {
  if (inputs.length === 0) {
    return { ranked: [], recommendedId: null, noPerfectMatch: null };
  }

  const etas = inputs.map((input) => input.totals.etaMinutes);
  const fares = inputs.map((input) => input.totals.fareInr);
  const walks = inputs.map((input) => input.route.walkingMeters);
  const extents = {
    minEta: Math.min(...etas),
    maxEta: Math.max(...etas),
    minFare: Math.min(...fares),
    maxFare: Math.max(...fares),
    minWalk: Math.min(...walks),
    maxWalk: Math.max(...walks),
  };

  const base = { ...PREFERENCE_WEIGHTS[primaryPreference] };
  const modeAdjustment = MODE_WEIGHT_ADJUSTMENTS[mode];
  const weights = {
    time: Math.max(0, base.time + (modeAdjustment.time ?? 0)),
    safety: Math.max(0, base.safety + (modeAdjustment.safety ?? 0)),
    cost: Math.max(0, base.cost + (modeAdjustment.cost ?? 0)),
    comfort: Math.max(0, base.comfort + (modeAdjustment.comfort ?? 0)),
  };
  const activeChips = activeHardChips(preferences);
  const chipWeightTotal = activeChips.length * CHIP_WEIGHT;
  const totalWeight = weights.time + weights.safety + weights.cost + weights.comfort + chipWeightTotal;

  const scored = inputs.map((input, index) => {
    const { route, totals } = input;
    const timeScore = normalize(totals.etaMinutes, extents.minEta, extents.maxEta);
    const costScore = normalize(totals.fareInr, extents.minFare, extents.maxFare);
    const weighted =
      weights.time * timeScore +
      weights.safety * safetyFactor(route) +
      weights.cost * costScore +
      weights.comfort * comfortFactor(route);
    const chips = chipScores(route, extents);
    const chipTotal = activeChips.reduce((sum, key) => sum + CHIP_WEIGHT * chips[key], 0);
    const score = (weighted + chipTotal) / totalWeight;
    return { input, index, score };
  });

  scored.sort((a, b) => b.score - a.score || a.index - b.index);

  const fastestEta = extents.minEta;
  const directFareInr = Math.max(...fares);
  const recommended = scored[0];

  const ranked: RankedRoute[] = scored.map((entry, position) => {
    const { route, totals } = entry.input;
    const isRecommended = position === 0;
    const explanation = buildExplanation({
      route,
      totals,
      rank: position + 1,
      isRecommended,
      fastestEta,
      directFareInr,
      reference: isRecommended
        ? null
        : {
            label: ROUTE_LABEL_SUMMARY[recommended.input.route.label],
            fareInr: recommended.input.totals.fareInr,
          },
      preferences,
    });
    return {
      route,
      totals,
      rank: position + 1,
      isRecommended,
      reasons: explanation.reasons,
      tradeoff: explanation.tradeoff,
      caveat: explanation.caveat,
      satisfiesAllPreferences: satisfiesAll(route, activeChips),
    };
  });

  const noPerfectMatch = buildNoPerfectMatch(inputs, activeChips);

  return {
    ranked,
    recommendedId: recommended.input.route.id,
    noPerfectMatch,
  };
}

const ROUTE_LABEL_SUMMARY: Record<RouteLabel, string> = {
  'safest-fit': 'Safest fit',
  fastest: 'Fastest',
  cleanest: 'Cleanest',
  'best-value': 'Best value',
  balanced: 'Balanced',
};

export function routeLabelTitle(label: RouteLabel): string {
  return ROUTE_LABEL_SUMMARY[label];
}

function buildNoPerfectMatch(
  inputs: RouteRankingInput[],
  activeChips: PreferenceKey[],
): NoPerfectMatchInfo | null {
  if (activeChips.length === 0) return null;
  const anySatisfies = inputs.some((input) => satisfiesAll(input.route, activeChips));
  if (anySatisfies) return null;

  const suggestions: RelaxSuggestion[] = [];
  for (const chip of PREFERENCE_CHIPS) {
    if (!activeChips.includes(chip.key)) continue;
    const remaining = activeChips.filter((key) => key !== chip.key);
    const matchCount = inputs.filter((input) => satisfiesAll(input.route, remaining)).length;
    if (matchCount > 0) {
      suggestions.push({ key: chip.key, label: chip.label, wouldMatchCount: matchCount });
    }
  }
  suggestions.sort((a, b) => b.wouldMatchCount - a.wouldMatchCount);

  return {
    message: 'No route matches every preference. Relax one preference to see the closest options.',
    suggestions,
  };
}

export function preferenceSummaryLabel(preferences: RoutePreferences, primary: PrimaryPreference): string {
  const chips = activeHardChips(preferences);
  if (chips.length === 0) return PREFERENCE_SUMMARY_LABEL[primary];
  const chipLabels = PREFERENCE_CHIPS.filter((chip) => preferences[chip.key]).map(
    (chip) => chip.label.replace('Prefer ', '').replace(' preferences', ''),
  );
  return `${PREFERENCE_SUMMARY_LABEL[primary]} · ${chipLabels.join(' · ')}`;
}
