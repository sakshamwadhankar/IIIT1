import { useEffect } from 'react';
import Icon from '../shared/Icon';
import LocationField, { FieldLabel } from './LocationField';
import ModeSelector from './ModeSelector';
import PreferenceChips from './PreferenceChips';
import StopList from '../stops/StopList';
import HomeAnimation from '../app/HomeAnimation';
import { PRIMARY_PREFERENCES } from '../../data/preferences';
import {
  DESTINATION_SUGGESTION_IDS,
  ORIGIN_SUGGESTION_IDS,
  STOP_SUGGESTION_IDS,
  getPlace,
} from '../../data/places';
import type { PlannerState, PreferenceKey, PrimaryPreference, TravelMode } from '../../types/planner';
import type { DemoPlace } from '../../types/planner';

type TripSetupProps = {
  state: PlannerState;
  onSetOrigin: (placeId: string) => void;
  onSetDestination: (placeId: string) => void;
  onAddStop: () => void;
  onRemoveStop: (index: number) => void;
  onUndoRemove: () => void;
  onMoveStop: (from: number, to: number) => void;
  onSetMode: (mode: TravelMode) => void;
  onSetPreference: (preference: PrimaryPreference) => void;
  onToggleChip: (key: PreferenceKey) => void;
  onCompare: () => void;
  canUndoRemove: boolean;
};

function getPlaceOrNull(id: string | null): DemoPlace | null {
  return id ? getPlace(id) : null;
}

/**
 * Home screen: a greeting, the animated city scene, then the trip form.
 * The starting point is selected automatically as the current location —
 * only the destination needs input before comparing routes.
 */
export default function TripSetup({
  state,
  onSetOrigin,
  onSetDestination,
  onAddStop,
  onRemoveStop,
  onUndoRemove,
  onMoveStop,
  onSetMode,
  onSetPreference,
  onToggleChip,
  onCompare,
  canUndoRemove,
}: TripSetupProps) {
  // Current location is preselected without any user action.
  useEffect(() => {
    if (!state.originId && state.contextSuggestionId) {
      onSetOrigin(state.contextSuggestionId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const destinationMissing = !state.destinationId;
  const originPlace = getPlaceOrNull(state.originId);
  // The auto-selected origin is the detected current location.
  const originDisplay =
    originPlace && originPlace.category === 'origin'
      ? { ...originPlace, name: 'Current location' }
      : originPlace;

  return (
    <div className="trip-setup">
      <div className="home-anim-panel">
        <div className="trip-setup__hero">
          <h1 className="trip-setup__greeting">What’s the mood today?</h1>
          <p className="trip-setup__sub">
            Pick a destination and Raah lines up the routes that fit.
          </p>
        </div>
        <HomeAnimation />
      </div>

      <div className="trip-setup__grid">
        <div className="trip-setup__fields card">
          <h2 className="section-title">What’s on your mind?</h2>

          <div className="field-row">
            <FieldLabel htmlFor="origin-field">Starting point</FieldLabel>
            <LocationField
              id="origin-field"
              label="Starting point"
              icon="pin"
              value={originDisplay}
              suggestions={ORIGIN_SUGGESTION_IDS.map(getPlace)}
              placeholder="Choose a starting point"
              onSelect={onSetOrigin}
            />
          </div>

          <div className="field-row">
            <FieldLabel htmlFor="destination-field">Destination</FieldLabel>
            <LocationField
              id="destination-field"
              label="Destination"
              icon="flag"
              value={getPlaceOrNull(state.destinationId)}
              suggestions={DESTINATION_SUGGESTION_IDS.map(getPlace)}
              placeholder={destinationMissing ? 'Select a destination' : 'Change destination'}
              helperText={
                destinationMissing
                  ? 'Choose a destination to compare routes.'
                  : undefined
              }
              helperTone={destinationMissing ? 'error' : 'info'}
              onSelect={onSetDestination}
            />
          </div>
        </div>

        <div className="trip-setup__controls card">
          <div className="trip-setup__stops">
            <div className="trip-setup__stops-header">
              <h3 className="field-label">Stops (optional)</h3>
              <button type="button" className="btn btn--secondary btn--small" onClick={onAddStop}>
                <Icon name="plus" size={16} />
                Add stop
              </button>
            </div>
            <StopList
              origin={state.originId ? getPlace(state.originId) : null}
              destination={state.destinationId ? getPlace(state.destinationId) : null}
              stopIds={state.stopIds}
              onRemove={onRemoveStop}
              onMove={onMoveStop}
              onUndo={onUndoRemove}
              canUndo={canUndoRemove}
              compact
            />
          </div>

          <ModeSelector value={state.mode} onChange={onSetMode} />

          <fieldset className="preference-selector">
            <legend className="field-label">What matters most?</legend>
            <div className="preference-selector__options">
              {PRIMARY_PREFERENCES.map((option) => (
                <label
                  key={option.id}
                  className={`preference-option ${
                    state.primaryPreference === option.id ? 'preference-option--active' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="primary-preference"
                    value={option.id}
                    checked={state.primaryPreference === option.id}
                    onChange={() => onSetPreference(option.id)}
                  />
                  <span className="preference-option__box">
                    <span className="preference-option__label">{option.shortLabel}</span>
                    <span className="preference-option__hint">{option.description}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <PreferenceChips preferences={state.preferences} onToggle={onToggleChip} />

          <div className="trip-setup__actions">
            <button
              type="button"
              className="btn btn--primary btn--large"
              onClick={onCompare}
              disabled={destinationMissing}
              aria-describedby={destinationMissing ? 'destination-field-helper' : undefined}
            >
              <Icon name="route" size={20} />
              Compare routes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Stop suggestion ids exposed for tests and the add-stop panel. */
export const TRIP_STOP_SUGGESTIONS = STOP_SUGGESTION_IDS;
