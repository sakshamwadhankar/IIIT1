import Icon from '../shared/Icon';

/** Non-blocking offline banner. The route flow continues to work. */
export default function OfflineBanner({ offline }: { offline: boolean }) {
  return (
    <div className={`offline-banner ${offline ? 'offline-banner--offline' : ''}`} role="status">
      <Icon name={offline ? 'offline' : 'info'} size={16} />
      {offline
        ? 'You’re offline — showing information already on this device.'
        : 'Live updates are not connected. Route information is illustrative.'}
    </div>
  );
}
