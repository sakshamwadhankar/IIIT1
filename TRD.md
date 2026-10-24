# Raah — Technical Requirements Document (TRD)

**Document status:** Designathon MVP technical requirements  
**Version:** 1.0  
**Date:** October 25, 2026  
**Product document:** [`PRD.md`](PRD.md)  
**Workflow document:** [`user workflow.md`](user%20workflow.md)

## 1. Technical objective

Build Raah as a **browser-first Progressive Web App** that looks and behaves like an app while remaining a normal website when opened by URL.

The implementation must be:

- Web-based, not Kotlin, Android-native, or a WebView wrapper.
- Installable where the browser supports PWA installation.
- Responsive across mobile and desktop layouts.
- Usable offline with deterministic local dummy data.
- Fast enough for a live designathon presentation.
- Easy for the team to modify during UI iteration.
- Free of live API keys and backend dependencies.

## 2. Recommended implementation stack

The repository is currently empty, so the recommended stack is:

| Layer | Requirement |
|---|---|
| Runtime | Modern browser with JavaScript enabled |
| UI | React with TypeScript |
| Build tool | Vite |
| Styling | Local CSS with design tokens; utility classes may be added only if the team intentionally adopts them |
| Data | Local JSON or TypeScript fixtures |
| State | React state and small custom hooks; no state-management library required for MVP |
| Icons | Inline SVG or a small local icon set; do not depend on network-loaded icon assets |
| Map | Local SVG/CSS schematic map; no live map SDK required |
| PWA | Web App Manifest plus service worker/cache strategy |
| Testing | Unit/component tests for route logic and user flows; browser smoke test for the demo path |
| Deployment | Static hosting that serves HTTPS and supports SPA fallback |

### Stack constraints

- Do not introduce Kotlin, Android Studio, a native mobile build, or a WebView wrapper.
- Do not add a backend just to store dummy route data.
- Do not call Google Maps, Mapbox, OpenWeather, news, crime, traffic, geocoding, or payment APIs in the MVP.
- Do not load the logo, fonts, icons, or core fixture data from a remote origin.
- Do not add a heavy state library unless a real complexity problem appears.

## 3. Runtime modes

Raah has three runtime modes:

### 3.1 Normal browser mode

- User opens the site by URL.
- The app renders inside the browser tab.
- All core features work without installation.

### 3.2 Installed standalone mode

- User installs Raah from the browser.
- The app opens in a standalone window with the Raah icon and theme color.
- The layout must not rely on browser back/forward controls for primary navigation.
- The app still has an in-app back action where a drawer or step needs it.

### 3.3 Offline/demo mode

- The app loads the shell and fixtures from cache/local files.
- A small status label may say **Demo data · Offline-ready**.
- No feature should wait forever for a network response.
- If a service worker is unavailable, the app must still work as a normal online page using bundled assets.

## 4. Application architecture

### 4.1 High-level layers

```text
App shell
  ├── PWA lifecycle and install metadata
  ├── Route planner state
  ├── Local fixture repository
  ├── Route ranking/explanation adapter
  ├── UI components
  └── Accessibility and responsive presentation
```

### 4.2 Separation of responsibilities

**Fixture repository**

- Reads local demo data.
- Does not fetch live data.
- Exposes stable typed objects.

**Planner state**

- Stores origin, destination, stops, mode, preference, selected route, drawer state, and demo clock.
- Keeps all interactions deterministic.

**Ranking adapter**

- Applies local preference weights to fixture values.
- Returns route order and explanation strings.
- Must not expose a fake “objective safety score” as a truth claim.

**UI components**

- Render route cards, controls, map visualization, evidence, and shell.
- Do not contain hard-coded safety calculations.

## 5. Proposed project structure

```text
.
├─ public/
│  ├─ icons/
│  │  ├─ raah-icon-192.png
│  │  ├─ raah-icon-512.png
│  │  └─ raah-maskable-512.png
│  ├─ logo.svg
│  ├─ logo-mono.svg
│  ├─ manifest.webmanifest
│  └─ offline.html
├─ src/
│  ├─ app/
│  │  ├─ App.tsx
│  │  ├─ routes.ts
│  │  └─ app.css
│  ├─ components/
│  │  ├─ app-shell/
│  │  ├─ planner/
│  │  ├─ routes/
│  │  ├─ evidence/
│  │  ├─ stops/
│  │  └─ shared/
│  ├─ data/
│  │  ├─ demo-trip.ts
│  │  ├─ routes.ts
│  │  ├─ places.ts
│  │  ├─ evidence.ts
│  │  ├─ weather.ts
│  │  ├─ news.ts
│  │  └─ preferences.ts
│  ├─ hooks/
│  │  ├─ usePlannerState.ts
│  │  ├─ useRouteComparison.ts
│  │  └─ usePwaInstall.ts
│  ├─ lib/
│  │  ├─ ranking.ts
│  │  ├─ explanations.ts
│  │  ├─ formatters.ts
│  │  └─ validation.ts
│  ├─ types/
│  │  ├─ route.ts
│  │  ├─ evidence.ts
│  │  └─ planner.ts
│  └─ main.tsx
├─ tests/
│  ├─ ranking.test.ts
│  ├─ stops.test.ts
│  ├─ route-card.test.tsx
│  └─ planner-flow.test.tsx
├─ package.json
├─ tsconfig.json
├─ vite.config.ts
└─ README.md
```

