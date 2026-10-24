import { ROUTES } from '../data/routes';
import { ALL_EVIDENCE, EVIDENCE_MAP } from '../data/evidence';
import { PLACES, PLACE_MAP, DESTINATION_SUGGESTION_IDS, STOP_SUGGESTION_IDS } from '../data/places';
import { DEMO_TRIP, DEMO_CLOCK } from '../data/demo-trip';

/**
 * Structural integrity checks for the local fixtures. Used by the test
 * suite (and available in dev) so route cards, map overlays, and evidence
 * never drift out of sync.
 */
export type ValidationIssue = string;

export function validateFixtures(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Route IDs are unique.
  const routeIds = ROUTES.map((route) => route.id);
  if (new Set(routeIds).size !== routeIds.length) {
    issues.push('Duplicate route ids found.');
  }

  // Every evidence ID referenced by a route exists.
  for (const route of ROUTES) {
    for (const evidenceId of route.evidenceIds) {
      if (!EVIDENCE_MAP[evidenceId]) {
        issues.push(`Route ${route.id} references missing evidence id ${evidenceId}.`);
      }
    }
    if (route.evidenceIds.length < 3) {
      issues.push(`Route ${route.id} has fewer than 3 evidence items.`);
    }
    if (route.mapPath.length < 3) {
      issues.push(`Route ${route.id} mapPath is too short for a schematic line.`);
    }
    if (route.steps.length < 2) {
      issues.push(`Route ${route.id} needs at least 2 preview steps.`);
    }
    // Calm, preference-based language only.
    if (/guaranteed|crime-free|100% safe/i.test(`${route.name} ${route.viaSummary}`)) {
      issues.push(`Route ${route.id} name makes an absolute safety claim.`);
    }
  }

  // All routes share the schematic endpoints (origin/destination markers).
  const first = ROUTES[0]?.mapPath[0];
  const last = ROUTES[0]?.mapPath[ROUTES[0].mapPath.length - 1];
  for (const route of ROUTES) {
    const start = route.mapPath[0];
    const end = route.mapPath[route.mapPath.length - 1];
    if (!first || !last || start.x !== first.x || start.y !== first.y || end.x !== last.x || end.y !== last.y) {
      issues.push(`Route ${route.id} does not share the shared schematic endpoints.`);
    }
  }

  // Every evidence item is demo-labelled and has a time reference.
  for (const item of ALL_EVIDENCE) {
    if (!/(Demo|Synthetic|Sample)/i.test(item.sourceLabel)) {
      issues.push(`Evidence ${item.id} source label is missing a Demo/Synthetic/Sample marker.`);
    }
    if (!item.observedAt && !item.period) {
      issues.push(`Evidence ${item.id} has neither observedAt nor period.`);
    }
    if (!item.demoOnly) {
      issues.push(`Evidence ${item.id} must be flagged demoOnly.`);
    }
    if (item.routeIds.length === 0) {
      issues.push(`Evidence ${item.id} is not linked to any route.`);
    }
  }

  // Evidence IDs are unique.
  const evidenceIds = ALL_EVIDENCE.map((item) => item.id);
  if (new Set(evidenceIds).size !== evidenceIds.length) {
    issues.push('Duplicate evidence ids found.');
  }

  // Places: unique ids, stop detours deterministic.
  const placeIds = PLACES.map((place) => place.id);
  if (new Set(placeIds).size !== placeIds.length) {
    issues.push('Duplicate place ids found.');
  }
  for (const place of PLACES) {
    if (place.category !== 'origin' && place.category !== 'destination') {
      if (typeof place.detourMinutes !== 'number' || place.detourMinutes <= 0) {
        issues.push(`Stop place ${place.id} has no deterministic detourMinutes.`);
      }
      if (typeof place.detourMinutesEarly !== 'number') {
        issues.push(`Stop place ${place.id} is missing detourMinutesEarly.`);
      }
      if (typeof place.detourFareInr !== 'number' || typeof place.detourWalkingMeters !== 'number') {
        issues.push(`Stop place ${place.id} is missing detour fare/walking values.`);
      }
    }
  }

  // Suggested places exist.
  for (const id of [...DESTINATION_SUGGESTION_IDS, ...STOP_SUGGESTION_IDS]) {
    if (!PLACE_MAP[id]) {
      issues.push(`Suggestion references missing place id ${id}.`);
    }
  }

  // Demo trip references real places and keeps the fixed clock.
  if (!PLACE_MAP[DEMO_TRIP.detectedContext.originId]) {
    issues.push('Demo trip detected context references a missing place.');
  }
  if (!PLACE_MAP[DEMO_TRIP.recommendedDestinationId]) {
    issues.push('Demo trip recommended destination references a missing place.');
  }
  if (DEMO_CLOCK !== '7:20 PM') {
    issues.push('Demo clock must stay fixed at 7:20 PM for repeatable demos.');
  }

  return issues;
}
