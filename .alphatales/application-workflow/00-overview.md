# Application Workflow

## Overview

Vulcan's first version is a desktop application for Indian SMB developers who need to find and fix security vulnerabilities in their code without a dedicated security team. The app authenticates developers, connects their GitHub or GitLab repositories, triggers scans on pull requests, and delivers one accurate finding with a plain-language explanation and confidence score directly into the PR review. Developers can triage findings as false positive, fixed, or open, revisit scan history, and gracefully recover from scan failures — all without leaving their workflow.

## Included Groups

- Access & Setup
- Core Journey
- Review & Trust
- Output & Handoff
- Ongoing Management
- Recovery Paths
- Admin & Operations

## Main Actors

- Developer (Indian SMB, no dedicated security team)
- Developer
- Administrator

## Decision Points

- Developer decides whether to log in with an existing account or sign up for a new one.
- Developer must recall or retrieve their credentials if forgotten.
- System decides whether credentials are valid and the account is in good standing.
- Which past scan run does the developer need to revisit?
- Which filters (severity, triage state, keyword) help the developer narrow down findings?
- Does the developer need to re-triage a finding after reviewing it again?
- How far back should the dashboard default date range go for a first-time admin view?
- Should failure rate thresholds trigger a visible warning or just be displayed passively?
- Whether to sign up with email or use a third-party provider like GitHub — email-only is assumed for v1
- Whether the developer completes profile details or skips — optional for v1
- Whether the verification link is acted on within the expiry window — system must handle expired links
- Which Git provider to connect: GitHub or GitLab?
- Which specific repository should Vulcan monitor from the available list?
- Whether to grant the requested OAuth permissions or cancel the connection.
- Which export format (PDF, shareable link) best suits the recipient?
- Does the recipient need the full scan report or only selected findings?
- Should the shareable link be time-limited or require authentication?
- Whether the confidence score is high enough to trust the AI's explanation without additional manual verification
- Whether the plain-language explanation and suggested fix are specific and actionable enough for the developer to proceed
- Whether to accept the finding as valid or suspect it may be a false positive
- Retry the scan or proceed without scan results
- Choose to investigate further if failures repeat
- Developer decides whether a data leak flag is a real risk or a false positive based on the confidence score and code context.
- Developer chooses the triage state: false positive, fixed, or open.
- Product team decides when to activate data leak detection based on v1 trust and false-positive performance.
- Whether to trust a finding with low confidence score or escalate for manual review
- Whether to merge the PR despite an open finding or wait for resolution
- Whether to mark a finding as false positive, fixed, or leave it open for later attention
- Whether to re-run the scan if the PR is updated with new commits after initial findings are posted
- Which triage state to assign: False Positive, Fixed, or Open?
- Whether to trust a low-confidence AI finding or escalate for deeper review?

## Assumptions

- The developer has already completed FLOW-001 (Sign Up and Create Account) before this flow.
- Login uses email and password authentication for the first version.
- The desktop app supports a persistent session so the developer is not logged out after every close.
- The workspace view exists as a minimal dashboard showing connected repositories and recent scan activity.
- Forgot-password recovery is handled by a separate supporting flow or is deferred to a later version.
- The Vulcan desktop app includes a scan history workspace accessible after login.
- Scan runs are persisted and linked to the developer's account and connected repository.
- Findings retain their triage state across sessions and can be revisited at any time.
- The first version does not include notifications; the developer proactively checks scan history.
- An administrator role exists separately from the developer role with distinct login credentials.
- The desktop app includes an admin view even though admin features are deferred to later versions.
- Scan and user activity data is collected and stored even in v1 to enable the dashboard when built.
- Email and password is the only sign-up method for v1; third-party OAuth (GitHub, Google) is deferred
- The verification email is delivered reliably and within a few minutes
- The developer has access to their email inbox during sign-up
- The desktop app is a web-based desktop experience (Next.js/React) and not a native Electron app
- Password strength rules are basic (minimum length and complexity) without requiring MFA for v1
- Developer has already signed up and logged into Vulcan (FLOW-001 complete).
- Developer has an existing account on GitHub or GitLab with at least one repository.
- The Vulcan desktop app can open a browser window for OAuth flows.
- OAuth integration with GitHub and GitLab is supported for first version.
- Read-only repository access and webhook creation scope is sufficient for scan operations.
- This flow is deferred to later versions and is not built in v1; it is documented for future planning only.
- The export surface would live in the Vulcan desktop dashboard, not inside a PR comment.
- Shareable links would be generation-time snapshots, not live views of scan results.
- GitHub/GitLab integration already exists (FLOW-003, FLOW-004) as prerequisites for any scan data to export.
- The developer opens the finding from a desktop application, either linked from the PR comment or from the Vulcan dashboard
- Finding detail view exists in the Vulcan desktop app and loads data from the backend after a scan completes
- The confidence score is calculated by the AI model and returned with each finding from FLOW-004
- Low-confidence threshold is pre-configured in v1 rather than user-customisable
- The developer is authenticated and has access to the repository and scan in question
- The developer notices the PR comment or status check where Vulcan posts the failure message
- A retry mechanism exists that re-queues the scan without requiring repository reconnection
- Timeouts are configured at a sensible default (e.g., 5-10 minutes) that balances completeness with CI pipeline speed
- The failure does not block the PR merge — the developer always retains the option to proceed without scan results
- Repository access failures are distinguishable from AI model failures so the right context can be shown
- Data leak detection is added as a scan mode that runs alongside (not instead of) general vulnerability scanning.
- The same PR review delivery surface used for vulnerability findings is reused for data leak findings.
- The confidence score and triage state model from vulnerability findings applies identically to data leak findings.
- The developer already has a connected repository and scan history from using v1 vulnerability scanning.
- Data leak findings do not block the PR merge; they are advisory like all other findings.
- Repository is already connected via FLOW-003 before the scan can trigger
- Vulcan integrates with GitHub and/or GitLab as the repository platform
- The AI scan completes within a reasonable time window so it does not block the PR review flow
- Findings are posted as a bot comment or status check inside the PR, not as inline diff annotations
- A Vulcan desktop dashboard or web view exists for viewing full finding details when the developer clicks through from the PR
- The developer has an authenticated Vulcan account (FLOW-001) so scan history and triage decisions are persisted
- The developer has already reviewed the finding (FLOW-005) before reaching triage.
- Triage controls are available both inside the PR review interface and on the Vulcan desktop app.
- The desktop app is the primary surface for triage actions when accessed outside the PR.
- A confirmation step is needed for False Positive to prevent accidental dismissal of real issues.
- Finding state changes are saved immediately and reflected in scan history (FLOW-007).
- The confidence threshold for flagging 'needs human review' is preset by Vulcan in v1; no user configuration is needed.

