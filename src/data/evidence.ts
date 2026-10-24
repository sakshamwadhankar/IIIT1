import type { EvidenceItem } from '../types/evidence';
import { TRAFFIC_EVIDENCE } from './traffic';
import { WEATHER_FIXTURES, COVERED_STRETCHES } from './weather';
import { NEWS_FIXTURES } from './news';
import { INCIDENT_TREND_FIXTURE } from './incident-trend';
import { CLEANLINESS_FIXTURES } from './cleanliness';
import { REPUTATION_FIXTURES } from './reputation';
import { ROUTES } from './routes';

/**
 * Aggregated evidence repository. Every item is synthetic demo data with a
 * fictional source label, a timestamp or period, and the routes it applies to.
 */

const ALL_ROUTE_IDS = ROUTES.map((route) => route.id);

function weatherEvidence(): EvidenceItem[] {
  const rain = WEATHER_FIXTURES[0];
  const items: EvidenceItem[] = [
    {
      id: 'ev-weather-rain',
      kind: 'weather',
      title: rain.summary,
      summary: rain.detail,
      sourceLabel: `${rain.sourceLabel} · ${rain.issuedAt}`,
      observedAt: rain.issuedAt,
      period: rain.rainWindow,
      freshnessLabel: `Forecast · ${rain.confidence === 'medium' ? 'medium confidence' : rain.confidence}`,
      confidence: rain.confidence,
      severity: 'caution',
      routeIds: [...ALL_ROUTE_IDS],
      demoOnly: true,
    },
  ];
  for (const stretch of COVERED_STRETCHES) {
    items.push({
      id: 'ev-weather-covered-college',
      kind: 'weather',
      title: stretch.title,
      summary: stretch.detail,
      sourceLabel: 'Synthetic weather forecast · covered-walk survey',
      observedAt: 'Surveyed 7:00 PM today',
      freshnessLabel: 'Updated 20 min ago',
      confidence: 'high',
      severity: 'info',
      routeIds: stretch.routeIds,
      demoOnly: true,
    });
  }
  return items;
}

function newsEvidence(): EvidenceItem[] {
  return NEWS_FIXTURES.map((item) => ({
    id: `ev-news-${item.id}`,
    kind: 'news' as const,
    title: item.title,
    summary: item.affectsWindow ? `${item.summary} Affects ${item.affectsWindow}.` : item.summary,
    sourceLabel: item.sourceLabel,
    observedAt: item.publishedAt,
    freshnessLabel: `Published ${item.publishedAt.toLowerCase()}`,
    confidence: 'medium' as const,
    severity: item.severity,
    routeIds: item.routeIds,
    demoOnly: true,
  }));
}

function incidentTrendEvidence(): EvidenceItem[] {
  const trend = INCIDENT_TREND_FIXTURE;
  return [
    {
      id: 'ev-incident-trend',
      kind: 'incident-trend',
      title: trend.summary,
      summary: `${trend.scopeNote} Weekly reported counts: ${trend.weeklyCounts.join(', ')} against a baseline of ${trend.baselineCount}.`,
      sourceLabel: trend.sourceLabel,
      observedAt: 'Compiled 6:50 PM today',
      period: trend.period,
      freshnessLabel: `Period: ${trend.period.toLowerCase()}`,
      confidence: trend.confidence,
      severity: 'info',
      routeIds: trend.routeIds,
      demoOnly: true,
    },
  ];
}

function cleanlinessEvidence(): EvidenceItem[] {
  return CLEANLINESS_FIXTURES.map((record) => ({
    id: `ev-clean-${record.id}`,
    kind: 'cleanliness' as const,
    title: `Sidewalk cleanliness: ${record.rating} — ${record.corridorName}`,
    summary: `${record.note} ${record.surveyedAt.toLowerCase()}.`,
    sourceLabel: record.sourceLabel,
    observedAt: record.surveyedAt,
    freshnessLabel: record.surveyedAt,
    confidence: 'medium' as const,
    severity: record.rating === 'poor' || record.rating === 'fair' ? 'caution' : 'info',
    routeIds: record.routeIds,
    demoOnly: true,
  }));
}

function reputationEvidence(): EvidenceItem[] {
  return REPUTATION_FIXTURES.map((record) => ({
    id: `ev-rep-${record.id}`,
    kind: 'reputation' as const,
    title: `${record.placeName}: ${record.summary}`,
    summary: `${record.safetyContext} ${record.verifiedAt.toLowerCase()} · ${record.badges.join(', ')} · open until ${record.openUntil}.`,
    sourceLabel: record.sourceLabel,
    observedAt: record.verifiedAt,
    freshnessLabel: record.verifiedAt,
    confidence: 'high' as const,
    severity: 'info' as const,
    routeIds: [...ALL_ROUTE_IDS],
    demoOnly: true,
  }));
}

export const ALL_EVIDENCE: EvidenceItem[] = [
  ...TRAFFIC_EVIDENCE,
  ...weatherEvidence(),
  ...newsEvidence(),
  ...incidentTrendEvidence(),
  ...cleanlinessEvidence(),
  ...reputationEvidence(),
];

export const EVIDENCE_MAP: Record<string, EvidenceItem> = Object.fromEntries(
  ALL_EVIDENCE.map((item) => [item.id, item]),
);

export function getEvidenceByIds(ids: string[]): EvidenceItem[] {
  return ids
    .map((id) => EVIDENCE_MAP[id])
    .filter((item): item is EvidenceItem => Boolean(item));
}

export function getEvidenceForRoute(routeId: string): EvidenceItem[] {
  return getEvidenceByIds(ROUTES.find((route) => route.id === routeId)?.evidenceIds ?? []);
}
