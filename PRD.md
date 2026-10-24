# Raah — Product Requirements Document (PRD)

**Document status:** Designathon MVP requirements  
**Version:** 1.0  
**Date:** October 25, 2026  
**Related documents:** [`plan.md`](plan.md), [`TRD.md`](TRD.md), [`user workflow.md`](user%20workflow.md)

## 1. Document purpose

This document defines what the product must do and what the user must be able to experience. It converts the route-planning idea into a clear, demo-ready product requirement set.

The product is a **web app that behaves like an installed app**. In this document, the phrase “app-like web app” means a Progressive Web App (PWA): it remains a website when opened by URL, but can be installed with an icon and launched in a standalone window. It is **not** a Kotlin/Android-native application and it is not a generic static website.

### Assumptions

- “PWB” in the request is interpreted as **PWA** because the requested behavior is an installable, standalone web app.
- All route, map, safety, weather, traffic, reputation, news, and pricing content is fictional local fixture data.
- The MVP does not use live APIs, a backend, user accounts, payments, GPS tracking, or real navigation.
- “Flixton data” is treated as synthetic/demo data unless the team supplies a specific dataset later.

## 2. Product summary

### Working product name

**Raah** — a route comparison app that helps people choose a route based on their priorities instead of receiving one unexplained path.

### One-line value proposition

> **Raah helps you choose the route that fits your time, cost, comfort, and safety preferences.**

### Product promise

Raah makes route trade-offs visible:

- “2 minutes faster.”
- “₹70 cheaper.”
- “50 m more walking.”
- “Lower rain exposure.”
- “Better-lit and more populated segments.”

It must never claim that a route is guaranteed safe. It presents evidence and preferences as decision support.

## 3. Goals

### Primary goals

1. Deliver a polished, app-like route-planning experience for a designathon demo.
2. Present 4–5 meaningful route alternatives instead of one opaque recommendation.
3. Make fastest, cleanest, safest-fit, balanced, and lowest-cost trade-offs obvious.
4. Let users add, remove, and reorder stops.
5. Show time-dependent-looking evidence with timestamps, confidence, and fictional source labels.
6. Make the product feel installable and complete: name, logo, app shell, splash/loading state, icon, standalone layout, and responsive behavior.
7. Work offline with deterministic local dummy data.

### Secondary goals

- Support walking, cab, and mixed walking + cab options.
- Support optional preferences such as avoiding nightlife clusters, preferring well-lit streets, and reducing rain exposure.
- Make the interface accessible to keyboard and assistive-technology users.
- Create a clear judge-facing story that can be demonstrated in under five minutes.

## 4. Non-goals

The MVP will not:

- Provide actual crime prediction or guarantee personal safety.
- Track the user continuously or run background location tracking.
- Use live map, traffic, weather, news, crime, or pricing APIs.
- Provide real turn-by-turn navigation.
- Require sign-in, profile creation, or payment information.
- Build a production routing engine.
- Verify real businesses, incident reports, or news claims.
- Treat bars, clubs, or neighborhoods as inherently unsafe. “Avoid nightlife clusters” is a user-selected preference.

## 5. Target users

### Primary persona — Careful commuter

A student, worker, or visitor leaving a building and travelling through a city who wants to compare routes before choosing one.

**Needs:**

- Understand the route quickly.
- See why the recommendation was made.
- Avoid unwanted street conditions.
- Add a stop such as a pharmacy, café, or pickup point.
- Balance time, cost, walking, comfort, and safety preferences.

### Secondary persona — Budget-conscious traveller

Wants a cheaper route and is willing to walk farther when the savings are clear.

### Secondary persona — Rain-sensitive traveller

Wants lower exposure to rain, puddles, construction, or uncovered sidewalks.

## 6. Primary use case

```text
At 7:20 PM, a user leaves North Campus Library and wants to reach
Indiranagar Metro Gate 3. They prefer well-lit and populated streets,
want to avoid nightlife-heavy segments, and want to keep the cab fare low.
Rain is possible after 8:00 PM. They also want to stop at GreenCare Pharmacy.
```

### Success story

1. Raah shows a calm “we detected a walking context” handoff.
2. The user confirms the building as the origin; navigation does not start.
3. The user enters a destination and selects Safety-first.
4. Raah shows five routes with visible time, price, walking, weather, and safety-supporting factors.
5. The user sees that one route is fastest, one saves ₹70, and the recommended route has stronger lighting and lower rain exposure.
6. The user adds GreenCare Pharmacy as a stop and reorders it before the final destination.
7. The user opens evidence, reads the fictional local update and weather note, then chooses Start route.

## 7. Brand and app identity requirements

### Product name

The working product name is **Raah**. The name can change later, but it must be used consistently across the app shell, manifest, page title, install prompt, splash screen, and logo assets.

### Logo direction

The logo must communicate **route + guidance + reassurance**, not fear or surveillance.

**Recommended mark:**

- A rounded square app icon.
- A single curved route line forming a subtle “R”.
- The route terminates in a small waypoint/compass dot.
- A soft shield contour may surround the route, but the icon must remain readable at 32 × 32 px.