## Risks

- Developer forgets their password and has no recovery path in v1, blocking access entirely.
- Session token expires too aggressively on a desktop app, forcing repeated logins and frustrating the user.
- Credential validation failure shows a vague error message that confuses the developer about whether the account exists.
- If the workspace fails to load after login due to missing data or backend issues, the developer sees a blank screen with no guidance.
- If scan history loads slowly with many past runs, the developer may abandon the feature.
- Filtering or search may return empty results if the developer misremembers finding details, causing frustration.
- Past findings shown without context of the original PR diff may be hard to re-evaluate.
- The history view could feel disconnected from the PR review surface, reducing its usefulness in the core loop.
- Building admin dashboard now would divert engineering effort from the core developer scan-review-triage loop.
- Indian SMB developers may never need an admin dashboard, making this feature unused overhead.
- Operational data collection without privacy controls could expose sensitive user activity patterns.
- Developer abandons sign-up if the verification email is delayed or lands in spam
- Indian SMB developers may expect social login (GitHub/Google) and bounce if only email sign-up is offered
- Password-only authentication without MFA may be seen as too weak by security-conscious developers
- Account creation may fail silently on the backend, leaving the developer confused about whether they have an account
- Developer may refuse to grant OAuth permissions if the requested access scope feels too broad, blocking the connection entirely.
- OAuth flow failure or timeout on the provider side leaves the developer stuck without clear recovery guidance.
- Repository list fetch may time out for developers with a large number of repositories, causing frustration.
- Webhook registration failure could silently prevent scans from triggering on future pull requests.
- If GitHub or GitLab change their API or OAuth requirements, the connection flow could break without notice.
- Indian SMB developers on slow or intermittent internet connections may experience mid-flow dropouts during OAuth.
- Exporting sensitive vulnerability data outside the PR review surface creates a parallel channel that could leak findings if links are poorly access-controlled.
- Shareable link persistence and revocation are not designed yet; links could outlive the intended sharing window.
- The deferred status means users who need this capability in v1 will have no workaround, potentially blocking adoption in teams with external compliance reviewers.
- PDF reports could become stale the moment a finding is retriaged, creating confusion between the report snapshot and live state.
- AI explanations may be too generic or templated, eroding developer trust even when the confidence score is high
- Developers may ignore low-confidence flags if they appear too frequently, defeating the human-review safety net
- Confidence scores may not correlate with actual accuracy, causing developers to trust faulty findings or dismiss correct ones
- Findings viewed outside the PR context may lack sufficient code context for the developer to make an informed decision
- The visual distinction between high-confidence and low-confidence findings may be too subtle, causing the flag to be overlooked
- Developers may ignore failure messages if they appear too often, eroding trust in the integration
- Repeated scan failures could push teams to disable Vulcan entirely, matching the known CI/CD abandonment pattern
- A vague failure message (e.g., 'scan failed') without actionable detail will frustrate users and drive disengagement
- If retry does not work on the first attempt, the developer has no further recovery path in v1
- The desktop app may not be open when the scan fails, so the PR comment is the sole notification surface
- AI may flag benign hardcoded values as secrets, increasing false positives and eroding developer trust.
- Developers may ignore data leak findings if they are too noisy or delivered alongside a large volume of vulnerability findings.
- PII detection in Indian context may misidentify local naming patterns or ID formats, reducing accuracy for the target market.
- Internal URL detection may generate false alarms for standard framework routes or localhost references that are not real leaks.
- If data leak scanning significantly increases scan time, developers may disable the feature or the entire integration.
- Scan latency could frustrate developers if results take too long to appear after the PR is opened
- A scan that returns zero findings may make developers doubt whether Vulcan actually ran, reducing trust
- Developers may ignore the PR comment if it looks like automated noise, especially in repos with many bot integrations
- If Vulcan cannot access the repository due to expired tokens or permission changes, the scan fails silently without the developer noticing
- Low-confidence findings that are suppressed might include real vulnerabilities that go undetected, creating a false sense of security
- Developer marks a real vulnerability as False Positive and introduces a security gap into production code.
- Low-confidence findings are ignored because the developer lacks security expertise to judge them.
- Triage state changes do not persist, causing findings to reappear and eroding trust.
- Developer rushes through triage without reading the explanation, defeating the purpose of the review flow.
- No undo or revert makes it hard to correct a mistaken triage decision.

