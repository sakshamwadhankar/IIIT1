# Safety-aware route planner — product and build plan

**Status:** Designathon-ready MVP plan  
**Date:** October 25, 2026  
**Primary constraint:** This is a UI/prototype exercise. All route, safety, weather, traffic, news, reputation, and pricing values are local dummy data. No live API, backend, account system, or real-time tracking integration is required.

## 1. Product idea

Build a route-planning experience that does more than return one path. It helps a person choose between **fastest, cleanest, safest, and lower-cost routes** by making the trade-offs visible and explainable.

The product should:

- Keep the user in the map/planner experience instead of unexpectedly redirecting them.
- Detect or represent the current context (for example, walking from a building to a street) without silently starting navigation.
- Show **4–5 route options** with clear differences such as time, price, walking distance, weather exposure, traffic, lighting, and nearby nightlife clusters.
- Let the user add, remove, and reorder stops.
- Show why a route is recommended, including evidence freshness and a timestamp.
- Support a women-focused preference profile without claiming that any route is guaranteed safe.
- Turn data into useful decisions, for example: **“Walk 50 m more and save ₹70”** or **“Arrive 2 minutes earlier, but pass through a less-lit segment.”**
- Use fictional, deterministic data so the demo is repeatable and visually convincing.

### One-line value proposition

> **Choose the route that fits your priorities, not just the route that gets you there.**

## 2. Product principles

1. **Safety is explainable, not magical.** Never show a bare “safe” badge without the factors behind it.
2. **Freshness is visible.** Every time-sensitive signal has a date/time and a source label, even when the source is fictional.
3. **The user remains in control.** Context detection may suggest a starting point or mode; it must not silently start navigation or send the user elsewhere.
4. **Trade-offs are first-class UI.** Make “2 min faster,” “₹70 cheaper,” and “300 m less walking” prominent rather than hiding them in a details page.
5. **Preference, not prejudice.** “Avoid nightlife clusters” should be an optional route preference, not a statement that a venue or neighborhood is inherently unsafe.
6. **No false precision.** Use “high confidence,” “recent,” “limited evidence,” and plain-language factors instead of implying that a synthetic score is an objective guarantee.
7. **Accessible at a glance.** Important states use text and icons as well as color; the map is supported by a readable list view.

## 3. Target user and primary demo scenario

### Primary user

A person leaving a building and travelling through a city, who wants to compare routes before walking, taking a cab, or combining both.

### Demo scenario

```text
User is leaving “North Campus Library” at 7:20 PM.
Destination: “Indiranagar Metro Gate 3”.
They want a route that feels safe, avoids nightlife-heavy streets,
and keeps the cab cost low. Rain is possible after 8:00 PM.
They also want to stop at a pharmacy before reaching the destination.
```

### Demo story to present to judges

1. The app recognizes the user is likely walking from the building to the street and presents a calm confirmation sheet.
2. The user enters a destination and selects **Safety-first**.
3. The app presents five route cards, not one opaque answer.
4. The user sees that one route is two minutes faster, another is ₹70 cheaper, and the recommended route has better lighting and lower rain exposure.
5. The user adds a pharmacy stop, drags it before the final destination, and sees the route comparison update.
6. The user opens route evidence, reads a recent fictional news item and weather note, then starts navigation only after choosing.

## 4. Scope for the designathon MVP

### In scope

- Responsive web UI for desktop and mobile widths.
- Search fields for origin, destination, and optional stops.
- Walking, cab, and mixed walking + cab route modes.
- Route preference selector: **Fastest**, **Cleanest**, **Safest**, and **Lowest cost**.
- Optional preference chips:
  - Avoid nightlife clusters.
  - Prefer well-lit streets.
  - Prefer populated streets.
  - Reduce walking.
  - Women-focused preference profile.
  - Avoid rain exposure.
- Four to five route alternatives.
- Map view with route overlays and a synchronized route list.
- Add-stop flow with drag-to-reorder.
- Route detail and evidence drawer.
- Dummy traffic, weather, crime trend, news, reputation, cleanliness, and pricing data.
- Clear “last updated” and “evidence” presentation.
- Empty, loading, warning, and no-perfect-match states.

### Explicitly out of scope

