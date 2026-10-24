import Icon from '../shared/Icon';

/**
 * Limited/stale evidence state. The route stays usable; the UI explains
 * which signal is incomplete and when it was last refreshed.
 */
export default function StaleDataState({
  title = 'Limited evidence',
  body = 'This demo route has fewer recent signals. Review the available factors before choosing.',
  detail,
}: {
  title?: string;
  body?: string;
  detail?: string;
}) {
  return (
    <div className="stale-state" role="note">
      <p className="stale-state__title">
        <Icon name="alert" size={16} />
        {title}
      </p>
      <p className="stale-state__body">{body}</p>
      {detail ? <p className="stale-state__detail">{detail}</p> : null}
    </div>
  );
}
