import Icon from '../shared/Icon';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import BrandMark from '../shared/BrandMark';
import type { InstallSupport } from '../../hooks/usePwaInstall';

type InstallHelpPanelProps = {
  open: boolean;
  support: InstallSupport;
  onInstall: () => void;
  onClose: () => void;
};

/**
 * Install help. Adapts to the browser: a real install prompt when
 * available, running-in-standalone confirmation, or manual instructions —
 * never a broken install button or a blocking modal on load.
 */
export default function InstallHelpPanel({ open, support, onInstall, onClose }: InstallHelpPanelProps) {
  const panelRef = useFocusTrap<HTMLDivElement>(open, onClose);
  if (!open) return null;

  return (
    <div className="overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="install-help-title"
        className="overlay__panel overlay__panel--sheet"
      >
        <header className="overlay__header">
          <h2 id="install-help-title">
            <Icon name="install" size={20} />
            Install Raah
          </h2>
          <button type="button" className="btn btn--icon" aria-label="Close install help" onClick={onClose}>
            <Icon name="close" size={18} />
          </button>
        </header>

        {support === 'available' ? (
          <div className="install-body">
            <div className="install-body__hero">
              <BrandMark size={48} />
              <p>
                Your browser supports installing Raah as an app with its own icon and window.
              </p>
            </div>
            <button type="button" className="btn btn--primary btn--large" onClick={onInstall}>
              <Icon name="install" size={18} />
              Install Raah
            </button>
            <p className="install-body__note">
              Installing is optional. Raah also works fully as a normal web page, online or
              offline.
            </p>
          </div>
        ) : support === 'standalone' ? (
          <div className="install-body">
            <p>
              <Icon name="check" size={18} />
              Raah is installed and running in standalone mode.
            </p>
          </div>
        ) : (
          <div className="install-body">
            <p className="install-body__unsupported">
              <Icon name="info" size={18} />
              Raah works in your browser. Installation is not available in this browser.
            </p>
            <div className="install-body__steps">
              <h3>How to install manually (where supported)</h3>
              <ol>
                <li>Chrome / Edge (desktop): look for the install icon in the address bar.</li>
                <li>Android Chrome: open the browser menu and choose “Install app” or “Add to Home screen”.</li>
                <li>iOS Safari: tap Share, then “Add to Home Screen”.</li>
              </ol>
            </div>
            <p className="install-body__note">
              Raah keeps working as a regular web page without installation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