- Live maps, GPS, geocoding, traffic, weather, crime, news, or payment APIs.
- Actual crime prediction or a promise of personal safety.
- User accounts, social graph, emergency dispatch, or background location tracking.
- Real navigation turn-by-turn logic.
- Real-time crowdsourcing or moderation.
- Building a production-grade routing engine.

## 5. Information architecture and screen flow

### Screen A — Context handoff / planner home

Purpose: acknowledge the detected context without forcing navigation.

Content:

- Map preview with a highlighted building exit and nearby street.
- Bottom sheet: **“Looks like you’re walking from North Campus Library.”**
- Actions: **Use as starting point**, **Change**, **Not now**.
- Mode selector: Walk, Cab, Mixed.
- Destination field and recent places.

Important behavior: choosing “Use as starting point” only fills the origin. It does not start the route or redirect the user.

### Screen B — Trip setup

Content:

- Origin and destination fields.
- **+ Add stop** action directly below the destination.
- Preference chips and a compact “More preferences” sheet.
- Optional trip purpose: Home, Work, College, Errand, Other.
- Primary action: **Compare routes**.

### Screen C — Route comparison

This is the hero screen for the demo.

Layout:

- Left/top: map with 4–5 color-coded route lines.
- Right/bottom: vertically scrollable route cards.
- Sticky comparison summary: “Showing 5 routes · Safety-first · Updated 7:20 PM”.
- Toggle between **Map** and **List** for small screens.

Every route card must answer these questions without opening details:

1. How long will it take?
2. What will it cost?
3. How much walking is required?
4. Why is it recommended or different?
5. What is the most important caveat?

Recommended card structure:

```text
[Recommended] Safer + comfortable
32 min total · ₹180 · 420 m walking
2 min slower than fastest · ₹70 cheaper than direct cab
Well-lit for 88% of the walk · low nightlife exposure
Rain exposure: low · Traffic: moderate
[View evidence] [Choose route]
```

### Screen D — Route detail / evidence drawer

Open from a route card or by tapping a route line.

Sections:

- **Why this route:** 3–5 plain-language reasons.
- **Trade-offs:** what the user gains and gives up.
- **Safety signals:** lighting, populated segments, recent incident trend, nightlife exposure, road crossings.
- **Comfort signals:** shade, cleanliness, sidewalk quality, crowding, construction.
- **Live-like signals:** traffic, rain probability, warning notes. These are simulated.
- **Reputation:** nearby stop/place ratings and freshness.
- **Evidence timeline:** timestamped cards with source labels.
- Disclaimer: “This is a planning aid, not a guarantee of safety.”

### Screen E — Add and manage stops

Interaction requirements:

- Tap **+ Add stop**.
- Search/select a stop category or place from dummy suggestions.
- Show detour before confirmation: **“Adds 6 min · ₹0 extra”**.
- Display stops as reorderable numbered rows.
- Allow drag-and-drop and an accessible alternative using Move up / Move down buttons.
- Recalculate the dummy route set after the stop order changes.
- Show stop-specific reputation and opening status where relevant.

Example:

```text
1  North Campus Library
2  GreenCare Pharmacy        +6 min detour · open until 10:00 PM
3  Indiranagar Metro Gate 3
```

### Screen F — Pre-start confirmation

Before navigation starts, show:

- Selected route name.
- Total time, cost, walking distance, and stop count.
- One-line reason for the recommendation.
- Weather/news caveat if one exists.
- **Start route**, **Edit route**, and **Share trip preview** buttons.

This screen reinforces that the user chooses when to begin.

### Screen G — Active route preview

For the prototype, this can be a static or lightly interactive navigation view:

- Next segment and upcoming stop.
- “Rain likely in 35 min” or “Crowding reported near Market Road” notice.
- Reassurance panel: “You are on the route you selected because…”
- Quick actions: View evidence, Change route, Add stop.

## 6. Route ranking and explanation model

The app should not expose a complicated mathematical score as the product. Use a small local scoring function to create stable demo results, then explain the result using the underlying factors.

### Suggested default weights

| Factor | Default weight | Display language |
|---|---:|---|
| Safety and comfort signals | 40% | “Better-lit, more populated segments” |
| Travel time and traffic | 25% | “2 min faster” |
| Walking/cab cost | 15% | “₹70 cheaper” |
| Cleanliness and street quality | 10% | “Cleaner sidewalk, less construction” |
| Weather exposure | 10% | “Lower rain exposure” |

