import { useReducer } from 'react';
import type {
  OpenPanel,
  PlannerState,
  PreferenceKey,
  PrimaryPreference,
  TravelMode,
} from '../types/planner';
import { EMPTY_PREFERENCES } from '../types/planner';
import { DEMO_TRIP, DEMO_CLOCK } from '../data/demo-trip';
import { getPlace } from '../data/places';
import { ROUTES } from '../data/routes';
import { rankRoutes } from '../lib/ranking';
import {
  computeTotals,
  insertStop,
  moveStop,
  removeStopAt,
  reorderAnnouncement,
  reorderDeltaMinutes,
  restoreStop,
} from '../lib/stops';

/**
 * Planner state machine. All transitions are local and deterministic.
 * Nothing in this reducer starts navigation, redirects, or touches the
 * network — the active preview only begins via an explicit START_ROUTE.
 */

export type PlannerAction =
  | { type: 'CONFIRM_CONTEXT' }
  | { type: 'DISMISS_CONTEXT' }
  | { type: 'SET_ORIGIN'; placeId: string }
  | { type: 'SET_DESTINATION'; placeId: string }
  | { type: 'SET_MODE'; mode: TravelMode }
  | { type: 'SET_PRIMARY_PREFERENCE'; preference: PrimaryPreference }
  | { type: 'TOGGLE_PREFERENCE'; key: PreferenceKey }
  | { type: 'COMPARE_ROUTES' }
  | { type: 'COMPARISON_READY' }
  | { type: 'SELECT_ROUTE'; routeId: string }
  | { type: 'OPEN_PANEL'; panel: Exclude<OpenPanel, 'none'>; routeId?: string }
  | { type: 'CLOSE_PANEL' }
  | { type: 'ADD_STOP'; placeId: string }
  | { type: 'REMOVE_STOP'; index: number }
  | { type: 'UNDO_REMOVE_STOP' }
  | { type: 'MOVE_STOP'; from: number; to: number }
  | { type: 'CHOOSE_ROUTE'; routeId: string }
  | { type: 'START_ROUTE' }
  | { type: 'BACK_TO_ROUTES' }
  | { type: 'EDIT_TRIP' }
  | { type: 'CHANGE_ROUTE_FROM_PREVIEW' }
  | { type: 'END_PREVIEW' };

export function createInitialPlannerState(): PlannerState {
  return {
    originId: null,
    originSource: null,
    contextSuggestionId: DEMO_TRIP.detectedContext.originId,
    contextDismissed: false,
    destinationId: null,
    stopIds: [],
    mode: 'mixed',
    primaryPreference: 'fastest',
    preferences: { ...EMPTY_PREFERENCES },
    selectedRouteId: null,
    activeView: 'planner',
    openPanel: 'none',
    comparisonStatus: 'idle',
    evidenceRouteId: null,
    demoClock: DEMO_CLOCK,
    lastRemovedStop: null,
    announcement: null,
  };
}

function routeInputsFor(state: PlannerState) {
  return ROUTES.map((route) => ({
    route,
    totals: computeTotals(route, state.stopIds),
  }));
}

/** Rank with the current state; used to pick the default selection. */
function recommendedRouteId(state: PlannerState): string | null {
  const result = rankRoutes(
    routeInputsFor(state),
    state.preferences,
    state.mode,
    state.primaryPreference,
  );
  return result.recommendedId;
}

