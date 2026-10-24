import Icon from '../shared/Icon';
import { PREFERENCE_CHIPS, WOMEN_FOCUSED_CHANGES } from '../../data/preferences';
import type { PreferenceKey, RoutePreferences } from '../../types/planner';

type PreferenceChipsProps = {
  preferences: RoutePreferences;
  onToggle: (key: PreferenceKey) => void;
};

/**
 * Optional preference chips. Every chip explains what it changes.
 * Nightlife avoidance is presented as a routing preference, not a claim
 * about venues; the women-focused preset explains its own changes.
 */
export default function PreferenceChips({ preferences, onToggle }: PreferenceChipsProps) {
  return (
    <section className="preference-chips" aria-label="Optional route preferences">
      <h3 className="field-label">Optional preferences</h3>
      <div className="preference-chips__row">
        {PREFERENCE_CHIPS.map((chip) => {
          const pressed = preferences[chip.key];
          return (
            <button
              key={chip.key}
              type="button"
              className={`chip ${pressed ? 'chip--active' : ''}`}
              aria-pressed={pressed}
              onClick={() => onToggle(chip.key)}
              title={chip.description}
            >
              {pressed ? <Icon name="check" size={14} /> : null}
              {chip.label}
            </button>
          );
        })}
      </div>
      {preferences.womenFocused ? (
        <div className="women-focused-note" aria-live="polite">
          <p className="women-focused-note__title">
            <Icon name="shield" size={16} />
            Women-focused preferences are on. What changes:
          </p>
          <ul>
            {WOMEN_FOCUSED_CHANGES.map((change) => (
              <li key={change}>{change}</li>
            ))}
          </ul>
          <p className="women-focused-note__footnote">
            These preferences shape the ranking. The resulting route is still not a guarantee of
            safety — every chip stays editable.
          </p>
        </div>
      ) : null}
      {preferences.avoidNightlife ? (
        <p className="preference-note">
          “Avoid nightlife clusters” is a routing preference only — it is not a statement that any
          venue or neighbourhood is unsafe.
        </p>
      ) : null}
    </section>
  );
}
