# Raah — User Workflow

**Document status:** Designathon MVP workflow  
**Version:** 1.0  
**Date:** October 25, 2026  
**Product requirements:** [`PRD.md`](PRD.md)  
**Technical requirements:** [`TRD.md`](TRD.md)  

## 1. Workflow objective

This document describes what the user sees, chooses, and expects at each step of the Raah journey.

The main rule is:

> **Detection can suggest context; only the user can confirm a trip and start a route.**

Raah should feel like an app from the first screen: branded shell, logo, calm transitions, clear navigation, and one focused action at each stage.

## 2. End-to-end journey map

```text
Launch app
  ↓
Branded app shell / context suggestion
  ↓
Confirm or change origin
  ↓
Enter destination
  ↓
Choose travel mode and preferences
  ↓
Compare 4–5 route options
  ↓
Inspect trade-offs and evidence
  ↓
Add or reorder optional stops
  ↓
Review updated route comparison
  ↓
Choose a route
  ↓
Pre-start confirmation
  ↓
Start route preview
  ↓
Review route, evidence, or change route
```

## 3. App shell workflow

### Entry point

The user may:

- Open Raah from a browser URL.
- Open Raah from a home-screen/app icon.
- Reload Raah while offline.

### What the user sees

- Raah logo and name.
- Short product line: **“Choose the route that fits you.”**
- Current demo status: **Synthetic demo data · Offline-ready**.
- Primary planner content.
- Optional install hint if the browser supports installation.

### Expected behavior

- The shell appears before the route content.
- There is no blank white loading screen.
- No permission request or redirect is required for the demo.
- The user can dismiss an install suggestion and continue normally.

## 4. Main workflow: safe, cost-aware trip

### Step 1 — Context suggestion

**Screen:** Context handoff sheet

**Example content:**

> “Looks like you’re walking from North Campus Library.”

**Actions:**

- **Use as starting point**
- **Change**
- **Not now**

**User intention:** confirm where the trip begins.

**System response:**

- Use as starting point → fill the origin field and continue to trip setup.
- Change → open origin suggestions/search.
- Not now → dismiss the sheet and leave the origin available for manual entry.

**Important:** none of these actions starts navigation.

### Step 2 — Enter destination

**Screen:** Trip setup

The user taps the destination field and sees local dummy suggestions, for example:

- Indiranagar Metro Gate 3.
- Central Market.
- Home.
- Office.

The user selects **Indiranagar Metro Gate 3**.

**System response:**

- The destination appears as a selected location row.
- The **+ Add stop** action becomes prominent.
- Compare routes remains disabled until a valid destination is selected.

### Step 3 — Select travel mode

The user chooses one:

- **Walk** — emphasizes walking comfort, lighting, crossings, and rain exposure.
- **Cab** — emphasizes fare, pickup distance, traffic, and arrival time.
- **Mixed** — combines walking and cab segments.

The default demo mode is **Mixed** because it creates visible time/cost/walking trade-offs.

### Step 4 — Select priorities

The user chooses a leading preference:

- Fastest.
- Safest fit.
- Cleanest.
- Lowest cost.

Then the user can enable optional chips:

- Prefer well-lit streets.
- Prefer populated streets.
- Avoid nightlife clusters.
- Reduce walking.
- Avoid rain exposure.
- Women-focused preferences.

**Recommended judge flow:**

- Leading preference: **Safest fit**.
- Enabled: **Prefer well-lit streets**.
- Enabled: **Avoid nightlife clusters**.

### Step 5 — Compare routes

The user taps **Compare routes**.

The app shows a short local loading transition, then five route cards and their map lines.

The route comparison summary says:

```text
5 routes · Safety-first · Demo time 7:20 PM
```

The user sees:

| Route | What is immediately visible |
|---|---|
| Safest fit | 32 min · ₹180 · 420 m walk · better-lit and populated |
| Fastest | 30 min · ₹250 · 180 m walk · quickest, but nightlife exposure |
| Cleanest | 35 min · ₹210 · 500 m walk · better sidewalks |
| Best value | 38 min · ₹110 · 1.1 km walk · saves ₹70 |
| Balanced | 33 min · ₹195 · 350 m walk · moderate traffic |

### Step 6 — Understand the trade-offs

The user should not need to open five detail pages to understand the choices.

Example visible messages:

- **Safest fit:** “2 min slower · ₹70 cheaper than direct cab · low nightlife exposure.”
- **Fastest:** “Fastest arrival · passes one nightlife-heavy segment.”
- **Best value:** “₹70 cheaper · 50 m more walking in the final segment.”
- **Cleanest:** “Cleaner sidewalks · 5 min slower.”
- **Balanced:** “No major weakness · moderate traffic near Market Road.”

The user can click a route card or map line to select it.

### Step 7 — Inspect route evidence

The user taps **View evidence** for the Safest fit route.

The evidence drawer opens and shows:

