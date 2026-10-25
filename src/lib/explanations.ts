import type { DemoRoute, RouteTotals } from '../types/route';
import type { RoutePreferences } from '../types/planner';
import { PREFERENCE_CHIPS } from '../data/preferences';
import { formatFare } from './formatters';

/**
 * Human-readable explanations built from fixture fields. Copy is calm and
 * preference-based: "safest fit", never "guaranteed safe"; nightlife
 * avoidance is a routing preference, not a claim about venues.
 */

export type ExplanationReference = {
  label: string;
  fareInr: number;
};

export type ExplanationInput = {
  route: DemoRoute;
  totals: RouteTotals;
  rank: number;
  isRecommended: boolean;
  fastestEta: number;
  directFareInr: number;
  /** The recommended route, when this route is not the recommendation. */
  reference: ExplanationReference | null;
  preferences: RoutePreferences;
};

export type Explanation = {
  reasons: string[];
  tradeoff: string;
  caveat: string;
};

const BENEFIT_BY_LABEL: Record<string, string> = {
  'safest-fit': 'Better-lit and more populated',
  fastest: 'Fastest option',
  cleanest: 'Cleaner and more comfortable',
  'best-value': 'Lowest fare',
  balanced: 'No major weakness',
};

function dedupe(parts: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of parts) {
    const key = part.trim().toLowerCase().replace(/\.+$/, '');
    if (key && !seen.has(key)) {
      seen.add(key);
      out.push(part.trim());
    }
  }
  return out;
}

function buildReasons(input: ExplanationInput): string[] {
  const { route, preferences } = input;
  const candidates: string[] = [];

  // Preference matches first — the recommendation should reflect the user.
  for (const chip of PREFERENCE_CHIPS) {
    if (!preferences[chip.key]) continue;
    const satisfied = matchesChip(route, chip.key);
    if (satisfied) {
      candidates.push(`Fits your “${chip.label}” preference.`);
    }
    if (candidates.length >= 2) break;
  }

  if (route.safety.lightingPercent >= 80) {
    candidates.push(
      `${route.safety.lightingPercent}% of the walking is on well-lit segments (area survey).`,
    );
  } else {
    candidates.push(
      `Lighting coverage is ${route.safety.lightingPercent}% — lower than other options in this set.`,
    );
  }

  if (route.safety.populatedPercent >= 70) {
    candidates.push(`${route.safety.populatedPercent}% of segments stay populated in the evening.`);
  } else {
    candidates.push(
      `Populated-segment coverage is ${route.safety.populatedPercent}% — quieter stretches included.`,
    );
  }

  if (route.safety.nightlifeExposure === 'low') {
    candidates.push('Low nightlife exposure along the whole route.');
  } else if (route.safety.nightlifeExposure === 'medium') {
    candidates.push('Passes some nightlife-heavy stretches (medium exposure).');
  } else {
    candidates.push('Passes one nightlife-heavy segment.');
  }

  if (route.safety.incidentTrend === 'lower') {
    candidates.push(
      'Fewer reported incidents than the previous 30-day baseline in this corridor (area-level, not a prediction).',
    );
  }

  if (route.comfort.coveredWalkingMeters >= 200) {
    candidates.push(
      `Keeps ${route.comfort.coveredWalkingMeters} m of the walk under cover during the 8:00 PM rain window.`,
    );
  }

  if (input.directFareInr - input.totals.fareInr >= 40) {
    candidates.push(
      `${formatFare(input.directFareInr - input.totals.fareInr)} cheaper than the direct cab option.`,
    );
  }

  if (route.comfort.cleanliness === 'excellent') {
    candidates.push('Excellent sidewalk quality in the area civic survey.');
  } else if (route.comfort.cleanliness === 'good') {
    candidates.push('Good sidewalk quality in the area civic survey.');
  } else if (route.comfort.cleanliness === 'fair') {
    candidates.push('Sidewalk quality is fair along parts of this route.');
  }

  if (route.traffic === 'light') {
    candidates.push('Light traffic on this corridor right now.');
  } else if (route.traffic === 'moderate') {
    candidates.push('Moderate traffic near Market Road.');
  }

  return candidates.slice(0, 5);
}

function matchesChip(route: DemoRoute, key: string): boolean {
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
      return false;
  }
}

function buildDeltas(input: ExplanationInput): string[] {
  const { route, totals, directFareInr, reference } = input;
  const deltas: string[] = [];

  if (route.lastLegExtraWalkingMeters > 0) {
    deltas.push(`walk ${route.lastLegExtraWalkingMeters} m more in the final stretch`);
  }

  if (reference) {
    const saved = reference.fareInr - totals.fareInr;
    if (saved >= 40) {
      deltas.push(`${formatFare(saved)} less than the ${reference.label} pick`);
    }
  } else if (directFareInr - totals.fareInr >= 70) {
    deltas.push(`${formatFare(directFareInr - totals.fareInr)} cheaper than the direct cab`);
  }

  const timeDelta = totals.etaMinutes - input.fastestEta;
  if (timeDelta > 0) {
    deltas.push(`${timeDelta} min slower than the fastest option`);
  } else if (timeDelta === 0 && route.label === 'fastest') {
    deltas.push('quickest arrival in this set');
  }

  return deltas.slice(0, 2);
}

function buildCaveat(input: ExplanationInput): string[] {
  const { route, totals } = input;
  const caveats: string[] = [];

  if (route.confidence === 'limited') {
    caveats.push('Limited evidence for this route right now.');
  }
  if (route.walkingMeters >= 1000) {
    caveats.push(`${route.walkingMeters} m of walking — the longest in this set.`);
  }
  if (route.safety.nightlifeExposure === 'high') {
    caveats.push('Passes one nightlife-heavy segment.');
  }
  if (route.traffic === 'moderate') {
    caveats.push('Moderate traffic near Market Road.');
  }
  if (route.comfort.construction) {
    caveats.push('Construction reported along part of this route.');
  }
  if (caveats.length === 0) {
    const timeDelta = totals.etaMinutes - input.fastestEta;
    if (timeDelta > 0) {
      caveats.push(`${timeDelta} min slower than the fastest option.`);
    } else {
      caveats.push('No major caveats for this route.');
    }
  }
  return caveats.slice(0, 2);
}

export function buildExplanation(input: ExplanationInput): Explanation {
  const benefit = BENEFIT_BY_LABEL[input.route.label] ?? 'A different balance of trade-offs';
  const deltas = buildDeltas(input);
  const caveats = buildCaveat(input);
  const tradeoff = dedupe([benefit, ...deltas, ...caveats]).join(' · ');
  return {
    reasons: buildReasons(input),
    tradeoff,
    caveat: caveats.join(' · '),
  };
}
