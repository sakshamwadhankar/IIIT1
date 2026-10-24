import type { Confidence } from './route';

export type EvidenceKind =
  | 'traffic'
  | 'weather'
  | 'incident-trend'
  | 'news'
  | 'cleanliness'
  | 'reputation';

export type Severity = 'info' | 'caution' | 'warning';

/**
 * A single time-dependent-looking signal. Everything is synthetic demo data;
 * every item carries a fictional source label and a timestamp or period.
 */
export type EvidenceItem = {
  id: string;
  kind: EvidenceKind;
  title: string;
  summary: string;
  /** Fictional source, always labelled Demo, Synthetic, or Sample. */
  sourceLabel: string;
  /** Display timestamp, e.g. "7:12 PM today" or "Surveyed yesterday". */
  observedAt: string;
  /** Coverage period for period-based signals, e.g. "Last 30 days". */
  period?: string;
  /** Short freshness phrase, e.g. "Updated 8 min ago". */
  freshnessLabel: string;
  confidence: Confidence;
  severity?: Severity;
  routeIds: string[];
  demoOnly: true;
};

export type WeatherFixture = {
  id: string;
  summary: string;
  detail: string;
  rainWindow: string;
  probabilityPercent: number;
  intensityBand: 'light' | 'moderate' | 'heavy';
  issuedAt: string;
  sourceLabel: string;
  confidence: Confidence;
  demoOnly: true;
};

export type NewsFixture = {
  id: string;
  title: string;
  summary: string;
  affectsWindow?: string;
  publishedAt: string;
  sourceLabel: string;
  severity: Severity;
  whyItMatters: string;
  routeIds: string[];
  demoOnly: true;
};

export type IncidentTrendFixture = {
  id: string;
  direction: 'lower' | 'baseline' | 'higher';
  summary: string;
  scopeNote: string;
  period: string;
  weeklyCounts: number[];
  baselineCount: number;
  sourceLabel: string;
  confidence: Confidence;
  routeIds: string[];
  demoOnly: true;
};

export type CleanlinessFixture = {
  id: string;
  corridorName: string;
  rating: 'poor' | 'fair' | 'good' | 'excellent';
  surveyedAt: string;
  note: string;
  sourceLabel: string;
  routeIds: string[];
  demoOnly: true;
};

/** Reputation badge. Premium means comfort, never safety. */
export type ReputationBadge = 'trusted' | 'premium' | 'safety-supporting';

export type ReputationFixture = {
  id: string;
  placeId: string;
  placeName: string;
  badges: ReputationBadge[];
  rating: number;
  summary: string;
  safetyContext: string;
  verifiedAt: string;
  staffed: boolean;
  openUntil: string;
  sourceLabel: string;
  demoOnly: true;
};