The exact structure may change during implementation, but the separation between fixtures, ranking logic, UI, and PWA assets should remain.

## 6. PWA requirements

### 6.1 Manifest

Create `public/manifest.webmanifest` with:

```json
{
  "name": "Raah — Route choices that fit you",
  "short_name": "Raah",
  "description": "Compare route time, cost, comfort, weather, and safety-supporting signals.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#f6f7fb",
  "theme_color": "#283593",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/raah-icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/raah-icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    },
    {
      "src": "/icons/raah-maskable-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

The final manifest should use the actual approved logo exports and the final product description.

### 6.2 Service worker

The service worker must:

- Cache the app shell and bundled assets.
- Cache local fixture data.
- Support an offline fallback.
- Avoid caching private user data because the MVP has no account system.
- Use a versioned cache name so updates can invalidate old assets.
- Never make the app depend on a successful network request for route comparison.

### 6.3 Install behavior

- Show a small install suggestion only when the browser exposes install capability.
- Provide a manual “How to install” help state for browsers that do not expose an install event.
- Do not show a blocking install modal on first load.
- Do not claim installation is available when the browser does not support it.

## 7. Data model

All data is local, fictional, typed, and deterministic.

### 7.1 Planner state

```ts
type PlannerState = {
  originId: string | null;
  destinationId: string | null;
  stopIds: string[];
  mode: 'walk' | 'cab' | 'mixed';
  primaryPreference: 'fastest' | 'safest' | 'cleanest' | 'lowest-cost';
  preferences: {
    wellLit: boolean;
    populated: boolean;
    avoidNightlife: boolean;
    reduceWalking: boolean;
    avoidRain: boolean;
    womenFocused: boolean;
  };
  selectedRouteId: string | null;
  activeView: 'planner' | 'comparison' | 'active-preview';
  openPanel: 'none' | 'evidence' | 'stop-search' | 'install-help';
  demoClock: string;
};
```

### 7.2 Route fixture

```ts
type DemoRoute = {
  id: string;
  label: 'safest-fit' | 'fastest' | 'cleanest' | 'best-value' | 'balanced';
  mode: 'walk' | 'cab' | 'mixed';
  name: string;
  etaMinutes: number;
  distanceKm: number;
  walkingMeters: number;
  fareInr: number;
  deltaFromFastestMinutes: number;
  deltaFromDirectFareInr: number;
  safety: {
    lightingPercent: number;
    populatedPercent: number;
    nightlifeExposure: 'low' | 'medium' | 'high';
    incidentTrend: 'lower' | 'baseline' | 'higher';
  };
  comfort: {
    cleanliness: 'poor' | 'fair' | 'good' | 'excellent';
    coveredWalkingMeters: number;
    crossings: number;
    construction: boolean;
  };
  traffic: 'light' | 'moderate' | 'heavy';
  weatherImpact: 'low' | 'medium' | 'high';
  confidence: 'high' | 'medium' | 'limited';
  evidenceIds: string[];
  mapPath: Array<{ x: number; y: number }>;
};
```

### 7.3 Evidence fixture

```ts
type EvidenceItem = {
  id: string;
  kind: 'traffic' | 'weather' | 'incident-trend' | 'news' | 'cleanliness' | 'reputation';
  title: string;
  summary: string;
  sourceLabel: string;
  observedAt: string;
  period?: string;
  confidence: 'high' | 'medium' | 'limited';
  severity?: 'info' | 'caution' | 'warning';
  routeIds: string[];
  demoOnly: true;
};
```

### 7.4 Stop fixture

```ts
type DemoPlace = {
  id: string;
  name: string;
  category: 'pharmacy' | 'cafe' | 'pickup' | 'public-place' | 'other';
  openUntil: string;
  reputation: number;
  staffed: boolean;
  safetySupportingContext: string;
  detourMinutes: number;
  detourFareInr: number;
};
```

### Data integrity rules

- Every route ID is unique.
- Every evidence ID referenced by a route exists.
- Every stop suggestion has a deterministic detour.
- Every route has at least one benefit and one trade-off.
- Every dynamic-looking evidence item has `observedAt` or `period`.
- Every source label includes `Demo`, `Synthetic`, or `Sample` when displayed to users.
- No fixture contains a real person, private address, or real allegation.

## 8. Route ranking and explanation logic

### 8.1 Principle

The ranking logic exists only to make the demo respond to preferences. It is not a real safety model.

### 8.2 Preference weights

Use simple weights stored in `src/lib/ranking.ts`:

```ts
const preferenceWeights = {
  fastest: { time: 0.7, safety: 0.1, cost: 0.1, comfort: 0.1 },
  safest: { time: 0.15, safety: 0.55, cost: 0.1, comfort: 0.2 },
  cleanest: { time: 0.15, safety: 0.2, cost: 0.1, comfort: 0.55 },
  'lowest-cost': { time: 0.15, safety: 0.15, cost: 0.6, comfort: 0.1 }
} as const;
```

Optional preferences add small deterministic adjustments:

- `wellLit`: favor lighting percentage.
- `populated`: favor populated percentage.
- `avoidNightlife`: penalize high nightlife exposure.
- `reduceWalking`: penalize walking distance.
- `avoidRain`: favor covered walking and low weather impact.
- `womenFocused`: combine well-lit, populated, avoid isolated segments, and staffed stops.

Do not display the raw weighted score as a safety percentage.

### 8.3 Output contract

The ranking function returns:

```ts
type RankedRoute = {
  route: DemoRoute;
  rank: number;
  isRecommended: boolean;
  reasons: string[];
  tradeoff: string;
  caveat: string;
};
```

Reasons must be human-readable and based on fixture fields, for example:

- “88% of the walking segment is in the well-lit fixture zone.”
- “Costs ₹70 less than the direct cab option.”
- “Keeps 280 m under cover during the demo rain window.”

## 9. UI component requirements

### Required components

- `AppShell`
- `BrandMark`
- `ContextHandoffSheet`
- `LocationField`
- `ModeSelector`
- `PreferenceChips`
- `StopList`
- `StopSearchPanel`
- `RouteMap`
- `RouteLegend`
- `RouteSummaryBar`
- `RouteCard`
- `TradeoffLine`
- `SignalBadge`
- `EvidenceDrawer`
- `EvidenceTimeline`
- `WeatherImpactCard`
- `LocalUpdateCard`
- `PlaceReputationCard`
- `PreStartConfirmation`
- `ActiveRoutePreview`
- `InstallHelpPanel`
- `EmptyState`
- `StaleDataState`
- `NoPerfectMatchState`

### Component behavior rules

- Components receive typed data through props.
- Ranking/explanation logic stays outside visual components.
- Buttons must have explicit labels.
- Drawers must trap focus while open and close with Escape.
- Route cards must remain readable when stacked on mobile.
- The selected route must be distinguishable without color alone.
- Map route lines must have a matching route-list representation.

## 10. Map visualization requirements

Because no live map API is required, implement the map as a **schematic route canvas**:

- SVG or CSS grid background with quiet street-like lines.
- Start, stop, and destination markers.
- Five route paths with stable coordinates.
- Selected route rendered with higher contrast and width.
- Alternative routes rendered with lower opacity.
- Optional callouts: “₹70 saved,” “50 m more walk,” and “covered segment.”
- A text/list mode that contains equivalent route information.

The map must look intentional and product-like; it must not look like a blank placeholder rectangle.

## 11. Navigation and state transitions

The MVP can remain a single-page application with URL-independent UI states.

```text
planner-empty
  → context-detected
  → trip-setup
  → comparing
  → comparison-ready
  → evidence-open
  → stop-search
  → comparison-updated
  → pre-start-confirmation
  → active-preview
