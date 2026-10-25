import type { IncidentTrendFixture } from '../types/evidence';

/**
 * Synthetic incident-trend fixture. Area-level context only — never a
 * prediction for an individual journey. Confidence is deliberately
 * 'limited' and the scope note is always shown.
 */
export const INCIDENT_TREND_FIXTURE: IncidentTrendFixture = {
  id: 'trend-demo-corridor',
  direction: 'lower',
  summary: 'Fewer reported incidents than the previous 30-day baseline',
  scopeNote:
    'Area-level context for the demo corridor. Not a prediction for any individual journey.',
  period: 'Last 30 days',
  weeklyCounts: [12, 11, 10, 9, 8, 7],
  baselineCount: 11,
  sourceLabel: 'Safety summary (sample)',
  confidence: 'limited',
  routeIds: [
    'route-safest-fit',
    'route-fastest',
    'route-cleanest',
    'route-best-value',
    'route-balanced',
  ],
  demoOnly: true,
};
