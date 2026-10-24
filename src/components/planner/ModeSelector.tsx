import Icon from '../shared/Icon';
import { MODE_OPTIONS } from '../../data/preferences';
import type { TravelMode } from '../../types/planner';

type ModeSelectorProps = {
  value: TravelMode;
  onChange: (mode: TravelMode) => void;
};

/** Walk / Cab / Mixed selector — a real radiogroup for keyboard support. */
export default function ModeSelector({ value, onChange }: ModeSelectorProps) {
  const iconName: Record<TravelMode, 'walk' | 'cab' | 'mixed'> = {
    walk: 'walk',
    cab: 'cab',
    mixed: 'mixed',
  };

  return (
    <fieldset className="mode-selector">
      <legend className="field-label">Travel mode</legend>
      <div className="mode-selector__options">
        {MODE_OPTIONS.map((option) => (
          <label
            key={option.id}
            className={`mode-option ${value === option.id ? 'mode-option--active' : ''}`}
          >
            <input
              type="radio"
              name="travel-mode"
              value={option.id}
              checked={value === option.id}
              onChange={() => onChange(option.id)}
            />
            <span className="mode-option__box">
              <Icon name={iconName[option.id]} size={20} />
              <span className="mode-option__label">{option.label}</span>
            </span>
            <span className="sr-only">{option.description}</span>
          </label>
        ))}
      </div>
      <p className="field-helper" aria-live="polite">
        {MODE_OPTIONS.find((option) => option.id === value)?.description}
      </p>
    </fieldset>
  );
}
