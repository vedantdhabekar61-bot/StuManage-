# DeskTrack (StuManage) — Play Store Readiness Review, Launch Plan, and PRD

## 1) Current Logic Review (What looks solid vs. risky)

### Solid areas
1. **Role-gated app shell and auth flow are in place**: `AuthProvider` + `AuthGuard` wrap the app, and unauthenticated users are routed to `/login`.
2. **Subscription gating exists** via `SubscriptionGuard` and trial-first-run redirect logic.
3. **PWA baseline is implemented** (`manifest.json`, theme color, standalone display, installable icon set).
4. **Mobile-focused UI composition** is present (`max-w-md`, fixed bottom nav, touch-friendly cards/buttons).

### Logic and release risks to fix before Play Store launch
1. **Revenue metric can be misleading**: `revenueThisMonth` currently sums all paid students, not only payments made in the current month. This can inflate “Monthly Income.”
2. **Pending fees may overcount**: all non-paid students are summed irrespective of whether payment is actually due now.
3. **Pull-to-refresh detection relies on `window.scrollY < 0`** which is unreliable across Android WebView/Chrome scroll physics and may fail silently on many devices.
4. **Potential over-aggressive scaling lock**: `userScalable: false` can hurt accessibility and may conflict with Android accessibility expectations.
5. **Bottom nav hidden routes are hardcoded** and could drift as routes evolve; risk of nav appearing where it should not, or vice versa.
6. **Android “native feel” gaps**: no explicit handling of hardware back behavior, install prompts, offline fallback UX, and no adaptive icon/asset validation workflow documented.

### Decision
**Not fully Play Store-ready yet** for a polished, native-Android feel. Core foundations are good, but analytics correctness, pull-to-refresh reliability, accessibility, and release hardening should be completed first.

---

## 2) Step-by-Step Play Store Launch Plan (No charts)

### Phase A — Product correctness and UX hardening (Week 1)
1. **Lock metric definitions**
   - Define exact formulas for: Monthly Income, Pending Fees, Overdue, Urgent.
   - Implement month-bounded revenue (use `lastPaymentDate` month/year filtering).
   - Validate with seeded test data (edge cases: leap month, timezone boundary, partial payments).
2. **Fix due-state logic**
   - Separate `paymentStatus` from `billingDueDate` logic.
   - Only show Pending Fees when due/overdue by policy.
3. **Replace pull-to-refresh implementation**
   - Use robust gesture handling (touch threshold + overscroll container logic) compatible with Android Chrome PWA behavior.
4. **Accessibility pass**
   - Re-enable scalable text unless strict business reason.
   - Ensure color contrast, tap-target size (>=48dp), and focus visibility.

### Phase B — Native Android feel and reliability (Week 2)
5. **Navigation behavior parity**
   - Define hardware-back behavior screen-by-screen.
   - Prevent accidental exits from key flows; add confirmation where needed.
6. **Offline and low-connectivity UX**
   - Show cached state, sync indicators, retry flows.
   - Define error messages for Supabase/network failures.
7. **Installability polish**
   - Validate Web App Manifest fields, icon quality, splash behavior.
   - Add in-app “Install app” education and post-install tips.

### Phase C — Play compliance and quality gates (Week 3)
8. **Privacy, terms, and data disclosure alignment**
   - Ensure Play Data Safety form matches real data collection/storage.
   - Confirm account deletion and data export paths if required by policy.
9. **QA matrix execution**
   - Devices: low-end Android, mid-tier, flagship; Android 10–15.
   - Test scenarios: auth, subscription, payment verify/create-order, reminders, trial transition.
10. **Performance targets**
   - First contentful paint, interaction latency, and dashboard load SLA.
   - Remove animation jank on low-end devices.

### Phase D — Release operations (Week 4)
11. **Internal testing track**
   - Publish to Internal track, collect crash and ANR signals.
12. **Closed testing track**
   - Roll out to pilot customers, collect retention and task-completion feedback.
13. **Production staged rollout**
   - Start 5%, then 20%, then 50%, then 100% with stop/go checks at each stage.
14. **Post-launch monitoring**
   - Daily review: crashes, payments, subscription conversions, reminder delivery rates.

---

## 3) Comprehensive PRD

## 3.1 Product overview
**Product name:** DeskTrack (StuManage)

**Problem statement:** Reading room/library operators need a fast mobile-first system to manage students, seat occupancy, dues, and reminders without spreadsheet friction.