The weights are only for dummy ranking. The UI should let the user switch the leading preference rather than showing a numeric formula.

### Route labels

Use labels that describe a choice, not an absolute truth:

- **Safest fit** — strongest match for safety and comfort preferences.
- **Fastest** — shortest estimated arrival time.
- **Cleanest** — best sidewalk/air/comfort signals in the fixture.
- **Best value** — strongest time-to-cost trade-off.
- **Balanced** — no major weakness across the chosen factors.

Avoid labels such as “100% safe,” “guaranteed safe,” or “crime-free.”

### The “trade-off sentence” pattern

Every route should have one sentence in this format:

```text
[Benefit] · [cost/time difference] · [main caveat]
```

Examples:

- “2 min slower · ₹70 cheaper · 50 m more walking.”
- “Fastest option · passes one nightlife-heavy segment.”
- “Lowest rain exposure · 5 min longer due to a covered footpath.”
- “Cleaner and more populated · cab pickup is 120 m away.”

## 7. Safety and reputation UX

### Safety factors to show

Use a small set of understandable signals:

- Lighting coverage.
- Populated vs isolated segments.
- Recent incident trend in the demo area.
- Road-crossing count and complexity.
- Nearby open, staffed, or public places.
- Nightlife-cluster exposure, when the user has enabled that preference.
- Weather-related walking risk.
- Construction, flooding, or road closure notes.

Do not present a single crime rate as a definitive prediction for an individual journey. Show the period, location scope, sample/coverage note, and freshness.

### Reputation model

Reputation belongs primarily to places and route-supporting locations, not to people or neighborhoods as a whole.

Example place card:

```text
GreenCare Pharmacy
Trusted nearby stop · 4.6/5 reputation
Open until 10:00 PM · staffed · 240 m from route
Safety context: well-lit entrance, nearby public road
Last reviewed: 18 min ago · Demo data
```

Use separate badges for:

- **Trusted:** consistency and review quality.
- **Premium:** comfort/service level, not safety.
- **Safety-supporting:** useful context such as open hours, staff presence, lighting, or public visibility.

Do not let “premium” imply “safe,” and do not let popularity replace evidence.

### Women-focused preference profile

Use respectful copy such as **Women-focused preferences** or **Prefer well-lit and populated streets**. Keep the controls editable and explain what changes:

- More weight on lighting and populated segments.
- Avoid isolated shortcuts.
- Prefer open public places and staffed stops.
- Avoid nightlife clusters if selected.

The profile changes route preferences; it does not claim that only women need safety or that a route is safe for every person.

## 8. Time-dependent evidence UI

Time dependence is one of the core differentiators. Every dynamic-looking item should use the same evidence pattern:

```text
[Icon] Signal title
Value or short summary
Observed 7:05 PM · Source: Demo traffic feed · Confidence: Medium
```

### Evidence types

| Signal | Example dummy content | Freshness display |
|---|---|---|
| Traffic | “Moderate congestion near 100 Feet Road” | Updated 8 min ago |
| Weather | “Rain likely 35–45 min from now” | Forecast for 7:20 PM |
| Incident trend | “Fewer reported incidents than the previous 30-day baseline” | Period: last 30 days |
| News | “Streetlight maintenance reported near Market Road” | Published today, 6:40 PM |
| Cleanliness | “Sidewalk cleanliness: good” | Surveyed yesterday |
| Reputation | “Pharmacy open and staffed” | Verified 18 min ago |

### News card

Use a restrained card, not an alarming news feed:

```text
Recent local update
Streetlight maintenance near Market Road
May affect visibility between 8:00–10:00 PM
Source: City bulletin · Today, 6:40 PM · Demo item
[Why it matters for this route]
```

If no relevant item exists, show **“No recent route-relevant updates in this demo area”** rather than a blank space.

## 9. Weather and rain behavior

Weather should affect route explanation, not become a decorative widget.

Show:

- Rain probability or intensity band.
- Expected time window.
- Exposed vs covered walking distance.
- Puddles/flooding/construction note when relevant.
- A route-level recommendation such as “5 min longer, but 280 m under cover.”

Example:

