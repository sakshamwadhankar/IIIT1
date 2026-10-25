import type { PreferenceKey, PrimaryPreference, TravelMode } from '../types/planner';

/** Travel mode selector options. Mixed is the demo default. */
export const MODE_OPTIONS: Array<{
  id: TravelMode;
  label: string;
  description: string;
}> = [
  {
    id: 'walk',
    label: 'Walk',
    description: 'Emphasizes walking comfort, lighting, crossings, and rain exposure.',
  },
  {
    id: 'cab',
    label: 'Cab',
    description: 'Emphasizes fare, pickup distance, traffic, and arrival time.',
  },
  {
    id: 'mixed',
    label: 'Mixed',
    description: 'Combines walking and cab segments. The default choice.',
  },
];

/** Leading preferences. The UI switches the emphasis, never a hidden formula. */
export const PRIMARY_PREFERENCES: Array<{
  id: PrimaryPreference;
  label: string;
  shortLabel: string;
  description: string;
}> = [
  {
    id: 'fastest',
    label: 'Fastest',
    shortLabel: 'Fastest',
    description: 'Prioritizes the shortest estimated arrival time.',
  },
  {
    id: 'safest',
    label: 'Safest fit',
    shortLabel: 'Safest fit',
    description:
      'Prioritizes lighting, populated segments, and comfort signals. “Safest fit” describes a match for your preferences, not a guarantee.',
  },
  {
    id: 'cleanest',
    label: 'Cleanest',
    shortLabel: 'Cleanest',
    description: 'Prioritizes sidewalk quality, cleanliness, and street comfort.',
  },
  {
    id: 'lowest-cost',
    label: 'Lowest cost',
    shortLabel: 'Lowest cost',
    description: 'Prioritizes the lowest fare, including walking farther to save money.',
  },
];

/**
 * Optional preference chips. `hardRequirement` describes the fixture-level
 * condition a route must meet for the no-perfect-match check; it is a
 * matching rule, not a safety measurement.
 */
export const PREFERENCE_CHIPS: Array<{
  key: PreferenceKey;
  label: string;
  description: string;
  hardRequirement: string;
}> = [
  {
    key: 'wellLit',
    label: 'Prefer well-lit streets',
    description: 'Favors routes with higher lighting coverage.',
    hardRequirement: 'at least 80% lighting coverage',
  },
  {
    key: 'populated',
    label: 'Prefer populated streets',
    description: 'Favors routes that stay on populated, active segments.',
    hardRequirement: 'at least 70% populated segments',
  },
  {
    key: 'avoidNightlife',
    label: 'Avoid nightlife clusters',
    description:
      'A routing preference only. Passing fewer nightlife-heavy segments — not a claim about any venue or area.',
    hardRequirement: 'low nightlife exposure',
  },
  {
    key: 'reduceWalking',
    label: 'Reduce walking',
    description: 'Favors routes with shorter walking distance.',
    hardRequirement: '400 m of walking or less',
  },
  {
    key: 'avoidRain',
    label: 'Avoid rain exposure',
    description: 'Favors covered walking and lower carried rain exposure.',
    hardRequirement: 'low rain impact with covered walking',
  },
  {
    key: 'womenFocused',
    label: 'Women-focused preferences',
    description:
      'Adds weight to lighting and populated segments, avoids isolated shortcuts, and prefers staffed stops. Editable at any time; the resulting route is still not guaranteed safe.',
    hardRequirement: 'well-lit and populated streets combined',
  },
];

/** What the women-focused preset changes, shown when it is enabled. */
export const WOMEN_FOCUSED_CHANGES = [
  'More weight on well-lit segments.',
  'More weight on populated streets.',
  'Avoids isolated shortcuts.',
  'Prefers open public places and staffed stops.',
];

export const PREFERENCE_CHIP_MAP = Object.fromEntries(
  PREFERENCE_CHIPS.map((chip) => [chip.key, chip]),
);

/** Comparison summary label for the leading preference, e.g. "Safety-first". */
export const PREFERENCE_SUMMARY_LABEL: Record<PrimaryPreference, string> = {
  fastest: 'Fastest',
  safest: 'Safety-first',
  cleanest: 'Cleanest',
  'lowest-cost': 'Lowest cost',
};
