import type { DemoPlace } from '../types/planner';

/**
 * All local demo places: the detected origin, destination suggestions,
 * and optional stop candidates. Every place is fictional and labelled
 * as demo data. Detours are deterministic.
 */
export const PLACES: DemoPlace[] = [
  {
    id: 'place-north-campus-library',
    name: 'North Campus Library',
    category: 'origin',
    safetySupportingContext: 'Lit exit gate on College Road; main street 40 m away.',
    mapPoint: { x: 48, y: 258 },
    demoOnly: true,
  },
  {
    id: 'place-indiranagar-metro-gate-3',
    name: 'Indiranagar Metro Gate 3',
    category: 'destination',
    openUntil: '10:00 PM',
    reputation: 4.5,
    staffed: true,
    safetySupportingContext: 'Staffed ticket counter; lit plaza with active vendors.',
    badges: ['safety-supporting'],
    mapPoint: { x: 352, y: 58 },
    demoOnly: true,
  },
  {
    id: 'place-central-market',
    name: 'Central Market',
    category: 'destination',
    openUntil: '9:00 PM',
    reputation: 4.2,
    staffed: false,
    safetySupportingContext: 'Busy through the evening; crowded entrances after 8:00 PM.',
    mapPoint: { x: 150, y: 120 },
    demoOnly: true,
  },
  {
    id: 'place-home-demo',
    name: 'Home (demo address)',
    category: 'destination',
    safetySupportingContext: 'Sample saved place for the demo; not a real address.',
    mapPoint: { x: 320, y: 244 },
    demoOnly: true,
  },
  {
    id: 'place-office-demo',
    name: 'Office Park (demo)',
    category: 'destination',
    openUntil: '11:00 PM',
    staffed: true,
    safetySupportingContext: 'Security desk at the gate until 11:00 PM.',
    mapPoint: { x: 300, y: 120 },
    demoOnly: true,
  },
  {
    id: 'place-greencare-pharmacy',
    name: 'GreenCare Pharmacy',
    category: 'pharmacy',
    openUntil: '10:00 PM',
    reputation: 4.6,
    staffed: true,
    safetySupportingContext: 'Well-lit entrance on a public road; staffed counter.',
    badges: ['trusted', 'safety-supporting'],
    detourMinutes: 6,
    detourMinutesEarly: 4,
    detourFareInr: 0,
    detourWalkingMeters: 200,
    mapPoint: { x: 150, y: 180 },
    demoOnly: true,
  },
  {
    id: 'place-corner-cafe',
    name: 'Corner Café',
    category: 'cafe',
    openUntil: '11:00 PM',
    reputation: 4.3,
    staffed: true,
    safetySupportingContext: 'Open terrace facing the street; busy until closing.',
    badges: ['premium'],
    detourMinutes: 4,
    detourMinutesEarly: 4,
    detourFareInr: 0,
    detourWalkingMeters: 120,
    mapPoint: { x: 220, y: 150 },
    demoOnly: true,
  },
  {
    id: 'place-main-gate-pickup',
    name: 'Main Gate pickup point',
    category: 'pickup',
    openUntil: '9:30 PM',
    reputation: 4.2,
    staffed: true,
    safetySupportingContext: 'Marshaled pickup bay with lighting and a queue marshal.',
    badges: ['safety-supporting'],
    detourMinutes: 3,
    detourMinutesEarly: 2,
    detourFareInr: 10,
    detourWalkingMeters: 80,
    mapPoint: { x: 100, y: 230 },
    demoOnly: true,
  },
  {
    id: 'place-community-help-desk',
    name: 'Community Help Desk',
    category: 'public-place',
    openUntil: '9:00 PM',
    reputation: 4.5,
    staffed: true,
    safetySupportingContext: 'Staffed public desk; stays open late on weekdays.',
    badges: ['trusted', 'safety-supporting'],
    detourMinutes: 5,
    detourMinutesEarly: 4,
    detourFareInr: 0,
    detourWalkingMeters: 150,
    mapPoint: { x: 260, y: 200 },
    demoOnly: true,
  },
];

export const PLACE_MAP: Record<string, DemoPlace> = Object.fromEntries(
  PLACES.map((place) => [place.id, place]),
);

export function getPlace(placeId: string): DemoPlace {
  const place = PLACE_MAP[placeId];
  if (!place) {
    throw new Error(`Unknown demo place id: ${placeId}`);
  }
  return place;
}

/** Destinations offered in the destination search (order = suggestion order). */
export const DESTINATION_SUGGESTION_IDS = [
  'place-indiranagar-metro-gate-3',
  'place-central-market',
  'place-home-demo',
  'place-office-demo',
];

/** Origin candidates for the origin search. */
export const ORIGIN_SUGGESTION_IDS = [
  'place-north-campus-library',
  'place-central-market',
  'place-office-demo',
];

/** Stop candidates offered by the add-stop panel (order = suggestion order). */
export const STOP_SUGGESTION_IDS = [
  'place-greencare-pharmacy',
  'place-corner-cafe',
  'place-main-gate-pickup',
  'place-community-help-desk',
];
