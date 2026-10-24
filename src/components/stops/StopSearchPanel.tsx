import { useState } from 'react';
import Icon from '../shared/Icon';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { STOP_SUGGESTION_IDS, getPlace } from '../../data/places';
import type { DemoPlace } from '../../types/planner';
import { formatFare, formatMinutes, formatWalking } from '../../lib/formatters';

type StopSearchPanelProps = {
  open: boolean;
  existingStopIds: string[];
  onAdd: (placeId: string) => void;
  onClose: () => void;
};

/**
 * Add-stop panel with a detour preview before confirmation:
 * "GreenCare Pharmacy — Open until 10:00 PM · staffed · Detour: +6 min · ₹0 extra".
 */
export default function StopSearchPanel({
  open,
  existingStopIds,
  onAdd,
  onClose,
}: StopSearchPanelProps) {
  const [pending, setPending] = useState<DemoPlace | null>(null);
  const panelRef = useFocusTrap<HTMLDivElement>(open, onClose);
  if (!open) return null;

  const suggestions = STOP_SUGGESTION_IDS.map(getPlace);

  return (
    <div className="overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="stop-search-title"
        className="overlay__panel overlay__panel--sheet"
      >
        <header className="overlay__header">
          <h2 id="stop-search-title">
            <Icon name="plus" size={20} />
            Add a stop
          </h2>
          <button type="button" className="btn btn--icon" aria-label="Close add-stop panel" onClick={onClose}>
            <Icon name="close" size={18} />
          </button>
        </header>

        <p className="overlay__intro">
          Demo suggestions near your route. Raah shows the detour before anything is added.
        </p>

        <ul className="suggestion-list stop-search__list">
          {suggestions.map((place) => {
            const alreadyAdded = existingStopIds.includes(place.id);
            return (
              <li key={place.id}>
                <button
                  type="button"
                  className={`suggestion-row stop-search__row ${
                    pending?.id === place.id ? 'suggestion-row--active' : ''
                  }`}
                  aria-expanded={pending?.id === place.id}
                  onClick={() => setPending(alreadyAdded ? null : place)}
                  disabled={alreadyAdded}
                >
                  <Icon name={place.category === 'pharmacy' ? 'pharmacy' : 'pin'} size={20} />
                  <span className="suggestion-row__body">
                    <span className="suggestion-row__name">{place.name}</span>
                    <span className="suggestion-row__meta">
                      {place.category}
                      {place.openUntil ? ` · open until ${place.openUntil}` : ''}
                      {place.staffed ? ' · staffed' : ''}
                    </span>
                  </span>
                  <span className="stop-search__action">
                    {alreadyAdded ? 'Added' : pending?.id === place.id ? 'Selected' : 'Preview'}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {pending ? (
          <div className="detour-preview" role="region" aria-label={`Detour preview for ${pending.name}`}>
            <h3>{pending.name}</h3>
            <p className="detour-preview__meta">
              {pending.openUntil ? `Open until ${pending.openUntil} · ` : ''}
              {pending.staffed ? 'staffed · ' : ''}
              {pending.badges?.includes('trusted') ? 'trusted nearby stop' : 'demo place'}
            </p>
            {pending.safetySupportingContext ? (
              <p className="detour-preview__context">Safety context: {pending.safetySupportingContext}</p>
            ) : null}
            <p className="detour-preview__detour">
              <Icon name="clock" size={18} />
              Detour: +{pending.detourMinutes} min ({formatMinutes(pending.detourMinutes ?? 0)}) ·{' '}
              {formatFare(pending.detourFareInr ?? 0)} extra · +{formatWalking(pending.detourWalkingMeters ?? 0)}{' '}
              walking
            </p>
            <p className="detour-preview__note">
              Detours apply to every route in the comparison; the first stop in the list can be a
              little faster when the place is close to your origin.
            </p>
            <div className="detour-preview__actions">
              <button type="button" className="btn btn--primary" onClick={() => onAdd(pending.id)}>
                <Icon name="check" size={18} />
                Add stop
              </button>
              <button type="button" className="btn btn--ghost" onClick={() => setPending(null)}>
                Cancel
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
