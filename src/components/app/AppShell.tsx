import type { ReactNode } from 'react';
import BrandMark from '../shared/BrandMark';
import Icon from '../shared/Icon';

type AppShellProps = {
  /** One-line trip state for the header, e.g. "Planning · North Campus Library → Metro Gate 3". */
  tripState: string;
  offline: boolean;
  installSupport: 'available' | 'standalone' | 'inbrowser' | 'unknown';
  onOpenInstallHelp: () => void;
  children: ReactNode;
};

/**
 * The app-like Raah shell: branded header, demo status, install access,
 * and a persistent accessibility disclaimer in the footer.
 */
export default function AppShell({
  tripState,
  offline,
  installSupport,
  onOpenInstallHelp,
  children,
}: AppShellProps) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__brand">
          <BrandMark size={36} />
          <div className="app-header__names">
            <p className="app-header__name">Raah</p>
            <p className="app-header__tagline">Choose the route that fits you.</p>
          </div>
        </div>
        <div className="app-header__status">
          <span className="status-chip" title="All route data in Raah is synthetic and works offline.">
            <Icon name="info" size={14} />
            Synthetic demo data · Offline-ready
          </span>
          {offline ? (
            <span className="status-chip status-chip--offline">
              <Icon name="offline" size={14} />
              Offline
            </span>
          ) : null}
          <span className="status-chip status-chip--clock">
            <Icon name="clock" size={14} />
            Demo time
          </span>
          <button type="button" className="btn btn--header" onClick={onOpenInstallHelp}>
            <Icon name="install" size={16} />
            {installSupport === 'standalone' ? 'Installed' : 'Install app'}
          </button>
        </div>
        <p className="app-header__trip-state">{tripState}</p>
      </header>

      <main className="app-main" id="main-content">
        {children}
      </main>

      <footer className="app-footer">
        <p>
          Raah is a planning aid. Route signals are synthetic demo data and do not guarantee
          personal safety. No account, GPS, or network connection is used in this prototype.
        </p>
      </footer>
    </div>
  );
}