1. Why this route is a good fit.
2. Lighting coverage.
3. Populated-segment coverage.
4. Incident trend period and scope.
5. Nightlife exposure.
6. Weather and covered walking.
7. Traffic condition.
8. Recent fictional local update.
9. Confidence and freshness.

Example evidence card:

```text
Recent local update
Streetlight maintenance near Market Road
May affect visibility between 8:00–10:00 PM
Sample city bulletin · Today, 6:40 PM · Demo item
```

The drawer includes:

> “Raah is a planning aid. These are synthetic demo signals and do not guarantee personal safety.”

The user closes the drawer with Close, Escape, or the browser-like back control inside the panel.

### Step 8 — Add a stop

The user taps **+ Add stop**.

The stop panel shows fictional suggestions:

- GreenCare Pharmacy.
- Corner Café.
- Main Gate pickup.
- Community Help Desk.

The user selects **GreenCare Pharmacy**.

Before adding it, Raah shows:

```text
GreenCare Pharmacy
Open until 10:00 PM · staffed · trusted nearby stop
Detour: +6 min · ₹0 extra
```

The user taps **Add stop**.

The stop list becomes:

```text
1. North Campus Library
2. GreenCare Pharmacy
3. Indiranagar Metro Gate 3
```

The route comparison updates locally.

### Step 9 — Reorder the stop

If multiple stops exist, the user can:

- Drag GreenCare Pharmacy to a different position.
- Use Move up or Move down.

After reordering, Raah shows a small update message:

> “Route updated for the new stop order · +2 min compared with the previous order.”

The selected route remains selected if it still exists. If the route set changes, the app explains that the options were refreshed.

### Step 10 — Choose a route

The user chooses **Safest fit** and taps **Choose route**.

The app opens the pre-start confirmation screen.

### Step 11 — Pre-start confirmation

The user reviews:

```text
Safest fit
38 min total · ₹180 · 620 m walking · 1 stop
Why: better-lit, more populated, lower nightlife exposure
Caution: light rain may begin around 8:00 PM
```

Actions:

- **Start route**
- **Edit route**
- **Back to routes**

The app does not start until the user taps Start route.

### Step 12 — Active route preview

The user taps **Start route**.

The app shows a static/lightly interactive active preview:

- Selected route line.
- Current segment.
- Next stop: GreenCare Pharmacy.
- “Rain likely in 35 min” notice.
- “You selected this route because it has stronger lighting and lower nightlife exposure.”

Actions:

- View evidence.
- Change route.
- Add stop.
- End preview.

## 5. Alternate workflow: fastest route

1. User confirms origin.
2. Enters destination.
3. Selects **Fastest**.
4. Does not enable safety preference chips.
5. Compares routes.
6. Chooses the 30-minute route.
7. Reads the caveat that it passes one nightlife-heavy segment.
8. Confirms the route.

The product must not block the user from choosing the fastest option. It should make the caveat visible and let the user decide.

## 6. Alternate workflow: lowest-cost route

1. User confirms origin.
2. Enters destination.
3. Selects **Lowest cost**.
4. Chooses Mixed mode.
5. Sees the Best value route at ₹110.
6. Reads: **“Walk 50 m more and save ₹70.”**
7. Selects the route.
8. Confirms the longer walk before starting.

This flow demonstrates that cost reduction is a transparent choice, not a hidden compromise.

## 7. Alternate workflow: rain-aware route

1. User enters origin and destination.
2. Enables **Avoid rain exposure**.
3. Raah highlights routes with more covered walking.
4. The Cleanest or Safest fit route may become recommended even if it takes five minutes longer.
5. The user opens the weather evidence.
6. The user sees the forecast window and covered-distance explanation.

Example:

```text
5 min longer · 280 m under cover · light rain likely from 8:00–8:40 PM
```

## 8. Alternate workflow: women-focused preferences

1. User opens More preferences.
2. Enables **Women-focused preferences**.
3. Raah explains what changes:
   - More weight on well-lit segments.
   - More weight on populated streets.
   - Preference for open/staffed places.
   - Avoidance of isolated shortcuts.
4. User accepts or edits individual chips.
5. Route results update.

The interface must not imply that this is the only legitimate safety mode or that the resulting route is guaranteed safe.

## 9. Stop management workflow

### Add stop

```text
Trip setup or active preview
  → Tap Add stop
  → Search/select local place
  → Review detour and opening/reputation info
  → Confirm add
  → Route totals update
```

### Reorder stop

```text
Stop list
  → Drag row OR tap Move up/Move down
  → Preview updated order
  → Route totals and route cards update
```

### Remove stop

```text
Stop row
  → Tap Remove
  → Show small undo opportunity
  → Update route totals
```

The remove action should not require a disruptive confirmation dialog for a simple local demo; use Undo where appropriate.

## 10. Evidence workflow

### Open evidence

The user can open evidence from:

