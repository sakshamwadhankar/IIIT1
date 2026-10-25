import type { ReactNode } from 'react';
import BrandMark from '../shared/BrandMark';
import Icon from '../shared/Icon';
import { useTiltParallax } from '../../hooks/useTiltParallax';

type AppShellProps = {
  installSupport: 'available' | 'standalone' | 'inbrowser' | 'unknown';
  onOpenInstallHelp: () => void;
  children: ReactNode;
};

/**
 * The app shell: no top bar — just the route mark pinned in a corner —
 * and a footer that carries the install action and the planning-aid
 * disclaimer. Tilt parallax starts enabled automatically.
 */
export default function AppShell({
  installSupport,
  onOpenInstallHelp,
  children,
}: AppShellProps) {
  const tilt = useTiltParallax();
  return (
    <div className="app-shell">
      <BrandMark size={38} variant="mono" className="corner-logo" />
      <main className="app-main" id="main-content">
        {children}
      </main>
      <footer className="app-footer">
        <div className="app-footer__actions">
          {tilt.support !== 'unavailable' && !tilt.enabled ? (
            <button
              type="button"
              className="btn btn--ghost btn--small"
              onClick={tilt.toggle}
              title="Tilt your phone or move your mouse to see the interface in 3D. Optional — all features work without it."
            >
              <Icon name="route" size={15} />
              Enable tilt
            </button>
          ) : null}
          <button type="button" className="btn btn--ghost btn--small" onClick={onOpenInstallHelp}>
            <Icon name="install" size={15} />
            {installSupport === 'standalone' ? 'Installed' : 'Install app'}
          </button>
        </div>
        <p>
          Raah is a planning aid. Route signals are illustrative and do not guarantee personal
          safety. No account, GPS, or network connection is used.
        </p>
      </footer>
    </div>
  );
}
