import AppShell from '../components/app/AppShell';
import TripSetup from '../components/planner/TripSetup';
import ComparisonView from '../components/routes/ComparisonView';
import EvidenceDrawer from '../components/evidence/EvidenceDrawer';
import StopSearchPanel from '../components/stops/StopSearchPanel';
import InstallHelpPanel from '../components/app/InstallHelpPanel';
import PreStartConfirmation from '../components/app/PreStartConfirmation';
import ActiveRoutePreview from '../components/app/ActiveRoutePreview';
import OfflineBanner from '../components/app/OfflineBanner';
import { usePlannerState } from '../hooks/usePlannerState';
import { useOfflineStatus, useRouteComparison } from '../hooks/useRouteComparison';
import { usePwaInstall } from '../hooks/usePwaInstall';
import { getPlace } from '../data/places';
import { PREFERENCE_CHIPS } from '../data/preferences';
import type { PreferenceKey } from '../types/planner';

function tripStateLine(
  activeView: string,
  originId: string | null,
  destinationId: string | null,
  hasSelection: boolean,
): string {
  const origin = originId ? getPlace(originId).name : 'no origin yet';
  const destination = destinationId ? getPlace(destinationId).name : 'no destination yet';
  if (activeView === 'active-preview') return `Active preview · ${origin} → ${destination}`;
  if (activeView === 'pre-start') return `Ready to start · ${origin} → ${destination}`;
  if (activeView === 'comparison') return `Comparing routes · ${origin} → ${destination}`;
  return `Planning · ${origin} → ${destination}${hasSelection ? '' : ''}`;
}

/**
 * Raah — route comparison planner. Single-page app with URL-independent
 * UI states; a browser refresh always returns to the safe planner state.
 */
export default function App() {
  const { state, dispatch } = usePlannerState();
  const { result, isComparing } = useRouteComparison(state, dispatch);
  const offline = useOfflineStatus();
  const { support, install, dismissHint: _dismissHint } = usePwaInstall();

  const selectedRanked =
    result?.ranked.find((entry) => entry.route.id === state.selectedRouteId) ?? null;
  const evidenceRanked =
    result?.ranked.find((entry) => entry.route.id === state.evidenceRouteId) ?? null;

  const relaxPreference = (key: string) => {
    dispatch({ type: 'TOGGLE_PREFERENCE', key: key as PreferenceKey });
  };

  const showAllRoutes = () => {
    for (const chip of PREFERENCE_CHIPS) {
      if (state.preferences[chip.key]) {
        dispatch({ type: 'TOGGLE_PREFERENCE', key: chip.key });
      }
    }
  };

  return (
    <AppShell
      tripState={tripStateLine(state.activeView, state.originId, state.destinationId, Boolean(state.selectedRouteId))}
      offline={offline}
      installSupport={support}
      onOpenInstallHelp={() => dispatch({ type: 'OPEN_PANEL', panel: 'install-help' })}
    >
      <p className="sr-only" role="status" aria-live="polite">
        {state.announcement}
      </p>

      <OfflineBanner offline={offline} />

      {state.activeView === 'planner' ? (
        <TripSetup
          state={state}
          onConfirmContext={() => dispatch({ type: 'CONFIRM_CONTEXT' })}
          onChangeOrigin={(placeId) => dispatch({ type: 'SET_ORIGIN', placeId })}
          onDismissContext={() => dispatch({ type: 'DISMISS_CONTEXT' })}
          onSetOrigin={(placeId) => dispatch({ type: 'SET_ORIGIN', placeId })}
          onSetDestination={(placeId) => dispatch({ type: 'SET_DESTINATION', placeId })}
          onAddStop={() => dispatch({ type: 'OPEN_PANEL', panel: 'stop-search' })}
          onRemoveStop={(index) => dispatch({ type: 'REMOVE_STOP', index })}
          onUndoRemove={() => dispatch({ type: 'UNDO_REMOVE_STOP' })}
          onMoveStop={(from, to) => dispatch({ type: 'MOVE_STOP', from, to })}
          onSetMode={(mode) => dispatch({ type: 'SET_MODE', mode })}
          onSetPreference={(preference) => dispatch({ type: 'SET_PRIMARY_PREFERENCE', preference })}
          onToggleChip={(key) => dispatch({ type: 'TOGGLE_PREFERENCE', key })}
          onCompare={() => dispatch({ type: 'COMPARE_ROUTES' })}
          canUndoRemove={state.lastRemovedStop !== null}
        />
      ) : null}

      {state.activeView === 'comparison' ? (
        <ComparisonView
          state={state}
          result={result}
          isComparing={isComparing}
          onSelectRoute={(routeId) => dispatch({ type: 'SELECT_ROUTE', routeId })}
          onOpenEvidence={(routeId) => dispatch({ type: 'OPEN_PANEL', panel: 'evidence', routeId })}
          onChooseRoute={(routeId) => dispatch({ type: 'CHOOSE_ROUTE', routeId })}
          onEditTrip={() => dispatch({ type: 'EDIT_TRIP' })}
          onAddStop={() => dispatch({ type: 'OPEN_PANEL', panel: 'stop-search' })}
          onRemoveStop={(index) => dispatch({ type: 'REMOVE_STOP', index })}
          onUndoRemove={() => dispatch({ type: 'UNDO_REMOVE_STOP' })}
          onMoveStop={(from, to) => dispatch({ type: 'MOVE_STOP', from, to })}
          onRelaxPreference={relaxPreference}
          onShowAllRoutes={showAllRoutes}
        />
      ) : null}

      {state.activeView === 'pre-start' && selectedRanked ? (
        <PreStartConfirmation
          ranked={selectedRanked}
          onBackToRoutes={() => dispatch({ type: 'BACK_TO_ROUTES' })}
          onStart={() => dispatch({ type: 'START_ROUTE' })}
          onViewEvidence={() =>
            dispatch({ type: 'OPEN_PANEL', panel: 'evidence', routeId: selectedRanked.route.id })
          }
        />
      ) : null}

      {state.activeView === 'active-preview' && selectedRanked ? (
        <ActiveRoutePreview
          ranked={selectedRanked}
          stopIds={state.stopIds}
          onViewEvidence={() =>
            dispatch({ type: 'OPEN_PANEL', panel: 'evidence', routeId: selectedRanked.route.id })
          }
          onChangeRoute={() => dispatch({ type: 'CHANGE_ROUTE_FROM_PREVIEW' })}
          onAddStop={() => dispatch({ type: 'OPEN_PANEL', panel: 'stop-search' })}
          onEndPreview={() => dispatch({ type: 'END_PREVIEW' })}
        />
      ) : null}

      <EvidenceDrawer
        open={state.openPanel === 'evidence'}
        ranked={evidenceRanked}
        stopIds={state.stopIds}
        onClose={() => dispatch({ type: 'CLOSE_PANEL' })}
      />

      <StopSearchPanel
        open={state.openPanel === 'stop-search'}
        existingStopIds={state.stopIds}
        onAdd={(placeId) => dispatch({ type: 'ADD_STOP', placeId })}
        onClose={() => dispatch({ type: 'CLOSE_PANEL' })}
      />

      <InstallHelpPanel
        open={state.openPanel === 'install-help'}
        support={support}
        onInstall={() => {
          void install();
        }}
        onClose={() => dispatch({ type: 'CLOSE_PANEL' })}
      />
    </AppShell>
  );
}
