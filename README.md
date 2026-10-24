# Raah — Route choices that fit you

Raah is a route-comparison planner built as a **Progressive Web App**. Instead of returning one
opaque path, it shows **five route options side by side** — time, cost, walking distance, weather
exposure, and safety-supporting signals — so you can choose the trade-off instead of accepting it.

> **Choose the route that fits your priorities, not just the route that gets you there.**

Everything in this repository runs **locally with deterministic demo data**. There are no live APIs,
no backend, no API keys, no accounts, and no GPS. All route, safety, weather, traffic, news,
cleanliness, and reputation values are synthetic fixtures, clearly labelled as demo data.

## Quick start

```bash
npm install        # install dependencies
npm run dev        # dev server → http://localhost:5173
npm run build      # type-check + production build (dist/)
npm run preview    # serve the production build → http://localhost:4173
npm test           # vitest suite (62 tests)
npm run lint       # eslint
npm run icons      # regenerate the PWA PNG icons from geometry
```

For the judge demo, use `npm run build && npm run preview` and open
[http://localhost:4173](http://localhost:4173).

## The demo flow (3–5 minutes)

1. **Launch** — branded shell, logo, “Synthetic demo data · Offline-ready” status, demo time 7:20 PM.
2. **Context handoff** — “Looks like you’re walking from North Campus Library.” Confirm, change, or
   dismiss. Nothing starts navigation.
3. **Destination** — pick Indiranagar Metro Gate 3 from local suggestions.
4. **Preferences** — Safety-first + Prefer well-lit streets + Avoid nightlife clusters.
5. **Compare** — five route cards + schematic map:
   - Safest fit: 32 min · ₹180 · 420 m walk · well-lit and populated · *2 min slower*
   - Fastest: 30 min · ₹250 · 180 m walk · *passes one nightlife-heavy segment*
   - Cleanest: 35 min · ₹210 · 500 m walk · *5 min slower*
   - Best value: 38 min · ₹110 · 1.1 km walk · *₹70 less than the Safest fit · walk 50 m more in the final stretch*
   - Balanced: 33 min · ₹195 · 350 m walk · *moderate traffic near Market Road*
6. **Evidence** — timestamped signals with fictional sources (Demo traffic feed, Synthetic weather
   forecast, Sample city bulletin…), incident trend, rain window 8:00–8:40 PM, reputation cards, and
   the planning-aid disclaimer.
7. **Stops** — add GreenCare Pharmacy (+6 min · ₹0 extra · +200 m walking, shown before confirming),
   reorder with drag-and-drop or Move up/Move down, remove with Undo.
8. **Choose → Start** — pre-start confirmation, then a lightly interactive active route preview.
   Navigation only ever starts from an explicit user action.

## Architecture

```text
public/            PWA assets: manifest, service worker, offline page, logo SVGs, PNG icons
src/
  app/             App root, global stylesheet (design tokens + components)
  components/      app-shell · planner · routes · evidence · stops · shared (typed props only)
  data/            Deterministic fixtures: trip, routes, places, evidence, weather, news,
                   incident trend, cleanliness, reputation, preferences
  hooks/           usePlannerState (reducer) · useRouteComparison · usePwaInstall · useFocusTrap
  lib/             ranking · explanations · stops · formatters · validation
  types/           planner · route · evidence type definitions
tests/             ranking · stops · planner-flow · route-card · app-flow · validation
scripts/           generate-icons.mjs (pure-Node PNG rasterizer)
```

Key design rules:

- **Ranking is a local, explainable function** (TRD §8.2 weights + preference chips). It never
  displays a raw “safety score” and never claims a route is guaranteed safe — “Safest fit” is a
  preference match, not a guarantee.
- **Every time-dependent card** carries a timestamp/period, a fictional source label containing
  *Demo*, *Synthetic*, or *Sample*, and a confidence level.
- **Detection never navigates.** The context sheet only fills the origin on confirmation; the active
  preview starts only from the explicit Start route action; a browser refresh returns to the planner.
- **Accessibility:** semantic HTML, radiogroups for mode/preference, `aria-pressed` chips, dialog
  drawers with focus trap + Escape, Move up/Move down as the non-drag reorder path, live-region
  announcements, visible focus rings, non-colour route distinctions (dash patterns + letter chips +
  legend), reduced-motion support.

## PWA behaviour

- `public/manifest.webmanifest` — standalone display, theme colour `#283593`, maskable icon.
- `public/sw.js` — versioned cache (`raah-v2-shell`), network-first for navigations with cached-shell
  and `offline.html` fallbacks, cache-first for hashed assets. If the service worker is unavailable
  the app still works as a normal online page.
- Install hint appears only when the browser exposes `beforeinstallprompt`; the Install panel adapts
  (install prompt / already standalone / manual instructions). Nothing blocks first load.

## Testing

```bash
npm test
```

- `tests/validation.test.ts` — fixture integrity (unique IDs, evidence references, source labels).
- `tests/ranking.test.ts` — every preference flips the recommendation exactly as the demo story
  requires; trade-off copy; no-perfect-match rule; no absolute-safety language.
- `tests/stops.test.ts` — detour math (+6 min pharmacy), reorder (+2 min), remove/restore.
- `tests/planner-flow.test.tsx` — the reducer state machine (context → comparison → pre-start →
  preview, guards against implicit navigation).
- `tests/route-card.test.tsx` — card content, selection, evidence drawer focus trap, stop panel,
  reorder controls, no-perfect-match recovery.
- `tests/app-flow.test.tsx` — the full TRD §17 browser smoke path end to end.

## Limitations (intentional, demo scope)

- All data is synthetic; nothing is verified against the real world.
- The map is a schematic SVG canvas, not a geographic map.
- “Traffic”, “weather”, and “incident trend” are frozen fixtures around a fixed 7:20 PM demo clock.
- No real turn-by-turn navigation; the active preview is a static, interactive mock.
- Ranking weights exist to make the demo respond to preferences, not to model safety.
