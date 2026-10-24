import Icon from '../shared/Icon';

/** Non-blocking offline/demo banner. The route flow continues to work. */
export default function OfflineBanner({ offline }: { offline: boolean }) {
  return (
    <div className={`offline-banner ${offline ? 'offline-banner--offline' : ''}`} role="status">
      <Icon name={offline ? 'offline' : 'info'} size={16} />
      {offline
        ? 'Offline demo mode: showing synthetic local data.'
        : 'You’re viewing synthetic demo data. Live updates are not connected in this prototype.'}
    </div>
  );
}
