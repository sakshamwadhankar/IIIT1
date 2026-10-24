import { useState } from 'react';
import Icon from '../shared/Icon';
import { getPlace } from '../../data/places';

type StopListProps = {
  origin: { id: string; name: string } | null;
  destination: { id: string; name: string } | null;
  stopIds: string[];
  onRemove: (index: number) => void;
  onMove: (from: number, to: number) => void;
  onUndo: () => void;
  canUndo: boolean;
  /** Compact variant for the trip setup card. */
  compact?: boolean;
};

/**
 * Numbered, reorderable stop rows. Supports drag-and-drop AND explicit
 * Move up / Move down buttons (the accessible non-drag alternative).
 * Removing shows an inline Undo instead of a blocking dialog.
 */
export default function StopList({
  origin,
  destination,
  stopIds,
  onRemove,
  onMove,
  onUndo,
  canUndo,
  compact = false,
}: StopListProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const rows: Array<{ key: string; name: string; kind: 'origin' | 'stop' | 'destination'; index: number }> = [];
  if (origin) rows.push({ key: origin.id, name: origin.name, kind: 'origin', index: -1 });
  stopIds.forEach((placeId, index) => {
    rows.push({ key: placeId, name: getPlace(placeId).name, kind: 'stop', index });
  });
  if (destination) rows.push({ key: destination.id, name: destination.name, kind: 'destination', index: -1 });

  if (!origin && !destination && stopIds.length === 0) {
    return (
      <p className="stop-list__empty">
        Stops appear here after you pick a starting point and destination.{' '}
        {canUndo ? (
          <button type="button" className="btn btn--ghost btn--small" onClick={onUndo}>
            Undo remove
          </button>
        ) : null}
      </p>
    );
  }

  return (
    <div className={`stop-list ${compact ? 'stop-list--compact' : ''}`}>
      <ol className="stop-list__rows" aria-label="Trip stops">
        {rows.map((row, position) => {
          const isDragTarget = dragOverIndex === position && dragIndex !== null && dragIndex !== position;
          if (row.kind !== 'stop') {
            return (
              <li
                key={row.key}
                className={`stop-row stop-row--${row.kind}`}
                aria-label={`${row.name} (${row.kind === 'origin' ? 'starting point' : 'final destination'})`}
              >
                <span className="stop-row__number" aria-hidden="true">
                  {position + 1}
                </span>
                <span className="stop-row__name">{row.name}</span>
                <span className="stop-row__tag">{row.kind === 'origin' ? 'Start' : 'Destination'}</span>
              </li>
            );
          }
          return (
            <li
              key={`${row.key}-${row.index}`}
              className={`stop-row stop-row--stop ${isDragTarget ? 'stop-row--drop-target' : ''} ${
                dragIndex === row.index ? 'stop-row--dragging' : ''
              }`}
              draggable
              onDragStart={(event) => {
                setDragIndex(row.index);
                event.dataTransfer.effectAllowed = 'move';
                try {
                  event.dataTransfer.setData('text/plain', String(row.index));
                } catch {
                  /* Some engines disallow setData during synthetic events. */
                }
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setDragOverIndex(position);
              }}
              onDragLeave={() => setDragOverIndex(null)}
              onDrop={(event) => {
                event.preventDefault();
                if (dragIndex !== null) {
                  onMove(dragIndex, row.index);
                }
                setDragIndex(null);
                setDragOverIndex(null);
              }}
              onDragEnd={() => {
                setDragIndex(null);
                setDragOverIndex(null);
              }}
            >
              <span className="stop-row__grip" aria-hidden="true">
                <Icon name="grip" size={16} />
              </span>
              <span className="stop-row__number" aria-hidden="true">
                {position + 1}
              </span>
              <span className="stop-row__name">{row.name}</span>
              <span className="stop-row__controls">
                <button
                  type="button"
                  className="btn btn--icon"
                  disabled={row.index === 0}
                  aria-label={`Move ${row.name} up`}
                  onClick={() => onMove(row.index, row.index - 1)}
                >
                  <Icon name="chevron-up" size={16} />
                </button>
                <button
                  type="button"
                  className="btn btn--icon"
                  disabled={row.index === stopIds.length - 1}
                  aria-label={`Move ${row.name} down`}
                  onClick={() => onMove(row.index, row.index + 1)}
                >
                  <Icon name="chevron-down" size={16} />
                </button>
                <button
                  type="button"
                  className="btn btn--icon btn--icon-danger"
                  aria-label={`Remove ${row.name}`}
                  onClick={() => onRemove(row.index)}
                >
                  <Icon name="close" size={16} />
                </button>
              </span>
            </li>
          );
        })}
      </ol>
      {canUndo ? (
        <p className="stop-list__undo">
          <span role="status">Stop removed.</span>
          <button type="button" className="btn btn--secondary btn--small" onClick={onUndo}>
            Undo
          </button>
        </p>
      ) : null}
      {stopIds.length > 1 ? (
        <p className="stop-list__hint">Drag a row, or use the up and down buttons, to reorder.</p>
      ) : null}
    </div>
  );
}