```

### State transition rules

- `context-detected → trip-setup` only fills the origin after confirmation.
- `trip-setup → comparing` requires a destination.
- `comparing → comparison-ready` uses local fixture data; no network wait.
- `comparison-ready → evidence-open` preserves route selection.
- `stop-search → comparison-updated` updates totals and explanations.
- `comparison-ready → pre-start-confirmation` requires an explicit route selection.
- `pre-start-confirmation → active-preview` requires an explicit Start route action.
- Browser refresh should restore a safe default planner state, not silently begin active preview.

## 12. Responsive requirements

### Mobile

- Minimum supported layout width: 320 CSS px.
- Use a single-column flow.
- Map/list toggle is visible.
- Route cards are vertically scrollable.
- Evidence drawer becomes a full-height bottom sheet.
- Primary actions stay reachable near the bottom.
- Stop controls are large and not hidden behind hover behavior.

### Tablet and desktop

- Use a two-column layout: map on one side, route list on the other.
- Keep the selected route and primary action visible while route cards scroll.
- Evidence may use a right-side drawer.
- Preserve a clear visual hierarchy around the route comparison.

## 13. Accessibility and quality requirements

- Use semantic HTML headings, forms, lists, buttons, and dialogs.
- Use visible focus rings.
- Ensure keyboard access for all workflows.
- Provide Move up/Move down controls for stop ordering.
- Do not rely on hover for information needed to choose a route.
- Use text labels alongside icons and color.
- Provide reduced-motion behavior for route transitions.
- Make warnings readable and associated with the relevant route.
- Announce route result changes and stop updates where appropriate.
- Provide a list alternative for every map-only concept.

## 14. Performance requirements

- First meaningful app shell should render quickly on a normal laptop and mobile device.
- Core route comparison must not wait on a network request.
- Keep fixture data small and bundled.
- Avoid loading a map SDK, image library, or charting library for the MVP.
- Avoid unnecessary re-renders when selecting a route or opening evidence.
- Prefer CSS/SVG over large raster backgrounds.
- Keep the initial logo and icon assets small.

## 15. Security and privacy requirements

- No secrets in source code.
- No API keys in the client.
- No collection of user identity, precise location, or travel history.
- No external analytics required for the demo.
- No private data persisted to local storage unless explicitly needed for a harmless UI preference.
- If local storage is used, store only non-sensitive settings such as selected theme or dismissed install hint.
- Clearly label synthetic safety/news/weather content.

## 16. Error, empty, and stale states

### Empty planner

Show a short explanation and an example destination. Do not show a blank white page.

### Missing destination

Keep Compare routes disabled and show a concise field-level message.

### No perfect match

Show:

> “No route matches every preference. Relax one preference to see the closest options.”

Offer buttons to remove the least important filter.

### Stale or limited evidence

Show the route anyway with:

- “Limited evidence.”
- Timestamp/period.
- Explanation of which signal is incomplete.

### Offline

Show:

> “You’re viewing synthetic demo data. Live updates are not connected in this prototype.”

Do not block the route flow.

## 17. Testing requirements

### Unit tests

- Ranking returns the expected order for Safety-first.
- Fastest preference selects the 30-minute fixture route.
- Lowest-cost preference exposes the ₹110 route.
- Avoid nightlife changes the preferred route when the high-exposure route is otherwise fastest.
- Avoid rain favors a route with greater covered walking distance.
- Stop insertion updates duration, cost, and stop order.
- Stop removal restores the original route totals.
- Trade-off copy includes a benefit and a caveat.

### Component tests

- Route card renders time, cost, walking, benefit, and caveat.
- Selecting a card highlights it and updates the selected-route state.
- Evidence drawer opens, traps focus, and closes with Escape.
- Add-stop panel can add a fixture place.
- Move up/Move down reorder controls work without drag and drop.
- No-perfect-match state offers a recovery action.

### Browser smoke test

Run this exact path:

1. Open the app.
2. Confirm the detected context.
3. Select destination.
4. Enable Safety-first, well-lit, and avoid nightlife.
5. Compare five routes.
6. Open evidence.
7. Add GreenCare Pharmacy.
8. Reorder the stop.
9. Choose a route.
10. Start active preview.

### Manual checks

- 320 px mobile layout.
- Desktop two-column layout.
- Keyboard-only route selection.
- Offline/reload behavior after service worker registration.
- Install metadata and icon rendering.
- No console errors in the demo flow.

## 18. Build and deployment requirements

Recommended scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint ."
  }
}
```