**Recommended palette:**

- Deep indigo: primary brand and selected route.
- Mint/teal: guidance and safety-supporting states.
- Warm amber: weather or freshness caution.
- Off-white: app shell background.

**Logo requirements:**

- Provide SVG for in-app use.
- Provide 192 × 192 and 512 × 512 PNG/PWA icon exports.
- Provide a monochrome version for browser/system contexts.
- Do not use a siren, weapon, CCTV camera, red alert triangle, or fear-based imagery.
- The logo should work on both light and dark backgrounds.

### App-shell requirements

- Branded splash/loading state with the Raah mark.
- App-like header with logo, current trip state, and a compact menu.
- No page should feel like an unstyled document or a generic Kotlin demo screen.
- On small screens, use a bottom navigation or bottom action bar with large touch targets.
- On desktop, use a two-column planner shell with persistent route summary.

## 8. Product experience

### 8.1 App entry and context handoff

When the demo starts, Raah may show a detected-context card:

> “Looks like you’re walking from North Campus Library.”

Actions:

- **Use as starting point:** fills the origin only.
- **Change:** opens origin search.
- **Not now:** dismisses the suggestion.

**Required behavior:** context detection must never silently start navigation, redirect to another page, or lock the user into a route.

### 8.2 Trip setup

The user can set:

- Origin.
- Destination.
- Optional stops.
- Travel mode: Walk, Cab, Mixed.
- Leading preference: Fastest, Safest, Cleanest, Lowest cost.
- Optional preference chips:
  - Prefer well-lit streets.
  - Prefer populated streets.
  - Avoid nightlife clusters.
  - Reduce walking.
  - Avoid rain exposure.
  - Women-focused preferences.

Primary action: **Compare routes**.

### 8.3 Route comparison

The comparison screen is the product’s hero experience.

It must show:

- A quiet map-style visualization with 4–5 route lines.
- A synchronized list of route cards.
- A selected route state.
- A clear preference summary.
- A fixed demo timestamp.
- A visible option to switch between map and list on narrow screens.

Each route card must show without opening details:

1. Total time.
2. Cost in INR where relevant.
3. Walking distance.
4. Route label.
5. Main benefit.
6. Main trade-off or caveat.
7. At least two supporting signals.
8. Confidence/freshness context.
9. **View evidence** and **Choose route** actions.

### 8.4 Required route options

The main fixture must include five distinct options:

| Label | Example | Main value | Main trade-off |
|---|---|---|---|
| Safest fit | 32 min · ₹180 · 420 m walk | Better-lit and populated | 2 min slower |
| Fastest | 30 min · ₹250 · 180 m walk | Quickest arrival | More nightlife exposure |
| Cleanest | 35 min · ₹210 · 500 m walk | Better sidewalk quality | 5 min slower |
| Best value | 38 min · ₹110 · 1.1 km walk | Saves ₹70 | More walking |
| Balanced | 33 min · ₹195 · 350 m walk | No major weakness | Moderate traffic |

Exact values may change for visual balance, but each route must have a clear reason to exist.

### 8.5 Trade-off language

Every route needs a plain-language trade-off sentence:

```text
[benefit] · [time/cost difference] · [main caveat]
```

Examples:

- “2 min slower · ₹70 cheaper · 50 m more walking.”
- “Fastest option · passes one nightlife-heavy segment.”
- “Lower rain exposure · 5 min longer because of covered footpaths.”
- “Cleaner and more populated · cab pickup is 120 m away.”

### 8.6 Add-stop flow

Users must be able to:

- Tap **+ Add stop**.
- Choose from fictional places/categories.
- See the estimated detour before confirming.
- Reorder stops by drag and drop.
- Reorder stops with Move up/Move down controls as a non-drag alternative.
- Remove a stop.
- See route totals update locally.

Example:

```text
1. North Campus Library
2. GreenCare Pharmacy       +6 min detour · open until 10:00 PM
3. Indiranagar Metro Gate 3
```

### 8.7 Evidence drawer

The evidence drawer explains the selected route using:

- Lighting coverage.
- Populated vs isolated segments.
- Incident trend for a stated period.
- Nightlife exposure.
- Road crossings.
- Nearby open/staffed/public places.
- Traffic.
- Rain probability and covered distance.
- Cleanliness and construction.
- Reputation of optional stops.
- Recent fictional local update.

Every time-dependent item must show:

- Signal name.
- Short value or explanation.
- Timestamp or period.
- Fictional source label.
- Confidence or coverage note.

Required disclaimer:

> “Raah is a planning aid. Route signals are synthetic demo data and do not guarantee personal safety.”

### 8.8 Pre-start confirmation

Before the user starts the route, show:

- Selected route.
- Total time, cost, walking, and stop count.
- Why it matches the selected preferences.
- Important weather/news caveat.
- **Start route**, **Edit route**, and **Back to routes** actions.

### 8.9 Active route preview

The prototype can be static or lightly interactive. It should show:

