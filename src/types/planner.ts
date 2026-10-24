import type { MapPoint } from './route';

/** Travel modes supported by the planner. */
export type TravelMode = 'walk' | 'cab' | 'mixed';

/** Leading preference the user picks in trip setup. */
export type PrimaryPreference = 'fastest' | 'safest' | 'cleanest' | 'lowest-cost';

/** Optional preference chips. */
export type PreferenceKey =
  | 'wellLit'
  | 'populated'
  | 'avoidNightlife'
  | 'reduceWalking'
  | 'avoidRain'
  | 'womenFocused';

export type RoutePreferences = Record<PreferenceKey, boolean>;

/** Top-level planner screens. */
export type PlannerView = 'planner' | 'comparison' | 'pre-start' | 'active-preview';

/** Overlay panels that can open above the current view. */
export type OpenPanel = 'none' | 'evidence' | 'stop-search' | 'install-help';

export type ComparisonStatus = 'idle' | 'comparing' | 'ready';

export type OriginSource = 'detected' | 'manual';

/**
 * Full planner state. All interactions are deterministic and local;
 * `demoClock` is a fixed demo timestamp, not the real clock.
 */
export type PlannerState = {
  originId: string | null;
  originSource: OriginSource | null;
  /** Detected-context suggestion before the user confirms or dismisses it. */
  contextSuggestionId: string | null;
  contextDismissed: boolean;
  destinationId: string | null;
  stopIds: string[];
  mode: TravelMode;
  primaryPreference: PrimaryPreference;
  preferences: RoutePreferences;
  selectedRouteId: string | null;
  activeView: PlannerView;
  openPanel: OpenPanel;
  comparisonStatus: ComparisonStatus;
  /** Evidence for the route currently shown in the drawer. */
  evidenceRouteId: string | null;
  /** Fixed demo time, e.g. "7:20 PM". Never the real clock. */
  demoClock: string;
  /** Most recently removed stop, kept for the Undo affordance. */
  lastRemovedStop: { placeId: string; index: number } | null;
  /** Message announced to assistive technology after state changes. */
  announcement: string | null;
};

export const EMPTY_PREFERENCES: RoutePreferences = {
  wellLit: false,
  populated: false,
  avoidNightlife: false,
  reduceWalking: false,
  avoidRain: false,
  womenFocused: false,
};

export type PlaceCategory =
  | 'origin'
  | 'destination'
  | 'pharmacy'
  | 'cafe'
  | 'pickup'
  | 'public-place'
  | 'other';

export type PlaceBadge = 'trusted' | 'premium' | 'safety-supporting';

/**
 * A local demo place: the origin, destinations, and optional stops.
 * All places are fictional; detours are deterministic fixtures.
 */
export type DemoPlace = {
  id: string;
  name: string;
  category: PlaceCategory;
  /** Shown for stops, e.g. "10:00 PM". */
  openUntil?: string;
  reputation?: number;
  staffed?: boolean;
  /** One-line safety-supporting context, e.g. "Well-lit entrance". */
  safetySupportingContext?: string;
  badges?: PlaceBadge[];
  /** Detour when the stop is served after the first leg (canonical). */
  detourMinutes?: number;
  /** Detour when the stop is served as the first leg after the origin. */
  detourMinutesEarly?: number;
  detourFareInr?: number;
  detourWalkingMeters?: number;
  mapPoint: MapPoint;
  demoOnly: true;
};
