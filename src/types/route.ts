import type { TravelMode } from './planner';

/** Route card label. Describes a choice, never an absolute truth. */
export type RouteLabel = 'safest-fit' | 'fastest' | 'cleanest' | 'best-value' | 'balanced';

export type NightlifeExposure = 'low' | 'medium' | 'high';
export type IncidentTrend = 'lower' | 'baseline' | 'higher';
export type Cleanliness = 'poor' | 'fair' | 'good' | 'excellent';
export type TrafficLevel = 'light' | 'moderate' | 'heavy';
export type WeatherImpact = 'low' | 'medium' | 'high';
export type Confidence = 'high' | 'medium' | 'limited';

/** Point in the schematic map coordinate space (SVG viewBox units). */
export type MapPoint = { x: number; y: number };

/**
 * A local, deterministic demo route. All values are fictional fixtures.
 * `mapPath` coordinates live in the schematic map space (viewBox 0 0 400 300).
 */
export type DemoRoute = {
  id: string;
  label: RouteLabel;
  mode: TravelMode;
  name: string;
  /** Human-readable corridor summary, e.g. "via College Road". */
  viaSummary: string;
  etaMinutes: number;
  distanceKm: number;
  walkingMeters: number;
  fareInr: number;
  /** Minutes slower than the fastest fixture (+N). */
  deltaFromFastestMinutes: number;
  /** Positive means more expensive than the direct cab fixture. */
  deltaFromDirectFareInr: number;
  safety: {
    lightingPercent: number;
    populatedPercent: number;
    nightlifeExposure: NightlifeExposure;
    incidentTrend: IncidentTrend;
  };
  comfort: {
    cleanliness: Cleanliness;
    coveredWalkingMeters: number;
    crossings: number;
    construction: boolean;
  };
  traffic: TrafficLevel;
  weatherImpact: WeatherImpact;
  confidence: Confidence;
  /** Extra walking in the final stretch, used for "50 m more walking" copy. */
  lastLegExtraWalkingMeters: number;
  /** Short turn description used by the active route preview. */
  steps: string[];
  evidenceIds: string[];
  mapPath: MapPoint[];
};

/** Live totals after local stop detours are applied. */
export type RouteTotals = {
  etaMinutes: number;
  fareInr: number;
  walkingMeters: number;
  stopCount: number;
  /** Detour minutes contributed by stops in the current order. */
  stopDetourMinutes: number;
};

/** A route together with the ranked result the UI renders. */
export type RankedRoute = {
  route: DemoRoute;
  totals: RouteTotals;
  rank: number;
  isRecommended: boolean;
  reasons: string[];
  tradeoff: string;
  caveat: string;
  /** True when the route satisfies every enabled hard preference. */
  satisfiesAllPreferences: boolean;
};

export type RelaxSuggestion = {
  key: string;
  label: string;
  /** How many routes would satisfy all remaining preferences. */
  wouldMatchCount: number;
};

export type NoPerfectMatchInfo = {
  message: string;
  suggestions: RelaxSuggestion[];
};

export type RouteRankingResult = {
  ranked: RankedRoute[];
  recommendedId: string | null;
  noPerfectMatch: NoPerfectMatchInfo | null;
};
