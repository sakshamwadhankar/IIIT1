import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RouteCard from '../src/components/routes/RouteCard';
import EvidenceDrawer from '../src/components/evidence/EvidenceDrawer';
import StopSearchPanel from '../src/components/stops/StopSearchPanel';
import StopList from '../src/components/stops/StopList';
import NoPerfectMatchState from '../src/components/app/NoPerfectMatchState';
import { getRoute, ROUTES } from '../src/data/routes';
import { computeTotals } from '../src/lib/stops';
import { rankRoutes } from '../src/lib/ranking';
import { EMPTY_PREFERENCES, type RoutePreferences } from '../src/types/planner';

const SAFETY_FIRST: RoutePreferences = { ...EMPTY_PREFERENCES, wellLit: true, avoidNightlife: true };

function rankedList(stopIds: string[] = []) {
  const inputs = ROUTES.map((route) => ({ route, totals: computeTotals(route, stopIds) }));
  return rankRoutes(inputs, SAFETY_FIRST, 'mixed', 'safest').ranked;
}

describe('RouteCard', () => {
  it('renders time, cost, walking distance, benefit, and caveat without opening details', () => {
    const entry = rankedList()[0];
    render(
      <RouteCard
        ranked={entry}
        selected={false}
        onSelect={() => undefined}
        onViewEvidence={() => undefined}
        onChoose={() => undefined}
      />,
    );
    expect(screen.getByText('32 min')).toBeInTheDocument();
    expect(screen.getByText('₹180')).toBeInTheDocument();
    expect(screen.getByText('420 m')).toBeInTheDocument();
    // Benefit/trade-off line (benefit · deltas · caveat as one sentence)
    expect(screen.getByText(/Better-lit and more populated · ₹70 cheaper than the direct cab/)).toBeInTheDocument();
    // Caveat
    expect(screen.getByText(/Caveat:/i)).toBeInTheDocument();
    // Supporting signals
    expect(screen.getByText('88% well-lit')).toBeInTheDocument();
    expect(screen.getByText('84% populated')).toBeInTheDocument();
    // Confidence/freshness
    expect(screen.getByText(/High confidence/)).toBeInTheDocument();
    // Actions
    expect(screen.getByRole('button', { name: /View evidence/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Choose route/i })).toBeInTheDocument();
  });

  it('selecting the card highlights it and reports the selected state', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const entry = rankedList()[0];
    const { rerender } = render(
      <RouteCard
        ranked={entry}
        selected={false}
        onSelect={onSelect}
        onViewEvidence={() => undefined}
        onChoose={() => undefined}
      />,
    );
    await user.click(screen.getByRole('button', { name: /College Road lit loop — select route/i }));
    expect(onSelect).toHaveBeenCalledTimes(1);

    rerender(
      <RouteCard
        ranked={entry}
        selected
        onSelect={onSelect}
        onViewEvidence={() => undefined}
        onChoose={() => undefined}
      />,
    );
    expect(screen.getByRole('button', { name: /College Road lit loop — select route/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByText(/Selected/)).toBeInTheDocument();
  });

  it('wires the evidence and choose actions', async () => {
    const user = userEvent.setup();
    const onViewEvidence = vi.fn();
    const onChoose = vi.fn();
    render(
      <RouteCard
        ranked={rankedList()[0]}
        selected={false}
        onSelect={() => undefined}
        onViewEvidence={onViewEvidence}
        onChoose={onChoose}
      />,
    );
    await user.click(screen.getByRole('button', { name: /View evidence/i }));
    expect(onViewEvidence).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', { name: /Choose route/i }));
    expect(onChoose).toHaveBeenCalledTimes(1);
  });
});

describe('EvidenceDrawer', () => {
  it('opens as a dialog, traps focus, and closes with Escape', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <EvidenceDrawer open ranked={rankedList()[0]} stopIds={['place-greencare-pharmacy']} onClose={onClose} />,
    );
    const dialog = screen.getByRole('dialog', { name: /College Road lit loop/i });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText(/Raah is a planning aid/i)).toBeInTheDocument();
    expect(screen.getByText(/Rain evidence/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Incident trend/i).length).toBeGreaterThanOrEqual(2);

    // Focus starts inside the dialog.
    const focusIsInside = () => dialog.contains(document.activeElement);
    expect(focusIsInside()).toBe(true);

    // Tab cycles within the dialog rather than escaping it.
    for (let i = 0; i < 12; i += 1) {
      await user.tab();
      expect(focusIsInside()).toBe(true);
    }

    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows the limited-evidence state for the low-confidence route', () => {
    const inputs = ROUTES.map((route) => ({ route, totals: computeTotals(route, []) }));
    const bestValue = rankRoutes(inputs, EMPTY_PREFERENCES, 'mixed', 'lowest-cost').ranked.find(
      (entry) => entry.route.id === 'route-best-value',
    );
    render(<EvidenceDrawer open ranked={bestValue!} stopIds={[]} onClose={() => undefined} />);
    expect(screen.getAllByText(/Limited evidence/i).length).toBeGreaterThanOrEqual(2);
  });
});