```text
Rain evidence
Light rain likely between 8:00–8:40 PM
Selected route keeps 280 m of the walk under cover
Source: Demo weather feed · Forecast issued 7:00 PM
```

Do not use rain to create false urgency. Warnings and high-impact hazards should be visually distinct from ordinary forecasts.

## 10. Dummy data plan

### Data rules

- Store all fixtures locally in JSON or TypeScript constants.
- Use stable IDs so route cards and map overlays remain synchronized.
- Make timestamps relative to a fixed demo clock, not the actual current time.
- Keep source labels explicitly fictional: `Demo traffic feed`, `Synthetic weather forecast`, `Sample city bulletin`.
- Include enough variation to make route comparison meaningful.
- Avoid real personal data, exact private addresses, or real incident claims.

### Suggested fixture files

```text
data/
  demo-trip.json
  routes.json
  places.json
  evidence.json
  weather.json
  news.json
  preferences.json
```

### Core route object

```ts
type DemoRoute = {
  id: string;
  label: 'safest-fit' | 'fastest' | 'cleanest' | 'best-value' | 'balanced';
  mode: 'walk' | 'cab' | 'mixed';
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
  weatherImpact: 'low' | 'medium' | 'high';
  confidence: 'high' | 'medium' | 'limited';
  evidenceIds: string[];
  stopIds: string[];
  mapPath: Array<{ lat: number; lng: number }>;
};
```

### Fixture values for the main demo

Create five intentionally different routes:

| Route | Time | Cost | Walk | Strength | Trade-off |
|---|---:|---:|---:|---|---|
| Safest fit | 32 min | ₹180 | 420 m | Well-lit, populated | 2 min slower |
| Fastest | 30 min | ₹250 | 180 m | Quickest arrival | nightlife-heavy segment |
| Cleanest | 35 min | ₹210 | 500 m | Best sidewalks, low construction | 5 min slower |
| Best value | 38 min | ₹110 | 1.1 km | Saves ₹70 | more walking |
| Balanced | 33 min | ₹195 | 350 m | No major weakness | moderate traffic |

The exact values can be changed for visual fit, but each card must have a clear reason to exist.

## 11. Interaction and component plan

### Reusable components

- `PlannerShell`
- `ContextHandoffSheet`
- `LocationField`
- `StopList`
- `PreferenceChips`
- `RouteMap`
- `RouteCard`
- `TradeoffLine`
- `EvidenceDrawer`
- `SignalBadge`
- `WeatherImpactCard`
- `LocalUpdateCard`
- `PlaceReputationCard`
- `RouteSummaryBar`
- `NoPerfectMatchState`
- `DemoDataTimestamp`

### Required states to design

1. Empty planner.
2. Context detected but not confirmed.
3. Route comparison loading.
4. Route comparison with five options.
5. Selected route.
6. Add-stop search.
7. Reordered stops.
8. Rain warning.
9. Recent news item.
10. No relevant news.
11. No route matches all preferences.
12. Data is stale or low-confidence.
13. Narrow/mobile viewport.
14. Keyboard focus and screen-reader labels.

## 12. Visual direction

### Tone

Calm, trustworthy, clear, and practical. Avoid a fear-heavy visual language. The UI should feel like a thoughtful trip planner, not a crime alert dashboard.

### Color semantics

- Primary route: deep indigo or blue.
- Safety-supporting: teal/green, always paired with text.
- Weather caution: amber.
- High-impact warning: red, reserved for meaningful hazards.
- Neutral comparison: slate/gray.

Do not rely on red vs green alone to distinguish routes. Include labels, icons, and values.

### Map treatment

- Keep the base map quiet so route overlays remain readable.
- Use one strong selected route and lower-opacity alternatives.
- Put important evidence in the route list, not only in map pins.
- Use callouts for “50 m more walk,” “₹70 saved,” and “covered segment.”

## 13. Accessibility and trust requirements

- Meet WCAG 2.2 AA intent for contrast and keyboard access.
- Give interactive targets at least 24 × 24 CSS pixels; use larger targets for primary mobile controls.
- Ensure normal text contrast is at least 4.5:1 where applicable.
- Provide a list alternative for map-only information.
- Use semantic headings, labeled form fields, visible focus states, and logical tab order.
- Make stop reordering possible without drag-and-drop.
- Announce route changes and added stops to assistive technology.
- Avoid flashing or rapidly changing route animations.
- State that the safety view is a decision aid and not a guarantee.
- Show source, timestamp, geographic scope, and confidence for sensitive signals.

