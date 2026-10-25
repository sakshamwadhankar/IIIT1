import type { EvidenceItem } from '../types/evidence';

/**
 * Synthetic traffic evidence for the demo corridor, including one
 * deliberately stale item so the stale-data state can be demonstrated.
 */
export const TRAFFIC_EVIDENCE: EvidenceItem[] = [
  {
    id: 'ev-traffic-100ft',
    kind: 'traffic',
    title: 'Moderate congestion near 100 Feet Road',
    summary: 'Cab speeds are 10–15% below free-flow between 7:15 and 7:45 PM.',
    sourceLabel: 'City traffic feed (sample)',
    observedAt: '7:12 PM today',
    freshnessLabel: 'Updated 8 min ago',
    confidence: 'medium',
    severity: 'info',
    routeIds: ['route-fastest', 'route-balanced'],
    demoOnly: true,
  },
  {
    id: 'ev-traffic-market',
    kind: 'traffic',
    title: 'Slow cab pickups near Market Road',
    summary: 'Average pickup wait is 5–8 minutes around the Market Road stands.',
    sourceLabel: 'City traffic feed (sample)',
    observedAt: '7:10 PM today',
    freshnessLabel: 'Updated 10 min ago',
    confidence: 'medium',
    severity: 'info',
    routeIds: ['route-best-value', 'route-balanced'],
    demoOnly: true,
  },
  {
    id: 'ev-traffic-lit-ave',
    kind: 'traffic',
    title: 'Light traffic along the College Road corridor',
    summary: 'Traffic is flowing close to free-flow on the lit loop.',
    sourceLabel: 'City traffic feed (sample)',
    observedAt: '7:12 PM today',
    freshnessLabel: 'Updated 8 min ago',
    confidence: 'high',
    severity: 'info',
    routeIds: ['route-safest-fit'],
    demoOnly: true,
  },
  {
    id: 'ev-traffic-riverside',
    kind: 'traffic',
    title: 'Quiet footpath along the riverside stretch',
    summary: 'Few pedestrians reported; the path is open with no construction.',
    sourceLabel: 'Footpath sensors (sample)',
    observedAt: '7:05 PM today',
    freshnessLabel: 'Updated 15 min ago',
    confidence: 'limited',
    severity: 'info',
    routeIds: ['route-cleanest'],
    demoOnly: true,
  },
  {
    id: 'ev-traffic-market-stale',
    kind: 'traffic',
    title: 'Market Road congestion pattern (yesterday)',
    summary:
      'Yesterday evening showed heavy congestion from 7:30 PM. Today’s feed for this stretch has not refreshed yet.',
    sourceLabel: 'City traffic feed (sample)',
    observedAt: 'Yesterday, 7:40 PM',
    freshnessLabel: 'Stale · last refreshed yesterday',
    confidence: 'limited',
    severity: 'caution',
    routeIds: ['route-best-value'],
    demoOnly: true,
  },
];
