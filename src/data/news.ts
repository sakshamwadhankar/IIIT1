import type { NewsFixture } from '../types/evidence';

/**
 * Fictional local updates. Restrained, calm, timestamped, and explicitly
 * labelled as sample/demo items. Never alarming.
 */
export const NEWS_FIXTURES: NewsFixture[] = [
  {
    id: 'streetlight',
    title: 'Streetlight maintenance near Market Road',
    summary: 'May affect visibility between 8:00–10:00 PM.',
    affectsWindow: '8:00–10:00 PM today',
    publishedAt: 'Today, 6:40 PM',
    sourceLabel: 'City bulletin (sample)',
    severity: 'caution',
    whyItMatters: 'Routes that pass Market Road may cross this stretch during the maintenance window.',
    routeIds: ['route-fastest', 'route-best-value', 'route-balanced'],
    demoOnly: true,
  },
  {
    id: 'footpath',
    title: 'Footpath repaving completed near College Road',
    summary: 'The improved sidewalk reopened this afternoon.',
    publishedAt: 'Today, 5:15 PM',
    sourceLabel: 'City bulletin (sample)',
    severity: 'info',
    whyItMatters: 'A better sidewalk surface for the walking segments of routes that use College Road.',
    routeIds: ['route-safest-fit', 'route-cleanest'],
    demoOnly: true,
  },
];
