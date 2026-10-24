import { useRef, useState } from 'react';
import Icon, { type IconName } from '../shared/Icon';
import type { DemoPlace } from '../../types/planner';

type LocationFieldProps = {
  id: string;
  label: string;
  icon: IconName;
  /** Currently selected place, or null for empty. */
  value: DemoPlace | null;
  suggestions: DemoPlace[];
  placeholder: string;
  /** Accessible description, e.g. the "no destination" helper message. */
  helperText?: string;
  helperTone?: 'info' | 'error';
  onSelect: (placeId: string) => void;
  /** Called when the picker opens so parents can focus/manage state. */
  onOpen?: () => void;
};

/**
 * Local-suggestion location picker. A trigger button opens a listbox of
 * demo places; fully keyboard operable (Enter opens, Tab/arrows + Enter
 * select, Escape closes).
 */
export default function LocationField({
  id,
  label,
  icon,
  value,
  suggestions,
  placeholder,
  helperText,
  helperTone = 'info',
  onSelect,
  onOpen,
}: LocationFieldProps) {
  const [open, setOpen] = useState(false);
  const listId = `${id}-suggestions`;
  const triggerRef = useRef<HTMLButtonElement>(null);

  const choose = (placeId: string) => {
    onSelect(placeId);
    setOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div className={`location-field ${open ? 'location-field--open' : ''}`}>
      <button
        ref={triggerRef}
        type="button"
        id={id}
        className={`location-field__trigger ${value ? '' : 'location-field__trigger--empty'}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={`${label} — ${value ? value.name : placeholder}`}
        onClick={() => {
          setOpen((wasOpen) => !wasOpen);
          if (!open) onOpen?.();
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' && !open) {
            event.preventDefault();
            setOpen(true);
            onOpen?.();
          }
        }}
      >
        <Icon name={icon} size={18} />
        <span className="location-field__value" aria-hidden="true">
          {value ? value.name : placeholder}
        </span>
        <Icon name={open ? 'chevron-up' : 'chevron-down'} size={16} />
      </button>
      {open ? (
        <ul className="suggestion-list location-field__list" id={listId} role="listbox" aria-label={`${label} suggestions`}>
          {suggestions.map((place) => (
            <li key={place.id} role="option" aria-selected={value?.id === place.id}>
              <button
                type="button"
                className="suggestion-row"
                onClick={() => choose(place.id)}
              >
                <Icon name={place.category === 'pharmacy' ? 'pharmacy' : icon} size={18} />
                <span className="suggestion-row__name">{place.name}</span>
                <span className="suggestion-row__meta">
                  {place.category === 'origin' || place.category === 'destination'
                    ? 'Demo place'
                    : `Stop · ${place.category}`}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {helperText ? (
        <p className={`field-helper ${helperTone === 'error' ? 'field-helper--error' : ''}`} id={`${id}-helper`}>
          {helperText}
        </p>
      ) : null}
    </div>
  );
}

/** Static label above a location field (buttons are labelable elements). */
export function FieldLabel({ htmlFor, children }: { htmlFor: string; children: string }) {
  return (
    <label className="field-label" htmlFor={htmlFor}>
      {children}
    </label>
  );
}
