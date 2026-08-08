# Visual QA — Vulcan desktop UI

## Comparison target

- Source visual truth: `/tmp/codex-clipboard-NdAfnm.png`, `/tmp/codex-clipboard-XQA8BV.png`, and `/tmp/codex-clipboard-mofXNN.png`.
- Browser-rendered implementation: `artifacts/visual-qa/login.png`, `artifacts/visual-qa/workspace.png`, and `artifacts/visual-qa/repositories.png`.
- Viewport: 1600 x 800 CSS px, device scale factor 1, dark color scheme.
- Source dimensions: 1600 x 774 px. Implementation dimensions: 1600 x 800 px. For full-view comparison, implementation captures were top-cropped to 1600 x 774 without scaling: `*-normalized.png`.
- States: unauthenticated login; authenticated workspace with existing connected repositories and scan data; authenticated GitHub repository-selection screen.

## Browser evidence

- Full-view comparisons: `artifacts/visual-qa/comparisons/login.png`, `artifacts/visual-qa/comparisons/workspace.png`, and `artifacts/visual-qa/comparisons/repositories.png`. Each is source on the left and implementation on the right.
- Focused comparisons: `artifacts/visual-qa/comparisons/login-form-focus.png`, `artifacts/visual-qa/comparisons/workspace-focus.png`, and `artifacts/visual-qa/comparisons/repositories-focus.png`.
- Primary interactions checked with Playwright: login render, authenticated workspace render, navigation to scan history, repository search filtering to an empty result and back to the repository list.
- Browser console: no errors observed.

**Findings**

- No actionable P0/P1/P2 visual mismatches remain.
- Intentional content difference: the workspace reference is an empty first-use state, while the tested implementation shows the existing account's connected repositories, scans, and findings. The visual hierarchy, layout, controls, and styling remain aligned with the reference state.

## Required fidelity surfaces

- Fonts and typography: matched dark sans display hierarchy with compact monospace labels, controlled headline wrapping, uppercase eyebrow labels, and readable row metadata.
- Spacing and layout rhythm: desktop split login, centered dashboard shell, repository-picker width, section spacing, cards, and row density align to the reference composition.
- Colors and visual tokens: charcoal surfaces, muted slate text, teal status accents, and orange primary/active accents are consistent across all three views.
- Image quality and asset fidelity: the generated hex-grid security texture is used as the login backdrop; icon-library assets are used for brand, repository, search, and status symbols. No handcrafted visual substitutes are used.
- Copy and app content: reference-style labels and actions are retained. Live repository/scan data intentionally replaces mock names and empty-state counts.

## Comparison history

- Initial iteration — [P2] Login headline and form measure were visually too wide relative to the source. Fixed by narrowing the form to 326 px, reducing the left story inset, and constraining the headline scale/wrap. Evidence after fix: `artifacts/visual-qa/comparisons/login.png` and `artifacts/visual-qa/comparisons/login-form-focus.png`.

**Open Questions**

- None.

**Implementation Checklist**

- [x] Capture same-viewport browser renders for all three supplied desktop references.
- [x] Verify navigation and repository-search interaction using Playwright.
- [x] Compare full views and focused regions after the corrective iteration.
- [x] Check browser console output.

**Follow-up Polish**

- [P3] If provider sign-in is later enabled in the authentication module, its controls can be added to the login page to mirror the optional GitHub/GitLab buttons visible in the source mock.

## Full-route visual-system extension

- Browser-rendered evidence: `artifacts/visual-qa/landing.png`, `register.png`, `verify.png`, `connect.png`, `history.png`, and `scan-detail.png` at 1600 x 800 CSS px, device scale factor 1.
- Full-route overview: `artifacts/visual-qa/all-routes-overview.png`.
- States: landing; new-account form; invalid/incomplete verification-link recovery; authenticated provider choice; authenticated history populated from existing test data; authenticated scan-detail view populated from existing test data.
- Interaction evidence: navigation to scan history and scan-detail page; repository provider action links render; registration and verification form controls render; existing repository-search filter behavior remains covered by the prior capture.
- Console: no errors observed in the Playwright run.

**Findings**

- No actionable P0/P1/P2 visual-system inconsistencies remain across the additional routes.
- The account and recovery screens deliberately use the established split security backdrop, while operational views use the persistent application navigation and charcoal data surfaces. This keeps authentication distinct without drifting from the same typography, teal/orange tokens, border treatment, and button language.
- Live account, repository, scan, and finding values replace the mock content in the supplied references; this is an intentional product-data difference, not a visual mismatch.

**Implementation Checklist**

- [x] Apply the visual system to landing, registration, verification, provider connection, recovery, history, scan-detail, and global-error routes.
- [x] Preserve form submissions, OAuth links, history links, rescan action, and finding triage controls.
- [x] Capture and inspect all newly styled route families via Playwright.

## Motion refinement

- Added: short entrance transitions for route content, subtle hover elevation for actionable cards and controls, a gentle live-status glow, and a restrained scanning line in the terminal panel.
- Accessibility: all non-essential animation and transition duration collapses under `prefers-reduced-motion: reduce`.
- Browser evidence: refreshed `artifacts/visual-qa/workspace.png` and the complete Playwright route suite after motion was added; no console errors observed.

## On-demand scan control

- Added the authenticated workspace “On-demand scan” panel. It keeps the established card and action language while exposing the functional repository selector, pull-request number field, and queue action.
- Browser evidence: `artifacts/visual-qa/workspace.png`; the Playwright route run verified the visible form controls and input state without creating a new external pull-request comment.

final result: passed
