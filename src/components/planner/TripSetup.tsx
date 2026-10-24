import Icon from '../shared/Icon';
import LocationField, { FieldLabel } from './LocationField';
import ModeSelector from './ModeSelector';
import PreferenceChips from './PreferenceChips';
import StopList from '../stops/StopList';
import EmptyState from '../shared/EmptyState';
import ContextHandoffSheet from './ContextHandoffSheet';
import { PRIMARY_PREFERENCES } from '../../data/preferences';
import {
  DESTINATION_SUGGESTION_IDS,
  ORIGIN_SUGGESTION_IDS,
  STOP_SUGGESTION_IDS,
  getPlace,
} from '../../data/places';
import { DEMO_TRIP } from '../../data/demo-trip';
import type { PlannerState, PreferenceKey, PrimaryPreference, TravelMode } from '../../types/planner';
import type { DemoPlace } from '../../types/planner';

type TripSetupProps = {
  state: PlannerState;
  onConfirmContext: () => void;
  onChangeOrigin: (placeId: string) => void;
  onDismissContext: () => void;
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

/** Screen A (context handoff) + Screen B (trip setup). */
export default function TripSetup({
  state,
  onConfirmContext,
  onChangeOrigin,
  onDismissContext,
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
  const showContextSheet =
    !state.originId && !state.contextDismissed && Boolean(state.contextSuggestionId);
  const destinationMissing = !state.destinationId;
  const hasAnyContent = Boolean(state.originId || state.destinationId || state.stopIds.length);

  return (
    <div className="trip-setup">
      {showContextSheet ? (
        <ContextHandoffSheet
          demoClock={state.demoClock}
          onConfirm={onConfirmContext}
          onChangeOrigin={onChangeOrigin}
          onDismiss={onDismissContext}
        />
      ) : null}

      <div className="trip-setup__grid">
        <div className="trip-setup__fields card">
          <h2 className="section-title">Plan your trip</h2>

          <div className="field-row">
            <FieldLabel htmlFor="origin-field">Starting point</FieldLabel>
            <LocationField
              id="origin-field"
              label="Starting point"
              icon="pin"
              value={getPlaceOrNull(state.originId)}
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
        </div>

        <div className="trip-setup__controls card">
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
            <p className="trip-setup__scenario">{DEMO_TRIP.scenario}</p>
          </div>
        </div>
      </div>

      {!hasAnyContent && !showContextSheet ? (
        <EmptyState
          title="Compare routes that fit your priorities"
          body="Raah shows five route options side by side — time, cost, walking distance, weather exposure, and safety-supporting signals — so you can choose the trade-off instead of accepting one opaque path. All data is synthetic demo data."
          actionLabel={`Try ${getPlace(DEMO_TRIP.recommendedDestinationId).name}`}
          onAction={() => onSetDestination(DEMO_TRIP.recommendedDestinationId)}
        />
      ) : null}
    </div>
  );
}

/** Stop suggestion ids exposed for tests and the add-stop panel. */
export const TRIP_STOP_SUGGESTIONS = STOP_SUGGESTION_IDS;