The final project should:

- Build to static assets.
- Serve the SPA fallback for direct URL loads.
- Serve the manifest and icons from the public root.
- Serve the service worker from the appropriate scope.
- Use HTTPS in deployed environments so installation is available.
- Work from a local preview command for judge demonstrations.

## 19. Technical acceptance criteria

- [ ] The implementation is a web app/PWA, not a Kotlin/native Android app.
- [ ] The app has a working manifest and branded icon assets.
- [ ] The app launches in a standalone-style shell when installed.
- [ ] The logo is visible in the shell and is available as SVG/PNG assets.
- [ ] No live APIs or API keys are required.
- [ ] The app can compare five local routes.
- [ ] The route ranking changes when preferences change.
- [ ] Stops can be added, reordered, and removed.
- [ ] Evidence cards show synthetic source labels and timestamps.
- [ ] The map is a deliberate local visualization, not an empty placeholder.
- [ ] The core flow works offline or with network disabled after assets are available.
- [ ] Unit/component/browser checks cover the main demo path.
- [ ] The app does not start navigation or redirect without an explicit user action.

## 20. Technical references

- [MDN — Making PWAs installable](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable)
- [MDN — Create a standalone app](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/How_to/Create_a_standalone_app)
- [MDN — Progressive web apps overview](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
