import { useState } from 'react';
import Icon from '../shared/Icon';
import BrandMark from '../shared/BrandMark';
import { DEMO_TRIP } from '../../data/demo-trip';
import { ORIGIN_SUGGESTION_IDS, getPlace } from '../../data/places';

type ContextHandoffSheetProps = {
  onConfirm: () => void;
  onChangeOrigin: (placeId: string) => void;
  onDismiss: () => void;
};

/**
 * Calm confirmation sheet for the detected walking context. None of the
 * actions start navigation — "Use as starting point" only fills the origin.
 */
export default function ContextHandoffSheet({
  onConfirm,
  onChangeOrigin,
  onDismiss,
}: ContextHandoffSheetProps) {
  const [changing, setChanging] = useState(false);
  const suggested = getPlace(DEMO_TRIP.detectedContext.originId);

  return (
    <section className="context-sheet" aria-labelledby="context-sheet-title">
      <div className="context-sheet__map" aria-hidden="true">
        <svg viewBox="0 0 320 110" className="context-sheet__map-svg">
          <rect x="0" y="0" width="320" height="110" rx="12" fill="#f9a46f" />
          <g stroke="#ffffff" strokeWidth="5" strokeLinecap="round">
            <path d="M-10 82 H330" />
            <path d="M150 -10 V120" />
            <path d="M240 -10 V120" />
          </g>
          <g stroke="#ffffff" strokeWidth="2.5">
            <path d="M-10 44 H330" />
            <path d="M60 -10 V120" />
          </g>
          {/* Building with lit exit */}
          <rect x="96" y="18" width="72" height="46" rx="6" fill="#ffd9a3" stroke="#202124" strokeOpacity="0.18" />
          <rect x="126" y="64" width="14" height="12" rx="2" fill="#ffc52e" />
          <circle cx="133" cy="82" r="7" fill="#fff8e9" stroke="#23864a" strokeWidth="2" />
          <path
            d="M133 82 C 170 82, 185 60, 214 58 S 268 52, 286 50"
            fill="none"
            stroke="var(--raah-route-blue)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray="1 6"
          />
          <circle cx="286" cy="50" r="6" fill="var(--raah-route-blue)" />
          <text x="204" y="100" fontSize="9" fill="#7a4517" textAnchor="middle" fontWeight="600">
            College Road
          </text>
          <text x="168" y="14" fontSize="9" fill="#7a4517" textAnchor="middle" fontWeight="600">
            {suggested.name}
          </text>
        </svg>
      </div>
      <div className="context-sheet__body">
        <div className="context-sheet__heading">
          <BrandMark size={28} />
          <h2 id="context-sheet-title">{DEMO_TRIP.detectedContext.sentence}</h2>
        </div>
        <p className="context-sheet__detail">
          {DEMO_TRIP.detectedContext.detail}
        </p>
        {!changing ? (
          <div className="context-sheet__actions">
            <button type="button" className="btn btn--primary" onClick={onConfirm}>
              <Icon name="check" size={18} />
              Use as starting point
            </button>
            <button type="button" className="btn btn--secondary" onClick={() => setChanging(true)}>
              Change
            </button>
            <button type="button" className="btn btn--ghost" onClick={onDismiss}>
              Not now
            </button>
          </div>
        ) : (
          <div className="context-sheet__change">
            <p className="context-sheet__change-label" id="context-origin-label">
              Suggested starting point:
            </p>
            <ul className="suggestion-list" aria-labelledby="context-origin-label">
              {ORIGIN_SUGGESTION_IDS.map((placeId) => {
                const place = getPlace(placeId);
                return (
                  <li key={place.id}>
                    <button
                      type="button"
                      className="suggestion-row"
                      onClick={() => {
                        onChangeOrigin(place.id);
                      }}
                    >
                      <Icon name="pin" size={18} />
                      <span>{place.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <button type="button" className="btn btn--ghost" onClick={() => setChanging(false)}>
              Back
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
