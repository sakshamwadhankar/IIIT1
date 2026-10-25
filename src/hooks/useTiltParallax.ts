import { useCallback, useEffect, useRef, useState } from 'react';

export type TiltSupport = 'unavailable' | 'needs-permission' | 'available' | 'pointer';

type TiltState = {
  support: TiltSupport;
  enabled: boolean;
  /** Explicit user gesture before any sensor permission is requested. */
  toggle: () => void;
};

/** Largest normalized tilt value; keeps parallax amplitude bounded. */
const MAX_TILT = 1;
/** Degrees of device tilt that map to a full −1..1 parallax swing —
    lower means the UI reacts more to smaller movements. */
const TILT_RANGE_DEG = 6;
/** Per-frame easing factor for the render loop (higher = snappier). */
const EASE = 0.22;

const clamp = (value: number) => Math.max(-MAX_TILT, Math.min(MAX_TILT, value));

function reducedMotionPreferred(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function detectSupport(): TiltSupport {
  if (typeof window === 'undefined' || reducedMotionPreferred()) return 'unavailable';
  if (!('DeviceOrientationEvent' in window)) return 'pointer';
  const ctor = window.DeviceOrientationEvent as unknown as {
    requestPermission?: () => Promise<'granted' | 'denied'>;
  };
  return typeof ctor.requestPermission === 'function' ? 'needs-permission' : 'available';
}

/**
 * Optional tilt-driven 3D parallax (design system §6). Nothing happens
 * until the user presses the "Enable tilt" control; core tasks never
 * depend on it.
 *
 * Writes eased --tilt-x/--tilt-y custom properties (range −1..1) on
 * <body>; CSS turns them into small per-layer perspective transforms —
 * the map, cards, panels, and buttons each at their own depth. When no
 * gyroscope is available (desktop, or an insecure context), a gentle
 * mouse-parallax fallback drives the same variables.
 */
export function useTiltParallax(): TiltState {
  const [support, setSupport] = useState<TiltSupport>('unavailable');
  const [enabled, setEnabled] = useState(false);
  const baselineRef = useRef<{ beta: number; gamma: number } | null>(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const frameRef = useRef<number | null>(null);

  const renderLoop = useCallback(() => {
    const current = currentRef.current;
    const target = targetRef.current;
    current.x += (target.x - current.x) * EASE;
    current.y += (target.y - current.y) * EASE;
    const settled =
      Math.abs(target.x - current.x) < 0.0005 && Math.abs(target.y - current.y) < 0.0005;
    if (settled) {
      current.x = target.x;
      current.y = target.y;
    }
    document.body.style.setProperty('--tilt-x', current.x.toFixed(4));
    document.body.style.setProperty('--tilt-y', current.y.toFixed(4));
    frameRef.current = settled ? null : requestAnimationFrame(renderLoop);
  }, []);

  const startLoop = useCallback(() => {
    if (frameRef.current === null) {
      frameRef.current = requestAnimationFrame(renderLoop);
    }
  }, [renderLoop]);

  const handleOrientation = useCallback(
    (event: DeviceOrientationEvent) => {
      if (event.beta === null || event.gamma === null) return;
      if (!baselineRef.current) {
        baselineRef.current = { beta: event.beta, gamma: event.gamma };
      }
      targetRef.current = {
        x: clamp((event.gamma - baselineRef.current.gamma) / TILT_RANGE_DEG),
        y: clamp((event.beta - baselineRef.current.beta) / TILT_RANGE_DEG),
      };
      // Compass heading: iOS exposes webkitCompassHeading (clockwise from
      // north); elsewhere derive it from alpha (counterclockwise).
      const webkit = event as DeviceOrientationEvent & { webkitCompassHeading?: number };
      let heading: number | null = null;
      if (typeof webkit.webkitCompassHeading === 'number') {
        heading = webkit.webkitCompassHeading;
      } else if (event.alpha !== null && event.alpha !== undefined) {
        heading = (360 - event.alpha) % 360;
      }
      if (heading !== null) {
        document.body.style.setProperty('--compass-heading', heading.toFixed(1));
      }
      startLoop();
    },
    [startLoop],
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      targetRef.current = {
        x: clamp((event.clientX / window.innerWidth) * 2 - 1),
        y: clamp((event.clientY / window.innerHeight) * 2 - 1),
      };
      startLoop();
    },
    [startLoop],
  );

  const detach = useCallback(() => {
    window.removeEventListener('deviceorientation', handleOrientation);
    window.removeEventListener('pointermove', handlePointerMove);
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    baselineRef.current = null;
    targetRef.current = { x: 0, y: 0 };
    currentRef.current = { x: 0, y: 0 };
    document.body.dataset.tilt = 'off';
    document.body.style.setProperty('--tilt-x', '0');
    document.body.style.setProperty('--tilt-y', '0');
    document.body.style.setProperty('--compass-heading', '0');
  }, [handleOrientation, handlePointerMove]);

  const attach = useCallback(() => {
    // Attach both sources: many desktop browsers expose the orientation
    // API but never fire it, so the mouse fallback must stay live. On
    // phones pointer events report pointerType 'touch' and are ignored.
    window.addEventListener('deviceorientation', handleOrientation);
    window.addEventListener('pointermove', handlePointerMove);
    document.body.dataset.tilt = 'on';
    startLoop();
  }, [handleOrientation, handlePointerMove, startLoop]);

  // Tilt starts enabled by default. attach() is idempotent (addEventListener
  // dedupes), so React StrictMode's double invoke is harmless. On iOS the
  // gestureless permission attempt rejects silently; the footer button
  // asks again on tap.
  useEffect(() => {
    const detected = detectSupport();
    setSupport(detected);
    if (detected === 'unavailable') return;
    if (detected === 'needs-permission') {
      const ctor = window.DeviceOrientationEvent as unknown as {
        requestPermission: () => Promise<'granted' | 'denied'>;
      };
      ctor
        .requestPermission()
        .then((answer) => {
          if (answer === 'granted') {
            attach();
            setEnabled(true);
          }
        })
        .catch(() => undefined);
      return;
    }
    attach();
    setEnabled(true);
  }, [attach]);


  const enable = useCallback(async () => {
    if (support === 'unavailable') return;
    if (support === 'needs-permission') {
      const ctor = window.DeviceOrientationEvent as unknown as {
        requestPermission: () => Promise<'granted' | 'denied'>;
      };
      try {
        const answer = await ctor.requestPermission();
        if (answer !== 'granted') {
          // Fall back to pointer parallax rather than nothing.
          setSupport('pointer');
          attach();
          setEnabled(true);
          return;
        }
      } catch {
        return;
      }
    }
    attach();
    setEnabled(true);
  }, [attach, support]);

  const toggle = useCallback(() => {
    if (enabled) {
      detach();
      setEnabled(false);
    } else {
      void enable();
    }
  }, [detach, enable, enabled]);

  useEffect(() => {
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      window.removeEventListener('pointermove', handlePointerMove);
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      document.body.dataset.tilt = 'off';
    };
  }, [handleOrientation, handlePointerMove]);

  return { support, enabled, toggle };
}
