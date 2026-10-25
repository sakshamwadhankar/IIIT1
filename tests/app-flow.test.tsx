import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, within, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/app/App';
import { createInitialPlannerState } from '../src/hooks/usePlannerState';

/**
 * Integration test for the exact demo path (TRD §17 browser smoke test):
 * open → destination → Safety-first + well-lit +
 * avoid nightlife → compare 5 routes → evidence → add GreenCare Pharmacy →
 * reorder → choose route → start preview.
 */

const METRO = /Indiranagar Metro Gate 3/i;

async function startComparison(user: ReturnType<typeof userEvent.setup>) {
  const destinationField = screen.getByRole('button', {
    name: /Destination — Select a destination/i,
  });
  await user.click(destinationField);
  await user.click(screen.getByRole('button', { name: METRO }));

  await user.click(screen.getByRole('radio', { name: /Safest fit/i }));
  await user.click(screen.getByRole('button', { name: 'Prefer well-lit streets' }));
  await user.click(screen.getByRole('button', { name: 'Avoid nightlife clusters' }));

  await user.click(screen.getByRole('button', { name: /^Compare routes$/i }));
}

describe('Raah demo flow', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  it('launches the branded shell without starting navigation', () => {
    render(<App />);
    expect(screen.getAllByRole('img', { name: 'Raah' }).length).toBeGreaterThanOrEqual(1);
    // The home greeting shows and navigation never starts by itself.
    expect(screen.getByText(/What’s the mood today/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /End preview/i })).toBeNull();
  });

  it('preselects the current location as the starting point', () => {
    render(<App />);
    expect(
      screen.getByRole('button', { name: /Starting point — Current location/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Compare routes$/i })).toBeDisabled();
    expect(screen.getByText(/Choose a destination to compare routes/i)).toBeInTheDocument();
  });

  it('runs the complete demo path end to end', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Steps 1–4: confirm context, destination, preferences.
    await startComparison(user);

    // Step 5: five route cards, recommended first.
    const viewEvidenceButtons = await screen.findAllByRole('button', { name: /View evidence/i });
    expect(viewEvidenceButtons).toHaveLength(5);
    expect(screen.getAllByRole('button', { name: /Choose route/i })).toHaveLength(5);
    // The safest fit is recommended under the selected preferences.
    const firstCard = viewEvidenceButtons[0].closest('article');
    expect(firstCard).not.toBeNull();
    expect(within(firstCard as HTMLElement).getByText(/Recommended for your preferences/i)).toBeInTheDocument();
    expect(within(firstCard as HTMLElement).getByText('Safest fit')).toBeInTheDocument();

    // Step 6: trade-off lines visible without opening details. The trade-off
    // sentence and the caveat line both carry the key phrases.
    expect(screen.getAllByText(/2 min slower than the fastest option/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/₹70 cheaper than the direct cab/i).length).toBeGreaterThanOrEqual(1);

    // Step 7: evidence drawer opens with timestamps and demo sources, closes with Escape.
    await user.click(viewEvidenceButtons[0]);
    const dialog = screen.getByRole('dialog', { name: /College Road lit loop/i });
    expect(within(dialog).getByText(/Raah is a planning aid/i)).toBeInTheDocument();
    expect(within(dialog).getAllByText(/City traffic feed/i).length).toBeGreaterThan(0);
    expect(within(dialog).getAllByText(/Place checks/i).length).toBeGreaterThan(0);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog', { name: /College Road lit loop/i })).toBeNull();

    // Step 8: add GreenCare Pharmacy with a detour preview.
    const stopsSection = screen.getByRole('region', { name: /Trip stops/i });
    await user.click(within(stopsSection).getByRole('button', { name: /Add stop/i }));
    const stopDialog = screen.getByRole('dialog', { name: /Add a stop/i });
    await user.click(within(stopDialog).getByRole('button', { name: /GreenCare Pharmacy/i }));
    expect(within(stopDialog).getByText(/Detour: \+6 min/i)).toBeInTheDocument();
    await user.click(within(stopDialog).getByRole('button', { name: /^Add stop$/i }));
    expect(screen.queryByRole('dialog', { name: /Add a stop/i })).toBeNull();

    // Totals update locally: 32 + 6 = 38 min on the safest-fit card.
    expect(await screen.findByText('38 min')).toBeInTheDocument();

    // Step 9: add a second stop, then reorder with the accessible controls.
    await user.click(within(stopsSection).getByRole('button', { name: /Add stop/i }));
    const stopDialog2 = screen.getByRole('dialog', { name: /Add a stop/i });
    await user.click(within(stopDialog2).getByRole('button', { name: /Corner Café/i }));
    await user.click(within(stopDialog2).getByRole('button', { name: /^Add stop$/i }));

    expect(await screen.findByText('40 min')).toBeInTheDocument(); // 32 + 4 + 4
    await user.click(
      within(stopsSection).getByRole('button', { name: 'Move GreenCare Pharmacy down' }),
    );
    // Reorder announcement: pharmacy moves later → +2 min.
    expect(await screen.findByText(/Route updated for the new stop order · \+2 min/i)).toBeInTheDocument();
    expect(await screen.findByText('42 min')).toBeInTheDocument(); // 32 + 4 + 6

    // Step 10: choose the recommended route.
    const firstCard2 = screen.getAllByRole('button', { name: /Choose route/i })[0];
    await user.click(firstCard2);

    // Step 11: pre-start confirmation — navigation does not start by itself.
    const preStart = await screen.findByText(/Ready when you are/i);
    expect(preStart).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Start route/i })).toBeInTheDocument();
    expect(screen.getByText(/Caution:/i)).toBeInTheDocument();

    // Step 12: explicit start → active preview.
    await user.click(screen.getByRole('button', { name: /Start route/i }));
    expect((await screen.findAllByText(/Active route preview/i)).length).toBeGreaterThan(0);
    expect(screen.getByText(/Current direction/i)).toBeInTheDocument();
    expect(screen.getByText(/Upcoming stop/i)).toBeInTheDocument();
    expect(screen.getByText(/Rain likely in 35–40 min/i)).toBeInTheDocument();
    expect(screen.getByText(/You are on the route you selected because/i)).toBeInTheDocument();

    // End the preview → back to comparison, trip intact.
    await user.click(screen.getByRole('button', { name: /End preview/i }));
    expect(await screen.findByRole('region', { name: /Trip stops/i })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /View evidence/i })).toHaveLength(5);
  });

  it('shows the no-perfect-match state and recovers when preferences conflict', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(
      screen.getByRole('button', { name: /Destination — Select a destination/i }),
    );
    await user.click(screen.getByRole('button', { name: METRO }));
    await user.click(screen.getByRole('button', { name: 'Avoid rain exposure' }));
    await user.click(screen.getByRole('button', { name: 'Reduce walking' }));
    await user.click(screen.getByRole('button', { name: /Compare routes/i }));

    expect(
      await screen.findByText(/No route matches every preference/i),
    ).toBeInTheDocument();

    // Recovery: remove one blocking preference.
    await user.click(screen.getByRole('button', { name: /Remove “Avoid rain exposure”/i }));
    expect(screen.queryByText(/No route matches every preference/i)).not.toBeInTheDocument();
  });

  it('keeps the fastest option available and clearly caveated', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(
      screen.getByRole('button', { name: /Destination — Select a destination/i }),
    );
    await user.click(screen.getByRole('button', { name: METRO }));
    // Fastest preference, no safety chips.
    await user.click(screen.getByRole('radio', { name: /Fastest/i }));
    await user.click(screen.getByRole('button', { name: /^Compare routes$/i }));

    const firstCard = (
      await screen.findAllByRole('button', { name: /View evidence/i })
    )[0].closest('article') as HTMLElement;
    expect(within(firstCard).getByText(/100 Feet Road direct cab/i)).toBeInTheDocument();
    expect(
      within(firstCard).getAllByText(/Passes one nightlife-heavy segment/i).length,
    ).toBeGreaterThanOrEqual(1);
  });
});

describe('refresh safety', () => {
  it('always restores the safe planner state', () => {
    const initial = createInitialPlannerState();
    expect(initial.activeView).toBe('planner');
    expect(initial.selectedRouteId).toBeNull();
    expect(initial.openPanel).toBe('none');
  });
});