export function plannerReducer(state: PlannerState, action: PlannerAction): PlannerState {
  switch (action.type) {
    case 'CONFIRM_CONTEXT': {
      if (!state.contextSuggestionId) return state;
      return {
        ...state,
        originId: state.contextSuggestionId,
        originSource: 'detected',
        announcement: `Origin set to ${getPlace(state.contextSuggestionId).name}. Navigation has not started.`,
      };
    }

    case 'DISMISS_CONTEXT': {
      return {
        ...state,
        contextDismissed: true,
        announcement: 'Context suggestion dismissed. You can enter the origin manually.',
      };
    }

    case 'SET_ORIGIN': {
      const place = getPlace(action.placeId);
      return {
        ...state,
        originId: place.id,
        originSource: 'manual',
        announcement: `Origin set to ${place.name}.`,
      };
    }

    case 'SET_DESTINATION': {
      const place = getPlace(action.placeId);
      if (state.destinationId === place.id) return state;
      return {
        ...state,
        destinationId: place.id,
        // A new destination invalidates the previous comparison.
        comparisonStatus: 'idle',
        selectedRouteId: null,
        activeView: 'planner',
        openPanel: 'none',
        announcement: `Destination set to ${place.name}.`,
      };
    }

    case 'SET_MODE': {
      return { ...state, mode: action.mode };
    }

    case 'SET_PRIMARY_PREFERENCE': {
      return { ...state, primaryPreference: action.preference };
    }

    case 'TOGGLE_PREFERENCE': {
      const next = {
        ...state.preferences,
        [action.key]: !state.preferences[action.key],
      };
      return { ...state, preferences: next };
    }

    case 'COMPARE_ROUTES': {
      if (!state.destinationId) {
        return {
          ...state,
          announcement: 'Choose a destination to compare routes.',
        };
      }
      const recommended = recommendedRouteId(state);
      return {
        ...state,
        activeView: 'comparison',
        comparisonStatus: 'comparing',
        selectedRouteId: recommended,
        openPanel: 'none',
        announcement: 'Comparing routes…',
      };
    }

    case 'COMPARISON_READY': {
      if (state.comparisonStatus !== 'comparing') return state;
      return {
        ...state,
        comparisonStatus: 'ready',
        announcement: `Route comparison ready · ${ROUTES.length} routes shown. Select a route to see details.`,
      };
    }

    case 'SELECT_ROUTE': {
      return { ...state, selectedRouteId: action.routeId };
    }

    case 'OPEN_PANEL': {
      if (action.panel === 'evidence') {
        return {
          ...state,
          openPanel: 'evidence',
          evidenceRouteId: action.routeId ?? state.selectedRouteId ?? state.evidenceRouteId,
        };
      }
      return { ...state, openPanel: action.panel };
    }

    case 'CLOSE_PANEL': {
      return { ...state, openPanel: 'none' };
    }

    case 'ADD_STOP': {
      if (state.stopIds.includes(action.placeId)) return state;
      const stopIds = insertStop(state.stopIds, action.placeId);
      const place = getPlace(action.placeId);
      const detour = place.detourMinutes ?? 0;
      const walking = place.detourWalkingMeters ?? 0;
      return {
        ...state,
        stopIds,
        openPanel: 'none',
        lastRemovedStop: null,
        announcement: `${place.name} added as a stop · about +${detour} min and +${walking} m walking on every route.`,
      };
    }

    case 'REMOVE_STOP': {
      const { stopIds, removed } = removeStopAt(state.stopIds, action.index);
      if (!removed) return state;
      const place = getPlace(removed.placeId);
      return {
        ...state,
        stopIds,
        lastRemovedStop: removed,
        announcement: `${place.name} removed from the trip. Undo is available.`,
      };
    }

    case 'UNDO_REMOVE_STOP': {
      if (!state.lastRemovedStop) return state;
      const { placeId, index } = state.lastRemovedStop;
      const place = getPlace(placeId);
      return {
        ...state,
        stopIds: restoreStop(state.stopIds, placeId, index),
        lastRemovedStop: null,
        announcement: `${place.name} restored as a stop.`,
      };
    }

    case 'MOVE_STOP': {
      if (state.stopIds.length < 2) return state;
      const before = state.stopIds;
      const after = moveStop(before, action.from, action.to);
      if (after === before) return state;
      const selected = state.selectedRouteId
        ? ROUTES.find((route) => route.id === state.selectedRouteId)
        : undefined;
      const delta = selected ? reorderDeltaMinutes(selected, before, after) : 0;
      const announcement = selected ? reorderAnnouncement(delta) : 'Stop order updated.';
      return { ...state, stopIds: after, announcement };
    }

    case 'CHOOSE_ROUTE': {
      const chosen = ROUTES.find((route) => route.id === action.routeId);
      if (!chosen) return state;
      return {
        ...state,
        selectedRouteId: chosen.id,
        activeView: 'pre-start',
        openPanel: 'none',
        announcement: `${chosen.name} selected. Review the summary, then start when ready.`,
      };
    }

    case 'START_ROUTE': {
      // Only reachable from the pre-start confirmation with a selected route.
      if (state.activeView !== 'pre-start' || !state.selectedRouteId) return state;
      return {
        ...state,
        activeView: 'active-preview',
        announcement: 'Active route preview started. You can view evidence or change the route.',
      };
    }

    case 'BACK_TO_ROUTES':
    case 'CHANGE_ROUTE_FROM_PREVIEW': {
      return { ...state, activeView: 'comparison', openPanel: 'none' };
    }

    case 'EDIT_TRIP': {
      // From the comparison summary bar: return to trip setup without
      // losing the current trip (origin, destination, stops, preferences).
      return { ...state, activeView: 'planner', openPanel: 'none' };
    }

    case 'END_PREVIEW': {
      return {
        ...state,
        activeView: 'comparison',
        announcement: 'Preview ended. You are back on the route comparison.',
      };
    }

    default:
      return state;
  }
}

export function usePlannerState() {
  const [state, dispatch] = useReducer(plannerReducer, undefined, createInitialPlannerState);
  return { state, dispatch };
}