## 14. Implementation sequence

### Phase 1 — Fixture and interaction contract

- Create the dummy data model and five route fixtures.
- Define the demo clock and all timestamps.
- Define route selection, preference, stop, and evidence state transitions.

### Phase 2 — Planner shell

- Build the page shell, map placeholder, location fields, context handoff, and preference controls.
- Keep all actions local and deterministic.

### Phase 3 — Route comparison hero

- Build route overlays and synchronized route cards.
- Add recommendation labels and trade-off sentences.
- Add map/list responsive behavior.

### Phase 4 — Stops and route details

- Implement add-stop search, reorder, remove, and detour preview.
- Build route detail drawer and evidence timeline.

### Phase 5 — Time-dependent signals

- Add weather, traffic, news, reputation, and freshness states.
- Add low-confidence and stale-data variants.

### Phase 6 — Polish and demo readiness

- Test the exact judge demo flow.
- Check mobile viewport, keyboard navigation, contrast, and content overflow.
- Remove unexplained placeholders and replace them with intentional empty states.

## 15. Acceptance criteria

The MVP is ready for the designathon when:

- A user can enter a destination and see **4–5 distinct route options**.
- The route cards make time, cost, walking distance, and the primary trade-off visible without opening a drawer.
- The recommended route explains at least three factors behind its recommendation.
- A user can add a stop, see the detour, reorder it, and remove it.
- The UI demonstrates **“walk 50 m more to save ₹70”** or an equivalent explicit cost-saving trade-off.
- Safety preferences can change the recommended route without implying certainty.
- Bars/clubs are represented as an optional nightlife-exposure preference, not as a blanket claim about a place.
- Weather and news items include timestamps and fictional source labels.
- Every dynamic-looking card has a freshness or coverage state.
- The app never starts navigation or redirects the user merely because a walking context was detected.
- The core experience remains usable when data is stale, incomplete, or absent.
- The demo works without network access and without any API key.

## 16. Demo script for presentation

1. Open the planner with the detected building-to-street context.
2. Confirm the origin but do not start navigation.
3. Enter the destination.
4. Select **Safety-first** and enable **Avoid nightlife clusters** plus **Prefer well-lit streets**.
5. Compare the five routes.
6. Point out the “2 min slower,” “₹70 cheaper,” and “lower rain exposure” trade-offs.
7. Open the recommended route evidence.
8. Show the timestamped weather and local-update cards.
9. Add GreenCare Pharmacy as a stop.
10. Reorder the stop and show the new detour summary.
11. Start the selected route preview.
12. End with the product promise: the app does not hide the trade-off; it helps the user choose it.

## 17. Research notes and assumptions

### Confirmed interaction pattern

Google Maps supports multiple destinations and lets users add and reorder stops. The prototype should borrow that familiar mental model while keeping the implementation local and simplified. The official help documentation describes up to nine stops, including the final destination, and drag-based reordering.

### Accessibility baseline

Use WCAG 2.2 as the baseline for contrast, focus, keyboard access, non-color cues, and target sizing. The route list is especially important because a map-only presentation is difficult for many users to inspect.

### Weather evidence pattern

Official weather alert systems distinguish active alerts, areas, and time-sensitive notices. For this prototype, mirror that structure with a severity, affected segment, observed/forecast time, and source label, but keep the data fictional.

### “Flixton data” assumption

The phrase “Flixton data” does not identify a relevant route-planning dataset in the available context. This plan treats it as **fictional/synthetic demo data**. If “Flixton” refers to a specific file or source supplied by the team, replace only the fixture source labels; the UI contract should remain unchanged.

### “Diet data” assumption

The phrase “diet data” appears ambiguous in the request. It is not required for the core route-planning flow, so it is excluded from the MVP. If it means another signal, add it as a new evidence type rather than changing the route card structure.

### Research references

- [Google Maps Help — Get directions, show routes, and add multiple destinations](https://support.google.com/maps/answer/144339/get-directions-amp-show-routes-android?hl=en-GB)
- [W3C — Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/wcag/)
- [National Weather Service — Alerts Web Service](https://www.weather.gov/documentation/services-web-alerts)
