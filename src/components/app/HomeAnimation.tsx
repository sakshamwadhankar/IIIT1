import { useEffect, useRef } from 'react';

/**
 * Animated home-screen scene, ported from the Blue Hero Commute Animator:
 * a rAF-driven character rig that auto-sequences pose → walk → run →
 * tuk-tuk → metro ("mixed trip") forever, with parallax city scrolling,
 * engine rattle, tunnel lights, and swaying straps. The stage is
 * transparent — it sits directly on the page canvas. Disabled entirely
 * under prefers-reduced-motion.
 */

const STORY_STAGES = ['pose', 'walk', 'run', 'tuktuk', 'metro'] as const;
const STAGE_DURATION = 4.5; // seconds per stage

export default function HomeAnimation() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    if (
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return; // static pose only
    }

    const q = (id: string) => svg.querySelector(`#${id}`) as SVGElement;
    const el = {
      charMaster: q('character-master-wrapper'),
      charRoot: q('character-root'),
      torso: q('rig-torso'),
      head: q('rig-head'),
      cape: q('rig-cape'),
      legL: q('rig-leg-l'),
      legR: q('rig-leg-r'),
      footL: q('foot-l-path'),
      poseArmL: q('pose-arm-l'),
      swingArmL: q('swing-arm-l'),
      poseArmR: q('pose-arm-r'),
      swingArmR: q('swing-arm-r'),
      wavingHand: q('waving-hand'),
      env: q('environment-layer'),
      city: q('city-group'),
      clouds: q('clouds-group'),
      speedLines: q('speed-lines'),
      groundLine: q('ground-line'),
      roadDashes: q('road-dashes'),
      tuktukBack: q('tuktuk-back-layer'),
      tuktukFront: q('tuktuk-front-layer'),
      chassis: q('tuktuk-chassis'),
      wheelR: q('tuktuk-wheel-r'),
      wheelF: q('tuktuk-wheel-f'),
      metroBack: q('metro-back-layer'),
      metroFront: q('metro-front-layer'),
      tunnelLights: q('tunnel-lights'),
      tuktukClipRect: q('char-in-tuktuk-rect'),
      smoke1: q('smoke-1'),
      straps: Array.from(svg.querySelectorAll('.metro-strap')) as SVGElement[],
    };

    let currentMode: (typeof STORY_STAGES)[number] = 'pose';
    let time = 0;
    let storyTimer = 0;
    let lastTimestamp = performance.now();
    let raf = 0;

    const setMode = (mode: (typeof STORY_STAGES)[number]) => {
      currentMode = mode;

      el.tuktukBack.setAttribute('display', mode === 'tuktuk' ? 'inline' : 'none');
      el.tuktukFront.setAttribute('display', mode === 'tuktuk' ? 'inline' : 'none');
      el.metroBack.setAttribute('display', mode === 'metro' ? 'inline' : 'none');
      el.metroFront.setAttribute('display', mode === 'metro' ? 'inline' : 'none');

      // Clip the character inside the vehicle windows.
      if (mode === 'tuktuk') {
        el.charMaster.setAttribute('clip-path', 'url(#char-in-tuktuk)');
      } else if (mode === 'metro') {
        el.charMaster.setAttribute('clip-path', 'url(#metro-window-clip)');
      } else {
        el.charMaster.removeAttribute('clip-path');
      }

      // Foot direction: pointing left in pose/metro, forward when moving.
      if (mode === 'pose' || mode === 'metro') {
        el.footL.setAttribute(
          'd',
          'M -24,160 L 24,160 L 24,180 L -38,180 C -43,180 -45,176 -42,174 Z',
        );
      } else {
        el.footL.setAttribute(
          'd',
          'M -24,160 L 24,160 L 42,174 C 45,176 43,180 38,180 L -24,180 Z',
        );
      }

      if (mode === 'pose') {
        el.poseArmL.setAttribute('display', 'inline');
        el.swingArmL.setAttribute('display', 'none');
        el.poseArmR.setAttribute('display', 'inline');
        el.swingArmR.setAttribute('display', 'none');
        el.env.setAttribute('opacity', '0');
        el.roadDashes.setAttribute('opacity', '0');
        el.groundLine.setAttribute('x1', '230');
        el.groundLine.setAttribute('x2', '560');
        el.groundLine.setAttribute('opacity', '1');
      } else if (mode === 'walk' || mode === 'run') {
        el.poseArmL.setAttribute('display', 'none');
        el.swingArmL.setAttribute('display', 'inline');
        el.poseArmR.setAttribute('display', 'none');
        el.swingArmR.setAttribute('display', 'inline');
        el.env.setAttribute('opacity', '1');
        el.roadDashes.setAttribute('opacity', '1');
        el.groundLine.setAttribute('x1', '60');
        el.groundLine.setAttribute('x2', '740');
        el.groundLine.setAttribute('opacity', '1');
      } else if (mode === 'tuktuk') {
        // Left arm on hip, right arm waving out of the cab.
        el.poseArmL.setAttribute('display', 'inline');
        el.swingArmL.setAttribute('display', 'none');
        el.poseArmR.setAttribute('display', 'inline');
        el.swingArmR.setAttribute('display', 'none');
        el.env.setAttribute('opacity', '1');
        el.roadDashes.setAttribute('opacity', '1');
        el.groundLine.setAttribute('x1', '60');
        el.groundLine.setAttribute('x2', '740');
        el.groundLine.setAttribute('opacity', '1');
      } else if (mode === 'metro') {
        el.poseArmL.setAttribute('display', 'inline');
        el.swingArmL.setAttribute('display', 'none');
        el.poseArmR.setAttribute('display', 'inline');
        el.swingArmR.setAttribute('display', 'none');
        el.env.setAttribute('opacity', '0');
        el.roadDashes.setAttribute('opacity', '0');
        el.groundLine.setAttribute('opacity', '0');
      }

      el.speedLines.setAttribute('opacity', mode === 'run' || mode === 'tuktuk' ? '1' : '0');
    };

    const animate = (now: number) => {
      const dt = Math.min((now - lastTimestamp) / 1000, 0.1);
      lastTimestamp = now;
      time += dt;

      // Auto "mixed trip" progression.
      storyTimer += dt;
      const stageIdx = Math.floor(storyTimer / STAGE_DURATION) % STORY_STAGES.length;
      if (STORY_STAGES[stageIdx] !== currentMode) {
        setMode(STORY_STAGES[stageIdx]);
      }

      // Scroll parallax backgrounds.
      let envScrollSpeed = 0;
      if (currentMode === 'walk') envScrollSpeed = 90;
      if (currentMode === 'run') envScrollSpeed = 280;
      if (currentMode === 'tuktuk') envScrollSpeed = 420;

      if (envScrollSpeed > 0) {
        const cityOffset = -((time * envScrollSpeed) % 800);
        const cloudOffset = -((time * envScrollSpeed * 0.25) % 800);
        const roadOffset = -((time * envScrollSpeed * 1.5) % 220);
        el.city.setAttribute('transform', `translate(${cityOffset}, 0)`);
        el.clouds.setAttribute('transform', `translate(${cloudOffset}, 0)`);
        el.roadDashes.setAttribute('transform', `translate(${roadOffset}, 0)`);
      }

      if (currentMode === 'pose') {
        // Subtle breathing, floating head, waving hand.
        const breathY = Math.sin(time * 2.5) * 3.5;
        const headBob = Math.sin(time * 2.5 - 0.5) * 5;
        const waveRot = Math.sin(time * 6) * 8;
        const capeWave = Math.sin(time * 3) * 4;

        el.charRoot.setAttribute('transform', 'translate(0, 0) scale(1)');
        el.torso.setAttribute('transform', `translate(390, ${200 + breathY}) rotate(0)`);
        el.head.setAttribute(
          'transform',
          `translate(-8, ${-98 + headBob}) rotate(${Math.sin(time * 2) * 3})`,
        );
        el.wavingHand.setAttribute('transform', `translate(144, -56) rotate(${waveRot})`);
        el.cape.setAttribute('transform', `translate(360, ${145 + breathY}) rotate(${capeWave})`);
        el.legL.setAttribute('transform', 'translate(353, 255) rotate(0)');
        el.legR.setAttribute('transform', 'translate(425, 255) rotate(0)');
      } else if (currentMode === 'walk') {
        const w = time * 6.5;
        const bounce = Math.abs(Math.sin(w)) * -12;
        const legSwing = Math.sin(w) * 26;
        const armSwing = Math.sin(w) * 28;
        const headBob = Math.sin(w * 2) * 4;
        const capeRot = 12 + Math.sin(w * 2) * 6;

        el.charRoot.setAttribute('transform', 'translate(0, 0) scale(1)');
        el.torso.setAttribute('transform', `translate(390, ${200 + bounce}) rotate(4)`);
        el.head.setAttribute('transform', `translate(-2, ${-98 + headBob}) rotate(4)`);
        el.cape.setAttribute('transform', `translate(355, ${145 + bounce}) rotate(${capeRot})`);
        el.legL.setAttribute(
          'transform',
          `translate(368, ${255 + bounce * 0.5}) rotate(${legSwing})`,
        );
        el.legR.setAttribute(
          'transform',
          `translate(412, ${255 + bounce * 0.5}) rotate(${-legSwing})`,
        );
        el.swingArmL.setAttribute('transform', `translate(-45, -42) rotate(${-armSwing})`);
        el.swingArmR.setAttribute('transform', `translate(45, -38) rotate(${armSwing})`);
      } else if (currentMode === 'run') {
        const r = time * 13;
        const bounce = Math.abs(Math.sin(r)) * -24;
        const legSwing = Math.sin(r) * 48;
        const armSwing = Math.sin(r) * 52;
        const headBob = Math.cos(r * 2) * 6;
        const capeRot = 36 + Math.sin(r * 2) * 10;

        el.charRoot.setAttribute('transform', 'translate(0, 0) scale(1)');
        el.torso.setAttribute('transform', `translate(395, ${202 + bounce}) rotate(15)`);
        el.head.setAttribute('transform', `translate(10, ${-98 + headBob}) rotate(12)`);
        el.cape.setAttribute('transform', `translate(350, ${148 + bounce}) rotate(${capeRot})`);
        el.legL.setAttribute(
          'transform',
          `translate(375, ${255 + bounce * 0.5}) rotate(${legSwing})`,
        );
        el.legR.setAttribute(
          'transform',
          `translate(410, ${255 + bounce * 0.5}) rotate(${-legSwing})`,
        );
        el.swingArmL.setAttribute('transform', `translate(-45, -42) rotate(${-armSwing})`);
        el.swingArmR.setAttribute('transform', `translate(45, -38) rotate(${armSwing})`);
      } else if (currentMode === 'tuktuk') {
        // Engine rattle + road-bump suspension, character seated in the cab.
        const chug = Math.sin(time * 28) * 2.2 + Math.sin(time * 7) * 2.5;
        const wheelRot = (time * 520) % 360;
        const capeFlap = 28 + Math.sin(time * 22) * 8;
        const waveRot = Math.sin(time * 10) * 10;

        el.charRoot.setAttribute(
          'transform',
          `translate(72, ${142 + chug}) scale(0.58)`,
        );
        el.torso.setAttribute('transform', 'translate(390, 200) rotate(3)');
        el.head.setAttribute(
          'transform',
          `translate(-4, ${-94 + Math.sin(time * 28) * 2}) rotate(4)`,
        );
        el.wavingHand.setAttribute('transform', `translate(144, -56) rotate(${waveRot})`);
        el.cape.setAttribute('transform', `translate(355, 145) rotate(${capeFlap})`);
        el.legL.setAttribute('transform', 'translate(353, 255) rotate(-65)');
        el.legR.setAttribute('transform', 'translate(425, 255) rotate(-65)');

        // Keep the clip window in sync with the suspension bounce.
        el.tuktukClipRect.setAttribute('y', String(178 + chug));

        el.chassis.setAttribute('transform', `translate(0, ${chug})`);
        el.tuktukBack.setAttribute('transform', `translate(0, ${chug})`);
        el.wheelR.setAttribute('transform', `translate(255, 405) rotate(${wheelRot})`);
        el.wheelF.setAttribute('transform', `translate(565, 405) rotate(${wheelRot})`);

        // Exhaust smoke puff loop.
        const s1 = (time * 3) % 1;
        el.smoke1.setAttribute('cx', String(190 - s1 * 50));
        el.smoke1.setAttribute('cy', String(395 - s1 * 20));
        el.smoke1.setAttribute('opacity', String(1 - s1));
      } else if (currentMode === 'metro') {
        // Smooth rail sway, rapid tunnel lights, swaying straps.
        const swayX = Math.sin(time * 3.2) * 4;
        const swayY = Math.abs(Math.sin(time * 6.4)) * 2.5;
        const strapAngle = Math.sin(time * 3.2 - 0.4) * 9;

        el.charRoot.setAttribute(
          'transform',
          `translate(${swayX}, ${15 + swayY}) scale(0.92)`,
        );
        el.torso.setAttribute('transform', `translate(390, 200) rotate(${swayX * 0.4})`);
        el.head.setAttribute(
          'transform',
          `translate(-8, ${-98 + swayY}) rotate(${swayX * 0.6})`,
        );
        el.wavingHand.setAttribute('transform', `translate(144, -56) rotate(${-swayX * 1.2})`);
        el.cape.setAttribute('transform', `translate(360, 145) rotate(${swayX * 1.5})`);
        el.legL.setAttribute('transform', 'translate(353, 255) rotate(0)');
        el.legR.setAttribute('transform', 'translate(425, 255) rotate(0)');

        const lightOffset = -((time * 950) % 900);
        el.tunnelLights.setAttribute('transform', `translate(${lightOffset}, 0)`);

        const strapBaseX = [180, 490, 610];
        el.straps.forEach((strap, idx) => {
          strap.setAttribute(
            'transform',
            `translate(${strapBaseX[idx]}, 95) rotate(${strapAngle})`,
          );
        });
      }

      raf = requestAnimationFrame(animate);
    };

    setMode('pose');
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="home-anim-panel" aria-hidden="true">
      <svg ref={svgRef} viewBox="0 0 800 500" className="home-anim" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id="metro-window-clip">
            <rect x="60" y="55" width="680" height="390" rx="28" />
          </clipPath>
          <clipPath id="char-in-tuktuk">
            <rect id="char-in-tuktuk-rect" x="150" y="178" width="500" height="177" />
          </clipPath>
        </defs>

        {/* Parallax city & clouds (fades in while moving) */}
        <g id="environment-layer" opacity="0">
          <g id="clouds-group" fill="#FFFDF7" stroke="#18181B" strokeWidth="2">
            <path d="M120,90 Q135,70 160,80 Q180,60 205,80 Q225,85 220,105 L110,105 Q100,90 120,90 Z" />
            <path d="M520,65 Q535,45 560,55 Q580,35 605,55 Q625,60 620,80 L510,80 Q500,65 520,65 Z" />
            <path d="M880,85 Q895,65 920,75 Q940,55 965,75 Q985,80 980,100 L870,100 Q860,85 880,85 Z" />
          </g>

          <g id="city-group" fill="#F3E8CE" stroke="#18181B" strokeWidth="2">
            {/* Tile 1 (0 to 800) */}
            <rect x="40" y="220" width="75" height="216" rx="6" />
            <rect x="135" y="170" width="95" height="266" rx="6" />
            <rect x="250" y="250" width="65" height="186" rx="6" />
            <rect x="340" y="190" width="110" height="246" rx="6" />
            <rect x="475" y="230" width="80" height="206" rx="6" />
            <rect x="580" y="160" width="100" height="276" rx="6" />
            <rect x="700" y="210" width="70" height="226" rx="6" />
            {/* Tile 2 (800 to 1600) for a seamless loop */}
            <rect x="840" y="220" width="75" height="216" rx="6" />
            <rect x="935" y="170" width="95" height="266" rx="6" />
            <rect x="1050" y="250" width="65" height="186" rx="6" />
            <rect x="1140" y="190" width="110" height="246" rx="6" />
            <rect x="1275" y="230" width="80" height="206" rx="6" />
            <rect x="1380" y="160" width="100" height="276" rx="6" />
            <rect x="1500" y="210" width="70" height="226" rx="6" />
          </g>

          <g id="speed-lines" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" opacity="0">
            <line x1="650" y1="140" x2="760" y2="140" />
            <line x1="120" y1="210" x2="200" y2="210" />
            <line x1="580" y1="290" x2="710" y2="290" />
            <line x1="80" y1="350" x2="180" y2="350" />
          </g>
        </g>

        {/* Metro interior (behind the character) */}
        <g id="metro-back-layer" display="none">
          <rect x="0" y="0" width="800" height="500" fill="#18181B" />
          <g id="tunnel-lights">
            <rect x="150" y="110" width="90" height="18" rx="9" fill="#F8C537" opacity="0.9" />
            <rect x="450" y="110" width="90" height="18" rx="9" fill="#EE2B24" opacity="0.9" />
            <rect x="750" y="110" width="90" height="18" rx="9" fill="#F8C537" opacity="0.9" />
            <rect x="1050" y="110" width="90" height="18" rx="9" fill="#EE2B24" opacity="0.9" />
          </g>
          <g>
            <rect x="70" y="65" width="660" height="370" rx="22" fill="#FFF9EB" stroke="#18181B" strokeWidth="3" />
            <rect x="115" y="125" width="160" height="110" rx="12" fill="#18181B" stroke="#18181B" strokeWidth="4" />
            <rect x="525" y="125" width="160" height="110" rx="12" fill="#18181B" stroke="#18181B" strokeWidth="4" />
            <g opacity="0.85">
              <line x1="130" y1="160" x2="250" y2="160" stroke="#F8C537" strokeWidth="6" strokeLinecap="round" />
              <line x1="540" y1="160" x2="660" y2="160" stroke="#F8C537" strokeWidth="6" strokeLinecap="round" />
              <line x1="160" y1="195" x2="230" y2="195" stroke="#EE2B24" strokeWidth="5" strokeLinecap="round" />
              <line x1="570" y1="195" x2="640" y2="195" stroke="#EE2B24" strokeWidth="5" strokeLinecap="round" />
            </g>
            <rect x="95" y="315" width="195" height="45" rx="10" fill="#F8C537" stroke="#18181B" strokeWidth="2.5" />
            <rect x="510" y="315" width="195" height="45" rx="10" fill="#F8C537" stroke="#18181B" strokeWidth="2.5" />
            <line x1="75" y1="95" x2="725" y2="95" stroke="#18181B" strokeWidth="6" strokeLinecap="round" />
            <line x1="295" y1="65" x2="295" y2="435" stroke="#18181B" strokeWidth="7" />
          </g>
        </g>

        {/* Tuk-tuk seat & pillars (behind the character) */}
        <g id="tuktuk-back-layer" display="none">
          <path d="M 225,355 L 225,275 L 515,275 L 535,355 Z" fill="#27272A" stroke="#18181B" strokeWidth="2.5" />
          <rect x="235" y="250" width="52" height="90" rx="12" fill="#EE2B24" stroke="#18181B" strokeWidth="2.5" />
          <line x1="238" y1="175" x2="238" y2="350" stroke="#18181B" strokeWidth="6" />
          <line x1="415" y1="172" x2="415" y2="350" stroke="#18181B" strokeWidth="6" />
        </g>

        {/* The character rig */}
        <g id="character-master-wrapper">
          <g id="character-root">
            <g id="rig-cape" transform="translate(360, 145)">
              <path
                id="cape-shape"
                d="M 0,0 C -35,65 -85,155 -125,215 C -95,215 -80,195 -55,200 C -30,205 -15,180 15,175 Z"
                fill="#E5DEC9"
                stroke="#18181B"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <path
                d="M -12,35 C -38,95 -65,150 -85,195"
                stroke="#18181B"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
            </g>

            <g id="rig-leg-r" transform="translate(425, 255)">
              <g id="rig-shin-r">
                <rect x="-24" y="-15" width="48" height="190" rx="12" fill="#18181B" />
                <path d="M -24,160 L 24,160 L 42,174 C 45,176 43,180 38,180 L -24,180 Z" fill="#18181B" />
              </g>
            </g>

            <g id="rig-leg-l" transform="translate(353, 255)">
              <g id="rig-shin-l">
                <rect x="-24" y="-15" width="48" height="190" rx="12" fill="#18181B" />
                <path
                  id="foot-l-path"
                  d="M -24,160 L 24,160 L 24,180 L -38,180 C -43,180 -45,176 -42,174 Z"
                  fill="#18181B"
                />
              </g>
            </g>

            <g id="rig-torso" transform="translate(390, 200)">
              <path
                d="M -62,-62 C -25,-68 30,-64 62,-54 C 72,-50 70,15 62,62 L -60,62 C -68,15 -70,-50 -62,-62 Z"
                fill="#18181B"
              />

              <g id="rig-head" transform="translate(-8, -98)">
                <circle cx="-15" cy="-2" r="9.5" fill="#18181B" />
                <rect x="-12" y="-24" width="27" height="45" rx="13.5" fill="#18181B" />
                <path
                  d="M 5,-11 L 8,4 L -1,4"
                  fill="none"
                  stroke="#F8C537"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>

              {/* Left arm */}
              <g id="rig-arm-l">
                <g id="pose-arm-l" display="inline">
                  <path
                    d="M -50,-44 C -88,-32 -118,-5 -112,18 C -106,38 -78,48 -60,52"
                    fill="none"
                    stroke="#18181B"
                    strokeWidth="34"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <g transform="translate(-60, 46) rotate(-38)">
                    <rect x="-10" y="-14" width="24" height="26" rx="10" fill="#18181B" />
                    <rect x="6" y="-13" width="22" height="7" rx="3.5" fill="#18181B" stroke="#F8C537" strokeWidth="2.2" />
                    <rect x="8" y="-5" width="24" height="7" rx="3.5" fill="#18181B" stroke="#F8C537" strokeWidth="2.2" />
                    <rect x="6" y="3" width="20" height="7" rx="3.5" fill="#18181B" stroke="#F8C537" strokeWidth="2.2" />
                    <path d="M -6,12 C 2,8 8,2 10,-6" stroke="#F8C537" strokeWidth="2.8" strokeLinecap="round" fill="none" />
                  </g>
                </g>
                <g id="swing-arm-l" display="none" transform="translate(-45, -42)">
                  <path d="M 0,0 C -15,35 -10,65 10,88" fill="none" stroke="#18181B" strokeWidth="32" strokeLinecap="round" />
                  <circle cx="12" cy="92" r="16" fill="#18181B" />
                  <path d="M 6,86 C 12,92 18,92 20,85" stroke="#F8C537" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                </g>
              </g>

              {/* Right arm */}
              <g id="rig-arm-r">
                <g id="pose-arm-r" display="inline">
                  <path
                    d="M 48,-36 C 72,-15 86,42 102,42 C 118,42 128,-12 142,-52"
                    fill="none"
                    stroke="#18181B"
                    strokeWidth="34"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <g id="waving-hand" transform="translate(144, -56)">
                    <path
                      id="yellow-arc"
                      d="M -22,-32 C -2,-30 16,-18 28,-2"
                      fill="none"
                      stroke="#F8C537"
                      strokeWidth="4.5"
                      strokeLinecap="round"
                    />
                    <circle cx="4" cy="4" r="18" fill="#18181B" />
                    <rect x="-12" y="-26" width="11" height="26" rx="5.5" transform="rotate(18 -6 -13)" fill="#18181B" />
                    <rect x="4" y="-22" width="32" height="10" rx="5" transform="rotate(-28 10 -15)" fill="#18181B" />
                    <rect x="10" y="-11" width="34" height="10" rx="5" transform="rotate(-16 14 -6)" fill="#18181B" />
                    <rect x="10" y="1" width="30" height="10" rx="5" transform="rotate(-5 14 5)" fill="#18181B" />
                    <path d="M 2,-7 C 10,-5 12,4 6,10" fill="none" stroke="#F8C537" strokeWidth="2.8" strokeLinecap="round" />
                    <line x1="-6" y1="10" x2="0" y2="15" stroke="#F8C537" strokeWidth="2.8" strokeLinecap="round" />
                  </g>
                </g>
                <g id="swing-arm-r" display="none" transform="translate(45, -38)">
                  <path d="M 0,0 C 15,35 25,60 45,75" fill="none" stroke="#18181B" strokeWidth="32" strokeLinecap="round" />
                  <circle cx="48" cy="78" r="16" fill="#18181B" />
                  <path d="M 42,74 C 48,80 54,80 56,73" stroke="#F8C537" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                </g>
              </g>
            </g>
          </g>
        </g>

        {/* Tuk-tuk body & wheels (in front of the character) */}
        <g id="tuktuk-front-layer" display="none">
          <g id="tuktuk-chassis">
            <g fill="#EDE3CC" stroke="#18181B" strokeWidth="2">
              <circle id="smoke-1" cx="185" cy="395" r="9" />
              <circle id="smoke-2" cx="160" cy="385" r="14" />
              <circle id="smoke-3" cx="130" cy="370" r="18" />
            </g>

            <path d="M 210,330 L 385,330 L 385,405 L 195,405 C 190,375 195,345 210,330 Z" fill="#1B317E" stroke="#18181B" strokeWidth="3" />
            <path d="M 195,355 L 385,355 L 385,405 L 195,405 Z" fill="#18181B" />
            <rect x="200" y="362" width="185" height="12" rx="6" fill="#F8C537" stroke="#18181B" strokeWidth="2" />

            <path d="M 385,330 L 495,330 L 535,235 L 485,185 L 465,185 L 485,245 L 430,355 L 385,355 Z" fill="#1B317E" stroke="#18181B" strokeWidth="3" strokeLinejoin="round" />
            <path d="M 490,235 L 545,345 L 580,365 L 545,395 L 430,395 L 455,330 Z" fill="#EE2B24" stroke="#18181B" strokeWidth="3" strokeLinejoin="round" />

            <path d="M 488,182 L 538,238 L 524,244 L 476,186 Z" fill="#FFF9EB" stroke="#18181B" strokeWidth="3" />

            <circle cx="568" cy="348" r="12" fill="#F8C537" stroke="#18181B" strokeWidth="3" />
            <polygon points="582,342 695,315 695,385 582,355" fill="#F8C537" opacity="0.35" />

            <path d="M 205,182 C 205,130 475,130 500,185 L 205,185 Z" fill="#F8C537" stroke="#18181B" strokeWidth="3" strokeLinejoin="round" />
            <path d="M 255,182 L 265,146 M 325,182 L 330,142 M 395,182 L 395,145" stroke="#18181B" strokeWidth="2.5" />

            <path d="M 520,385 C 545,355 595,355 615,385 Z" fill="#F8C537" stroke="#18181B" strokeWidth="3" />
          </g>

          <g id="tuktuk-wheel-r" transform="translate(255, 405)">
            <circle cx="0" cy="0" r="34" fill="#18181B" />
            <circle cx="0" cy="0" r="19" fill="#FFF9EB" stroke="#18181B" strokeWidth="2" />
            <circle cx="0" cy="0" r="7" fill="#EE2B24" stroke="#18181B" strokeWidth="2" />
            <line x1="-17" y1="0" x2="17" y2="0" stroke="#18181B" strokeWidth="3" />
            <line x1="0" y1="-17" x2="0" y2="17" stroke="#18181B" strokeWidth="3" />
          </g>
          <g id="tuktuk-wheel-f" transform="translate(565, 405)">
            <circle cx="0" cy="0" r="34" fill="#18181B" />
            <circle cx="0" cy="0" r="19" fill="#FFF9EB" stroke="#18181B" strokeWidth="2" />
            <circle cx="0" cy="0" r="7" fill="#EE2B24" stroke="#18181B" strokeWidth="2" />
            <line x1="-17" y1="0" x2="17" y2="0" stroke="#18181B" strokeWidth="3" />
            <line x1="0" y1="-17" x2="0" y2="17" stroke="#18181B" strokeWidth="3" />
          </g>
        </g>

        {/* Metro foreground: straps & exterior frame */}
        <g id="metro-front-layer" display="none">
          <g>
            <g transform="translate(180, 95)" className="metro-strap">
              <line x1="0" y1="0" x2="0" y2="38" stroke="#18181B" strokeWidth="4" />
              <path d="M -12,38 L 12,38 L 15,62 Q 0,68 -15,62 Z" fill="#F8C537" stroke="#18181B" strokeWidth="3.5" strokeLinejoin="round" />
            </g>
            <g transform="translate(490, 95)" className="metro-strap">
              <line x1="0" y1="0" x2="0" y2="38" stroke="#18181B" strokeWidth="4" />
              <path d="M -12,38 L 12,38 L 15,62 Q 0,68 -15,62 Z" fill="#F8C537" stroke="#18181B" strokeWidth="3.5" strokeLinejoin="round" />
            </g>
            <g transform="translate(610, 95)" className="metro-strap">
              <line x1="0" y1="0" x2="0" y2="38" stroke="#18181B" strokeWidth="4" />
              <path d="M -12,38 L 12,38 L 15,62 Q 0,68 -15,62 Z" fill="#F8C537" stroke="#18181B" strokeWidth="3.5" strokeLinejoin="round" />
            </g>
          </g>

          <path
            d="M 40,40 H 760 A 20,20 0 0 1 780,60 V 440 A 20,20 0 0 1 760,460 H 40 A 20,20 0 0 1 20,440 V 60 A 20,20 0 0 1 40,40 Z M 95,75 A 20,20 0 0 0 75,95 V 395 A 20,20 0 0 0 95,415 H 705 A 20,20 0 0 0 725,395 V 95 A 20,20 0 0 0 705,75 H 95 Z"
            fill="#F3E8CE"
            stroke="#18181B"
            strokeWidth="4"
            fillRule="evenodd"
          />
          <rect x="22" y="405" width="756" height="16" fill="#EE2B24" stroke="#18181B" strokeWidth="2.5" />
          <rect x="22" y="52" width="756" height="10" fill="#F8C537" stroke="#18181B" strokeWidth="2" />
          <line x1="400" y1="75" x2="400" y2="415" stroke="#18181B" strokeWidth="3" opacity="0.35" />
        </g>

        {/* Ground & road */}
        <g>
          <line
            id="ground-line"
            x1="230"
            y1="436"
            x2="560"
            y2="436"
            stroke="#1B317E"
            strokeWidth="5.5"
            strokeLinecap="round"
          />
          <g id="road-dashes" stroke="#18181B" strokeWidth="4" strokeLinecap="round" opacity="0">
            <line x1="100" y1="452" x2="160" y2="452" />
            <line x1="320" y1="452" x2="380" y2="452" />
            <line x1="540" y1="452" x2="600" y2="452" />
            <line x1="760" y1="452" x2="820" y2="452" />
          </g>
        </g>
      </svg>
    </div>
  );
}
