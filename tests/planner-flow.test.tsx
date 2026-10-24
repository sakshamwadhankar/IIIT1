import { describe, it, expect } from 'vitest';
import {
  createInitialPlannerState,
  plannerReducer,
  type PlannerAction,
} from '../src/hooks/usePlannerState';
import type { PlannerState } from '../src/types/planner';

const LIBRARY = 'place-north-campus-library';
const METRO = 'place-indiranagar-metro-gate-3';
const PHARMACY = 'place-greencare-pharmacy';
const CAFE = 'place-corner-cafe';

function run(state: PlannerState, actions: PlannerAction[]): PlannerState {
  return actions.reduce(plannerReducer, state);
}

describe('planner state machine', () => {
  it('starts in the safe planner state (refresh never resumes an active route)', () => {
    const initial = createInitialPlannerState();
    expect(initial.activeView).toBe('planner');
    expect(initial.originId).toBeNull();
    expect(initial.destinationId).toBeNull();
    expect(initial.selectedRouteId).toBeNull();
    expect(initial.contextSuggestionId).toBe(LIBRARY);
    expect(initial.demoClock).toBe('7:20 PM');
  });

  it('confirming the context only fills the origin — navigation never starts', () => {
    const after = run(createInitialPlannerState(), [{ type: 'CONFIRM_CONTEXT' }]);
    expect(after.originId).toBe(LIBRARY);
    expect(after.originSource).toBe('detected');
    expect(after.activeView).toBe('planner');
    expect(after.comparisonStatus).toBe('idle');
    expect(after.announcement).toMatch(/Navigation has not started/i);
  });

  it('dismissing the context keeps the planner available for manual entry', () => {
    const after = run(createInitialPlannerState(), [{ type: 'DISMISS_CONTEXT' }]);
    expect(after.contextDismissed).toBe(true);
    expect(after.originId).toBeNull();
    expect(after.activeView).toBe('planner');
  });

  it('refuses to compare without a destination and explains why', () => {
    const after = run(createInitialPlannerState(), [
      { type: 'CONFIRM_CONTEXT' },
      { type: 'COMPARE_ROUTES' },
    ]);
    expect(after.activeView).toBe('planner');
    expect(after.comparisonStatus).toBe('idle');
    expect(after.announcement).toBe('Choose a destination to compare routes.');
  });

  it('runs the compare → ready transition with the recommended route highlighted', () => {
    const after = run(createInitialPlannerState(), [
      { type: 'CONFIRM_CONTEXT' },
      { type: 'SET_DESTINATION', placeId: METRO } as PlannerAction,
      { type: 'COMPARE_ROUTES' },
      { type: 'COMPARISON_READY' },
    ]);
    expect(after.activeView).toBe('comparison');
    expect(after.comparisonStatus).toBe('ready');
    // Default preference is Fastest with no chips → the fastest route leads.
    expect(after.selectedRouteId).toBe('route-fastest');
  });

  it('keeps the explicit user in control of starting the route preview', () => {
    const base = run(createInitialPlannerState(), [
      { type: 'CONFIRM_CONTEXT' },
      { type: 'SET_DESTINATION', placeId: METRO } as PlannerAction,
      { type: 'COMPARE_ROUTES' },
      { type: 'COMPARISON_READY' },
      { type: 'CHOOSE_ROUTE', routeId: 'route-safest-fit' } as PlannerAction,
    ]);
    expect(base.activeView).toBe('pre-start');
    expect(base.selectedRouteId).toBe('route-safest-fit');

    // START_ROUTE outside pre-start is ignored.
    const fromComparison = run(base, [{ type: 'BACK_TO_ROUTES' }, { type: 'START_ROUTE' }]);
    expect(fromComparison.activeView).toBe('comparison');

    // START_ROUTE from pre-start is the only path into the preview.
    const started = run(base, [{ type: 'START_ROUTE' }]);
    expect(started.activeView).toBe('active-preview');
  });

  it('pre-start back returns to comparison; preview change-route keeps the trip', () => {
    const base = run(createInitialPlannerState(), [
      { type: 'CONFIRM_CONTEXT' },
      { type: 'SET_DESTINATION', placeId: METRO } as PlannerAction,
      { type: 'COMPARE_ROUTES' },
      { type: 'COMPARISON_READY' },
      { type: 'CHOOSE_ROUTE', routeId: 'route-safest-fit' } as PlannerAction,
      { type: 'START_ROUTE' },
    ]);
    const changed = run(base, [{ type: 'CHANGE_ROUTE_FROM_PREVIEW' }]);
    expect(changed.activeView).toBe('comparison');
    expect(changed.selectedRouteId).toBe('route-safest-fit');

    const ended = run(base, [{ type: 'END_PREVIEW' }]);
    expect(ended.activeView).toBe('comparison');
  });

  it('adds a stop and announces the local detour', () => {
    const base = run(createInitialPlannerState(), [
      { type: 'CONFIRM_CONTEXT' },
      { type: 'SET_DESTINATION', placeId: METRO } as PlannerAction,
      { type: 'COMPARE_ROUTES' },
      { type: 'COMPARISON_READY' },
    ]);
    const after = run(base, [{ type: 'ADD_STOP', placeId: PHARMACY } as PlannerAction]);
    expect(after.stopIds).toEqual([PHARMACY]);
    expect(after.openPanel).toBe('none');
    expect(after.announcement).toMatch(/GreenCare Pharmacy added/);
    // Duplicate adds are ignored.
    const again = run(after, [{ type: 'ADD_STOP', placeId: PHARMACY } as PlannerAction]);
    expect(again.stopIds).toEqual([PHARMACY]);
  });

  it('removes a stop with undo and restores the order', () => {
    const base = run(createInitialPlannerState(), [
      { type: 'ADD_STOP', placeId: PHARMACY } as PlannerAction,
      { type: 'ADD_STOP', placeId: CAFE } as PlannerAction,
    ]);
    const removed = run(base, [{ type: 'REMOVE_STOP', index: 0 }]);
    expect(removed.stopIds).toEqual([CAFE]);
    expect(removed.lastRemovedStop).toEqual({ placeId: PHARMACY, index: 0 });
    const undone = run(removed, [{ type: 'UNDO_REMOVE_STOP' }]);
    expect(undone.stopIds).toEqual([PHARMACY, CAFE]);
    expect(undone.lastRemovedStop).toBeNull();
  });

  it('reorders stops and announces the +2 min change on the selected route', () => {
    const base = run(createInitialPlannerState(), [
      { type: 'CONFIRM_CONTEXT' },
      { type: 'SET_DESTINATION', placeId: METRO } as PlannerAction,
      { type: 'COMPARE_ROUTES' },
      { type: 'COMPARISON_READY' },
      { type: 'SELECT_ROUTE', routeId: 'route-safest-fit' },
      { type: 'ADD_STOP', placeId: PHARMACY } as PlannerAction,
      { type: 'ADD_STOP', placeId: CAFE } as PlannerAction,
    ]);
    expect(base.stopIds).toEqual([PHARMACY, CAFE]);
    const moved = run(base, [{ type: 'MOVE_STOP', from: 0, to: 1 }]);
    expect(moved.stopIds).toEqual([CAFE, PHARMACY]);
    expect(moved.announcement).toBe(
      'Route updated for the new stop order · +2 min compared with the previous order.',
    );
  });

  it('edit trip returns to trip setup while keeping the trip', () => {
    const base = run(createInitialPlannerState(), [
      { type: 'CONFIRM_CONTEXT' },
      { type: 'SET_DESTINATION', placeId: METRO } as PlannerAction,
      { type: 'COMPARE_ROUTES' },
      { type: 'COMPARISON_READY' },
    ]);
    const edited = run(base, [{ type: 'EDIT_TRIP' }]);
    expect(edited.activeView).toBe('planner');
    expect(edited.originId).toBe(LIBRARY);
    expect(edited.destinationId).toBe(METRO);
  });

  it('resets the comparison when the destination changes', () => {
    const base = run(createInitialPlannerState(), [
      { type: 'CONFIRM_CONTEXT' },
      { type: 'SET_DESTINATION', placeId: METRO } as PlannerAction,
      { type: 'COMPARE_ROUTES' },
      { type: 'COMPARISON_READY' },
    ]);
    const changed = run(base, [
      { type: 'SET_DESTINATION', placeId: 'place-central-market' } as PlannerAction,
    ]);
    expect(changed.comparisonStatus).toBe('idle');
    expect(changed.selectedRouteId).toBeNull();
    expect(changed.activeView).toBe('planner');
  });

  it('toggles preference chips independently', () => {
    let state = createInitialPlannerState();
    state = plannerReducer(state, { type: 'TOGGLE_PREFERENCE', key: 'wellLit' } as PlannerAction);
    expect(state.preferences.wellLit).toBe(true);
    state = plannerReducer(state, { type: 'TOGGLE_PREFERENCE', key: 'womenFocused' } as PlannerAction);
    expect(state.preferences.womenFocused).toBe(true);
    expect(state.preferences.wellLit).toBe(true);
    state = plannerReducer(state, { type: 'TOGGLE_PREFERENCE', key: 'wellLit' } as PlannerAction);
    expect(state.preferences.wellLit).toBe(false);
  });

  it('opens and closes panels while preserving route selection', () => {
    const base = run(createInitialPlannerState(), [
      { type: 'CONFIRM_CONTEXT' },
      { type: 'SET_DESTINATION', placeId: METRO } as PlannerAction,
      { type: 'COMPARE_ROUTES' },
      { type: 'COMPARISON_READY' },
      { type: 'SELECT_ROUTE', routeId: 'route-safest-fit' },
    ]);
    const evidence = run(base, [{ type: 'OPEN_PANEL', panel: 'evidence' }]);
    expect(evidence.openPanel).toBe('evidence');
    expect(evidence.evidenceRouteId).toBe('route-safest-fit');
    expect(evidence.selectedRouteId).toBe('route-safest-fit');
    const closed = run(evidence, [{ type: 'CLOSE_PANEL' }]);
    expect(closed.openPanel).toBe('none');
    expect(closed.selectedRouteId).toBe('route-safest-fit');
  });

  it('opens evidence for a specific route from a card', () => {
    const after = run(createInitialPlannerState(), [
      { type: 'OPEN_PANEL', panel: 'evidence', routeId: 'route-cleanest' },
    ]);
    expect(after.evidenceRouteId).toBe('route-cleanest');
  });
});