**Vision:** Deliver a simple, trustworthy Android-first management app that feels native, works reliably in real-world network conditions, and reduces missed payments.

## 3.2 Goals and non-goals
### Goals
1. Reduce admin time spent on daily student/payment tracking.
2. Improve on-time fee collection via actionable alerts and reminders.
3. Provide clear occupancy and revenue visibility.
4. Offer a smooth installable Android app experience.

### Non-goals (v1 launch)
1. Multi-branch enterprise analytics.
2. Desktop-first workflow optimization.
3. Complex accounting integrations.

## 3.3 Target users
1. **Primary:** Single-location reading room/study library admins.
2. **Secondary:** Small multi-seat operators with lightweight staffing.

## 3.4 Key use cases
1. Add student with seat and fee details in <60 seconds.
2. Detect overdue/pending payments quickly from dashboard.
3. Send reminders with minimal taps.
4. Mark student paid and auto-extend expiry correctly.
5. Track available seats in real time.

## 3.5 Functional requirements
### FR-1 Authentication and session
- User can sign in/out; unauthorized users cannot access protected pages.
- Session state persists safely and recovers on reload.

### FR-2 Student lifecycle
- Create, edit, archive/delete student records.
- Store: name, seat, price, status, payment metadata, expiry date.

### FR-3 Billing and dues logic
- Define payment states: Paid, Pending, Overdue.
- Monthly income must include only payments posted in current calendar month.
- Pending fees must represent due amounts under defined policy.

### FR-4 Alerts and reminders
- Dashboard “urgent actions” reflects deterministic logic:
  - Overdue dues
  - Pending dues due soon/now
  - Renewals approaching within configurable threshold (default 3 days)

### FR-5 Seats and occupancy
- Show total seats, active students, available seats.
- Prevent invalid seat assignments when full (policy-configurable).

### FR-6 Subscription/trial gates
- Trial users are guided through trial flow once.
- Billing state controls premium features predictably.

### FR-7 Android install + app shell
- Installable PWA with correct manifest/icons/theme/splash.
- Bottom navigation consistent across protected routes.

### FR-8 Connectivity and resilience
- User sees clear loading, retry, and failure states.
- Background refresh and manual refresh both work on Android devices.

## 3.6 Non-functional requirements
1. **Performance:** dashboard interactive within 2.5s on mid-tier Android over 4G.
2. **Reliability:** core flows success rate >= 99% excluding third-party outages.
3. **Security:** least-privilege API access and server-side verification for payments.
4. **Accessibility:** scalable text, keyboard focus cues, adequate contrast.
5. **Localization-ready:** date/currency handling resilient to locale/timezone.

## 3.7 UX requirements for native Android feel
1. Touch targets >= 48dp.
2. Predictable back navigation (including hardware back).
3. Smooth transitions without blocking input.
4. Clear haptics/feedback equivalents (visual + micro-interactions).
5. Offline indicators and sync status transparency.

## 3.8 Analytics and success metrics
### North-star metric
- Weekly active admins completing at least one billing action.

### Supporting KPIs
1. On-time payment rate.
2. Reminder-to-payment conversion.
3. Median time to add/update student.
4. 7-day retention for new installs.
5. Crash-free sessions and ANR rate.

## 3.9 Acceptance criteria (launch gate)
1. Metric definitions signed off by product + finance stakeholder.
2. Payment and reminder flows pass end-to-end QA on Android 10–15.
3. No P0/P1 bugs open.
4. Crash-free session rate >= 99.5% in closed testing.
5. Play Console listing, privacy policy, and data safety completed and validated.

## 3.10 Risks and mitigations
1. **Metric mistrust risk** → add deterministic tests + seeded fixtures.
2. **Network instability** → add offline cache + retry UX.
3. **Policy rejection risk** → pre-verify data safety disclosures and account management policy.
4. **Payment edge-case risk** → reconcile webhook/verify route and idempotency controls.

## 3.11 Release checklist (operational)
1. Version bump and changelog finalized.
2. Internal track smoke test complete.
3. Closed track feedback triaged.
4. Staged rollout guardrails configured.
5. Incident rollback playbook ready.

---

## 4) Immediate Action Backlog (Recommended next sprint)
1. Correct dashboard revenue/pending-fee formulas.
2. Harden refresh behavior for Android scrolling.
3. Improve accessibility settings (font scaling and contrast checks).
4. Add route-policy abstraction for BottomNav visibility.
5. Execute Android QA matrix and close high-severity defects.