- A route card.
- A map route line.
- The pre-start confirmation.
- The active route preview.

### Evidence hierarchy

1. **Why this route** — plain-language summary.
2. **Trade-offs** — what improves and what worsens.
3. **Signals** — lighting, population, traffic, weather, cleanliness, reputation.
4. **Recent update** — only if route-relevant.
5. **Freshness/confidence** — timestamp and limitations.

### No relevant update

If there is no recent route-relevant item, show:

> “No recent route-relevant updates in this demo area.”

Do not leave an empty gap or invent a warning.

## 11. Error and recovery workflows

### No destination selected

- Compare routes is disabled.
- Destination field receives focus.
- Message: **“Choose a destination to compare routes.”**

### No route matches all preferences

Show:

> “No route matches every preference. Relax one preference to see the closest options.”

Actions:

- Remove Avoid nightlife clusters.
- Remove Avoid rain exposure.
- Show all routes.

### Limited evidence

The route remains usable, but the evidence card says:

```text
Limited evidence
This demo route has fewer recent signals. Review the available factors before choosing.
```

### Offline

Show a non-blocking banner:

> “Offline demo mode: showing synthetic local data.”

The route comparison continues to work.

### Browser does not support installation

Do not show a broken install button. Show a help item:

> “Raah works in your browser. Installation is not available in this browser.”

### Reordered stop creates a poor route

Show the updated time/cost and allow the user to undo or choose another route. Do not silently restore the old order.

## 12. Back and cancellation behavior

- Closing the context sheet returns the user to the planner.
- Closing evidence returns to the same selected route.
- Closing stop search returns to the previous route state.
- Back from pre-start confirmation returns to route comparison.
- Back from active preview returns to pre-start confirmation or route comparison, depending on the last explicit state.
- Browser refresh returns to the planner safely; it must not auto-start an active route.

## 13. Mobile workflow

On a narrow viewport:

1. App shell remains visible.
2. Planner fields are stacked vertically.
3. Map/list toggle is always available.
4. Route cards use a full-width stack.
5. Evidence opens as a bottom sheet.
6. Stop rows use visible Move up/Move down controls.
7. The main action is sticky near the bottom but does not cover content.

## 14. Desktop workflow

On a desktop viewport:

1. The app shell uses a two-column layout.
2. The left side shows the map/schematic route canvas.
3. The right side shows the route list.
4. The route summary remains visible while cards scroll.
5. Evidence opens as a right-side drawer.
6. The selected route remains visually connected between map and list.

## 15. Accessibility workflow

### Keyboard path

The main journey must be possible with:

```text
Tab → confirm origin → Tab → destination → Enter
Tab → mode → Tab → preference → Tab → Compare routes
Tab → route card → Enter
Tab → View evidence → Enter
Escape → close evidence
Tab → Add stop → Enter
Tab → stop suggestion → Enter
Tab → Move up/Move down
Tab → Choose route → Enter
Tab → Start route → Enter
```

### Non-color path

Routes are distinguished through:

- Text labels.
- Route names.
- Line patterns or widths.
- Icons.
- Visible metrics.

### Screen-reader path

- Route cards expose route name, time, cost, walking, benefit, caveat, and selected state.
- The evidence drawer is announced as a dialog.
- Route result changes are announced.
- Stop order changes are announced.

## 16. Judge demonstration workflow

The entire demo should fit in approximately three to five minutes:

```text
0:00  Launch Raah and show logo/app shell.
0:20  Confirm detected origin without starting navigation.
0:40  Enter destination and select Safety-first.
1:00  Enable well-lit + avoid nightlife.
1:20  Compare five routes and call out trade-offs.
2:00  Open evidence: weather, traffic, local update, confidence.
2:40  Add GreenCare Pharmacy stop.
3:00  Reorder stop and show updated totals.
3:30  Choose Safest fit route.
3:50  Start active route preview.
4:20  Close with “the user chooses the trade-off.”
```

## 17. Workflow acceptance criteria

- [ ] User can open Raah as a normal web app.
- [ ] App shell, name, and logo are visible immediately.
- [ ] Context detection never starts navigation by itself.
- [ ] User can enter a destination from local suggestions.
- [ ] User can choose Walk, Cab, or Mixed.
- [ ] User can choose Fastest, Safest, Cleanest, or Lowest cost.
- [ ] User can enable well-lit, populated, nightlife, walking, rain, and women-focused preferences.
- [ ] User sees five meaningful route options.
- [ ] User understands at least one time trade-off and one cost trade-off.
- [ ] User can open evidence with timestamps and fictional sources.
- [ ] User can add GreenCare Pharmacy or another dummy stop.
- [ ] User can reorder stops without drag and drop.
- [ ] User can choose a route and explicitly start the active preview.
- [ ] User can recover from missing destination, stale data, offline mode, and no-perfect-match states.
- [ ] User can complete the main workflow with keyboard access.
