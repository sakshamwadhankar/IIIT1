import { useEffect, useRef } from 'react';

type CompassProps = {
  /** Travel bearing in degrees: 0 = map north, clockwise. */
  bearingDeg: number;
  /** The next instruction shown under the arrow. */
  instruction: string;
};

const EASE = 0.2;

/** Eight-way compass word for a bearing in degrees. */
export function bearingWord(bearingDeg: number): string {
  const words = [
    'north',
    'north-east',
    'east',
    'south-east',
    'south',
    'south-west',
    'west',
    'north-west',
  ];
  return words[Math.round(((bearingDeg % 360) + 360) % 360 / 45) % 8];
}

/** Map-space bearing (x right, y down) between two points. */
export function bearingBetween(
  from: { x: number; y: number },
  to: { x: number; y: number },
): number {
  return (Math.atan2(to.x - from.x, -(to.y - from.y)) * 180) / Math.PI;
}

/**
 * 3D compass for the active-journey screen. The arrow points toward the
 * route bearing; with "Enable tilt" on, the gyroscope turns the dial so
 * the arrow shows the direction relative to how the phone is held, and
 * the disc tilts in 3D with the device. Reads the eased --tilt-x/--tilt-y
 * and raw --compass-heading custom properties written by the tilt hook —
 * no React re-renders per sensor frame.
 */
export default function Compass({ bearingDeg, instruction }: CompassProps) {
  const ringRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    let heading = 0;
    const tick = () => {
      const raw = Number.parseFloat(
        document.body.style.getPropertyValue('--compass-heading') || '0',
      );
      if (!Number.isNaN(raw)) {
        const delta = ((raw - heading + 540) % 360) - 180;
        heading = (heading + delta * EASE + 360) % 360;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `rotate(${-heading}deg)`;
      }
      if (arrowRef.current) {
        const rotation = (((bearingDeg - heading) % 360) + 360) % 360;
        arrowRef.current.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [bearingDeg]);

  return (
    <div className="compass">
      <div className="compass__disc" aria-hidden="true">
        <div className="compass__ring" ref={ringRef}>
          <span className="compass__cardinal compass__cardinal--n">N</span>
          <span className="compass__cardinal compass__cardinal--e">E</span>
          <span className="compass__cardinal compass__cardinal--s">S</span>
          <span className="compass__cardinal compass__cardinal--w">W</span>
          <span className="compass__tick compass__tick--ne" />
          <span className="compass__tick compass__tick--se" />
          <span className="compass__tick compass__tick--sw" />
          <span className="compass__tick compass__tick--nw" />
        </div>
        <div className="compass__arrow" ref={arrowRef}>
          <span className="compass__needle" />
        </div>
        <div className="compass__hub" />
      </div>
      <div className="compass__readout">
        <p className="compass__heading">Head {bearingWord(bearingDeg)}</p>
        <p className="compass__instruction">{instruction}</p>
        <p className="compass__hint">
          Enable tilt in the top bar to steer the arrow with your device.
        </p>
      </div>
    </div>
  );
}
