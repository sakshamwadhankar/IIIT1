/**
 * The fixed demo trip. All timestamps in Raah are relative to this fixed
 * demo clock (7:20 PM), never the real system clock.
 */
export const DEMO_CLOCK = '7:20 PM';
export const DEMO_DATE_LABEL = 'Today';

export const DEMO_TRIP = {
  /** Fictional detected context shown on the context handoff sheet. */
  detectedContext: {
    sentence: 'Looks like you’re walking from North Campus Library.',
    detail: 'Detected building-to-street context · A suggestion, not GPS.',
    originId: 'place-north-campus-library',
  },
  /** Destination used in the primary demo scenario. */
  recommendedDestinationId: 'place-indiranagar-metro-gate-3',
  recentDestinationIds: ['place-indiranagar-metro-gate-3', 'place-central-market', 'place-home-demo'],
  /** Optional trip purposes offered in trip setup. */
  tripPurposes: ['Home', 'Work', 'College', 'Errand', 'Other'],
  scenario:
    'Demo scenario: 7:20 PM, leaving North Campus Library toward Indiranagar Metro Gate 3. Rain is possible after 8:00 PM.',
  demoOnly: true as const,
};