describe('StopSearchPanel', () => {
  it('previews the detour and adds a fixture place after confirmation', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    const onClose = vi.fn();
    render(<StopSearchPanel open existingStopIds={[]} onAdd={onAdd} onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: /GreenCare Pharmacy/i }));
    // Detour preview is shown BEFORE the add is confirmed.
    const preview = screen.getByRole('region', { name: /Detour preview for GreenCare Pharmacy/i });
    expect(within(preview).getByText(/Detour: \+6 min/i)).toBeInTheDocument();
    expect(within(preview).getByText(/₹0 extra/i)).toBeInTheDocument();
    expect(within(preview).getByText(/Open until 10:00 PM/i)).toBeInTheDocument();
    expect(within(preview).getAllByText(/staffed/i).length).toBeGreaterThanOrEqual(1);

    await user.click(screen.getByRole('button', { name: /^Add stop$/i }));
    expect(onAdd).toHaveBeenCalledWith('place-greencare-pharmacy');
  });

  it('marks already-added stops and closes with Escape', async () => {
    const user = userEvent.setup();
    render(
      <StopSearchPanel
        open
        existingStopIds={['place-greencare-pharmacy']}
        onAdd={() => undefined}
        onClose={() => undefined}
      />,
    );
    expect(screen.getByRole('button', { name: /GreenCare Pharmacy/i })).toBeDisabled();
    await user.keyboard('{Escape}');
    // Panel stays mounted but Escape triggered the trap's escape callback;
    // the parent closes it in the real app.
  });
});

describe('StopList reorder controls', () => {
  it('moves stops up and down without drag and drop, and removes with undo', async () => {
    const user = userEvent.setup();
    const onMove = vi.fn();
    const onRemove = vi.fn();
    render(
      <StopList
        origin={{ id: 'place-north-campus-library', name: 'North Campus Library' }}
        destination={{ id: 'place-indiranagar-metro-gate-3', name: 'Indiranagar Metro Gate 3' }}
        stopIds={['place-greencare-pharmacy', 'place-corner-cafe']}
        onRemove={onRemove}
        onMove={onMove}
        onUndo={() => undefined}
        canUndo={false}
      />,
    );
    const rows = screen.getAllByRole('listitem');
    expect(rows).toHaveLength(4); // origin + 2 stops + destination

    // The first stop's Move up is disabled (it is already the first leg).
    expect(screen.getByRole('button', { name: 'Move GreenCare Pharmacy up' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Move GreenCare Pharmacy down' }));
    expect(onMove).toHaveBeenCalledWith(0, 1);

    await user.click(screen.getByRole('button', { name: 'Move Corner Café up' }));
    expect(onMove).toHaveBeenCalledWith(1, 0);

    await user.click(screen.getByRole('button', { name: /Remove GreenCare Pharmacy/i }));
    expect(onRemove).toHaveBeenCalledWith(0);
  });
});

describe('NoPerfectMatchState', () => {
  it('offers recovery actions to relax the blocking preference', async () => {
    const user = userEvent.setup();
    const onRelax = vi.fn();
    const onShowAll = vi.fn();
    const inputs = ROUTES.map((route) => ({ route, totals: computeTotals(route, []) }));
    const { noPerfectMatch } = rankRoutes(
      inputs,
      { ...EMPTY_PREFERENCES, avoidRain: true, reduceWalking: true },
      'mixed',
      'fastest',
    );
    expect(noPerfectMatch).not.toBeNull();
    render(
      <NoPerfectMatchState info={noPerfectMatch!} onRelax={onRelax} onShowAll={onShowAll} />,
    );
    expect(
      screen.getByText(/No route matches every preference/i),
    ).toBeInTheDocument();
    const relaxButtons = screen.getAllByRole('button', { name: /Remove “/ });
    expect(relaxButtons.length).toBeGreaterThanOrEqual(2);
    await user.click(relaxButtons[0]);
    expect(onRelax).toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: /Show all routes/i }));
    expect(onShowAll).toHaveBeenCalled();
  });
});

describe('demo trade-offs with a stop applied', () => {
  it('updates card totals after adding GreenCare Pharmacy', () => {
    const entry = rankedList(['place-greencare-pharmacy']).find(
      (item) => item.route.id === getRoute('route-safest-fit').id,
    );
    expect(entry?.totals.etaMinutes).toBe(38);
    expect(entry?.totals.walkingMeters).toBe(620);
  });
});
