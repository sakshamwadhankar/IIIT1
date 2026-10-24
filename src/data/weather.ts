import type { WeatherFixture } from '../types/evidence';

/**
 * Synthetic weather fixtures for the demo. The rain window (8:00–8:40 PM)
 * is about 40 minutes after the fixed demo clock (7:20 PM).
 */
export const WEATHER_FIXTURES: WeatherFixture[] = [
  {
    id: 'wx-rain-window',
    summary: 'Light rain likely between 8:00 and 8:40 PM',
    detail:
      'Light showers may begin about 40 minutes after the demo clock. Each route shows its own carried rain exposure and covered walking distance.',
    rainWindow: '8:00–8:40 PM today',
    probabilityPercent: 65,
    intensityBand: 'light',
    issuedAt: 'Forecast issued 7:00 PM today',
    sourceLabel: 'Synthetic weather forecast',
    confidence: 'medium',
    demoOnly: true,
  },
];

/** Which routes pass which covered stretches (used for rain-aware copy). */
export const COVERED_STRETCHES = [
  {
    id: 'cover-college-metro',
    title: '280–320 m of the walk can stay under cover',
    detail:
      'College Road arcades and the metro approach provide continuous cover on the lit loop and the riverside walk.',
    routeIds: ['route-safest-fit', 'route-cleanest'],
    demoOnly: true as const,
  },
];
