import { useState } from 'react';
import Icon from '../shared/Icon';
import BrandMark from '../shared/BrandMark';
import { DEMO_TRIP } from '../../data/demo-trip';
import { ORIGIN_SUGGESTION_IDS, getPlace } from '../../data/places';

type ContextHandoffSheetProps = {
  demoClock: string;
  onConfirm: () => void;
  onChangeOrigin: (placeId: string) => void;
  onDismiss: () => void;
};

/**
 * Calm confirmation sheet for the detected walking context. None of the
 * actions start navigation — "Use as starting point" only fills the origin.
 */
export default function ContextHandoffSheet({
  demoClock,
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
          <rect x="0" y="0" width="320" height="110" rx="12" fill="#eef1fa" />
          <g stroke="#d5dbeb" strokeWidth="5" strokeLinecap="round">
            <path d="M-10 82 H330" />
            <path d="M150 -10 V120" />
            <path d="M240 -10 V120" />
          </g>
          <g stroke="#d5dbeb" strokeWidth="2.5">
            <path d="M-10 44 H330" />
            <path d="M60 -10 V120" />
          </g>
          {/* Building with lit exit */}
          <rect x="96" y="18" width="72" height="46" rx="6" fill="#c9d1ea" />
          <rect x="126" y="64" width="14" height="12" rx="2" fill="#f4c95d" />
          <circle cx="133" cy="82" r="7" fill="var(--raah-mint-300)" stroke="#0f766e" strokeWidth="2" />
          <path
            d="M133 82 C 170 82, 185 60, 214 58 S 268 52, 286 50"
            fill="none"
            stroke="var(--raah-indigo-700)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray="1 6"
          />
          <circle cx="286" cy="50" r="6" fill="var(--raah-indigo-700)" />
          <text x="204" y="100" fontSize="9" fill="#5b6577" textAnchor="middle">
            College Road
          </text>
          <text x="168" y="14" fontSize="9" fill="#5b6577" textAnchor="middle">
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
          {DEMO_TRIP.detectedContext.detail} Demo time {demoClock}.
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
              Choose a demo starting point:
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
                      <span className="suggestion-row__meta">Demo place</span>
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
