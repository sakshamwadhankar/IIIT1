import Icon from '../shared/Icon';
import type { NoPerfectMatchInfo } from '../../types/route';

type NoPerfectMatchStateProps = {
  info: NoPerfectMatchInfo;
  onRelax: (key: string) => void;
  onShowAll: () => void;
};

/**
 * Shown when no route satisfies every active preference. Routes stay
 * visible; the state explains the conflict and offers recovery actions.
 */
export default function NoPerfectMatchState({ info, onRelax, onShowAll }: NoPerfectMatchStateProps) {
  return (
    <div className="no-perfect-match" role="alert">
      <p className="no-perfect-match__title">
        <Icon name="info" size={18} />
        {info.message}
      </p>
      <div className="no-perfect-match__actions">
        {info.suggestions.map((suggestion) => (
          <button
            key={suggestion.key}
            type="button"
            className="btn btn--secondary btn--small"
            onClick={() => onRelax(suggestion.key)}
          >
            Remove “{suggestion.label}”
          </button>
        ))}
        <button type="button" className="btn btn--ghost btn--small" onClick={onShowAll}>
          Show all routes
        </button>
      </div>
      <p className="no-perfect-match__note">
        The closest options are shown below with their trade-offs. Nothing is filtered out.
      </p>
    </div>
  );
}