- Selected route line.
- Next segment.
- Upcoming stop.
- Current route reason.
- Weather or local-update notice.
- Actions to view evidence, change route, or add a stop.

## 9. Functional requirements

### Must-have requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-01 | The app opens to a branded Raah planner shell. | Must |
| FR-02 | The app can be used as a normal web page without installation. | Must |
| FR-03 | The app provides an installable standalone experience when supported by the browser. | Must |
| FR-04 | The user can confirm or dismiss a detected origin context without starting navigation. | Must |
| FR-05 | The user can enter an origin and destination from local suggestions. | Must |
| FR-06 | The user can choose Walk, Cab, or Mixed mode. | Must |
| FR-07 | The user can select Fastest, Safest, Cleanest, or Lowest cost. | Must |
| FR-08 | The user can enable or disable route preference chips. | Must |
| FR-09 | The app shows 4–5 distinct route alternatives. | Must |
| FR-10 | Each route card shows time, cost, walking distance, benefit, caveat, and evidence access. | Must |
| FR-11 | The user can select a route and see it highlighted in the map visualization. | Must |
| FR-12 | The user can open a route evidence drawer. | Must |
| FR-13 | The user can add, reorder, and remove stops. | Must |
| FR-14 | Stop changes update dummy route totals and trade-off copy. | Must |
| FR-15 | The app demonstrates a clear cost-saving trade-off such as walking 50 m more to save ₹70. | Must |
| FR-16 | Weather, traffic, news, reputation, and incident-trend cards show timestamps and demo sources. | Must |
| FR-17 | The user can choose Start route only after reviewing a selected route. | Must |
| FR-18 | The app works with no network connection after initial load. | Must |
| FR-19 | The app has an empty state, loading state, warning state, stale-data state, and no-perfect-match state. | Must |
| FR-20 | The app provides an accessible list alternative to map information. | Must |

### Should-have requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-21 | The app offers a Women-focused preferences preset with an explanation of changed signals. | Should |
| FR-22 | The user can toggle between map and list views on narrow screens. | Should |
| FR-23 | The app shows an install prompt or install instructions when supported. | Should |
| FR-24 | The active preview can switch to another route without losing the trip. | Should |
| FR-25 | The user can copy/share a local trip preview without sending private data to a server. | Should |

### Could-have requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-26 | Add a fictional “nearby support places” filter. | Could |
| FR-27 | Add route comparison animations. | Could |
| FR-28 | Add a theme toggle. | Could |

## 10. Safety, trust, and content requirements

- Never use “guaranteed safe,” “crime-free,” or “safe for everyone.”
- Use **safest fit** instead of absolute safety claims.
- Never turn a single crime value into a personal risk prediction.
- Show the period and geographic scope of incident-trend fixtures.
- Label all synthetic content as demo data where it could be mistaken for real information.
- Keep nightlife avoidance optional and preference-based.
- Separate Trusted, Premium, and Safety-supporting labels.
- Do not imply Premium means safe.
- Do not use real private addresses or real people.
- Make warning content calm, specific, and actionable.

## 11. Accessibility requirements

- Keyboard users can reach every input, chip, card action, drawer, and stop control.
- Stop reordering works without drag and drop.
- Color is never the only route distinction.
- Map information has a readable list representation.
- Focus states are visible.
- Interactive controls use accessible names.
- Route changes are announced where appropriate.
- Text remains readable at increased zoom.
- Error and warning messages are associated with their controls.

## 12. Success criteria

The designathon MVP is successful when a first-time user can complete the main demo without explanation:

1. Understand the app’s purpose within 10 seconds.
2. Enter a destination and compare five routes.
3. Identify the safest-fit, fastest, and best-value options.
4. Understand at least one time trade-off and one money trade-off.
5. Add and reorder a stop.
6. Open evidence and understand why the selected route is recommended.
7. See that all data is time-stamped and synthetic.
8. Start the route preview only after making an explicit choice.

## 13. Demo script

1. Launch Raah in the app-like shell.
2. Show the logo and the detected walking-context card.
3. Confirm the origin without starting navigation.
4. Enter the destination.
5. Choose Safety-first, Prefer well-lit streets, and Avoid nightlife clusters.
6. Compare the five route cards.
7. Call out “2 min slower,” “₹70 cheaper,” and “lower rain exposure.”
8. Open evidence and show timestamps and fictional source labels.
9. Add GreenCare Pharmacy as a stop.
10. Reorder the stop and show the detour update.
11. Choose Start route.
12. Show the active route preview and the product message: **Raah makes the trade-off visible so the user stays in control.**

## 14. Release checklist

- [ ] Raah name is consistent in title, manifest, splash, and navigation.
- [ ] Logo SVG and PWA icon files exist.
- [ ] App opens as a responsive web experience.
- [ ] Standalone install metadata is present.
- [ ] Offline dummy data works.
- [ ] Five routes are visible.
- [ ] Add-stop flow works.
- [ ] Evidence drawer works.
- [ ] Warnings and disclaimers are visible.
- [ ] Keyboard and mobile checks are complete.
- [ ] No live API keys or private data are present.
