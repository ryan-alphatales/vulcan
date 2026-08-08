# Past Scan Findings Review

**Priority:** High
**Status:** Todo
**Category:** View Scan History and Past Findings

## Feature Intent

This feature lets developers and security team members revisit the complete findings list from any previously executed scan run. Instead of relying on memory or external notes, users can load a historical scan, see every finding with its severity label, current triage state, and AI confidence score, and re-evaluate decisions in context. It reduces the uncertainty of 'was this already reviewed?' and supports accurate triage, audit, and trend awareness without requiring a new scan.

## In Scope

- Loading and displaying all findings belonging to a single, user-selected past scan run
- Showing each finding with its severity label, triage state, and AI confidence score as recorded for that scan run
- Supporting re-evaluation of past findings by presenting the same detail (available explanation, location, fix guidance) that was captured at scan time
- Preserving read-only access to findings and their snapshotted triage state at the time of the selected scan run

## Out of Scope

- Creating, editing, or deleting a scan run or its findings
- Re-running a scan or triggering a new scan from this view
- Generating reports, exporting data, or sending notifications based on findings

## Functional Requirements

1. The product must allow the user to select a past scan run from available scan history and load its complete findings list.
2. The product must display each finding with its severity label as recorded for that scan run, using the available severity levels (e.g., Critical, High, Medium, Low when supplied).
3. The product must display each finding's triage state (e.g., Open, In Progress, Fixed, False Positive when supplied) as it existed at the time of the scan run snapshot.
4. The product must display each finding's AI confidence score as recorded, so the user can judge how much to trust the finding during re-evaluation.
5. The product must present the finding detail that was available at scan time—including plain-language explanation, code location, and any available fix guidance—without requiring the user to open a separate tool.
6. The product must clearly indicate when a finding's source context, explanation, or supporting detail is missing or unavailable, and must not fabricate or guess missing information.
7. The product must preserve this view as read-only; users must not be able to alter the recorded severity, state, or confidence of a past finding from this feature.

## Acceptance Scenarios

- [ ] Given a user selects a scan run that has findings, when the findings list loads, then every finding shows a severity label, a triage state, and a confidence score from that scan run.
- [ ] Given a scan run whose findings include at least one Open state and one Fixed state, when the list renders, then each finding displays its correct triage state and the states are visually distinguishable.
- [ ] Given a scan run where the AI assigned varied confidence scores across findings, when the list renders, then each confidence score is displayed and users can identify which findings have lower confidence.
- [ ] Given a scan run with zero findings (a clean scan), when selected, then the product displays an empty state indicating no findings were detected in that run, not an error.
- [ ] Given a selected scan run is still loading or the data is temporarily unavailable, when the findings cannot be displayed, then the product shows a loading or unavailable state without crashing or showing partial results.
- [ ] Given a finding in the selected scan run has a missing or empty explanation field, when displayed, then the product clearly indicates the explanation is unavailable rather than showing blank space or placeholder text that could be mistaken for a real finding.
- [ ] Given the selected scan run finding detail is displayed, when a user attempts to change the severity or triage state directly in this view, then no edit controls are available because this feature is read-only.

## Edge Cases & States

- Empty state: the selected scan run completed successfully but produced zero findings.
- Loading state: findings data is being fetched for the selected scan run.
- Error/unavailable state: the selected scan run's findings cannot be retrieved due to a transient failure, missing data, or permission issue.
- Large findings list: a scan run contains hundreds of findings; the product must handle the volume without breaking layout or usability.
- Missing or partial finding detail: a finding record exists but its explanation, severity, confidence score, or triage state field is absent or corrupted; the product must degrade gracefully.
- Stale or superseded scan run: a scan run that was replaced by a newer scan of the same code; the product must still display the findings as they were recorded without hiding or mixing newer data.

## Behavior Contract

- The feature must never alter, merge, or overwrite findings data belonging to the selected scan run—it is a read-only presentation layer.
- Each finding's severity label, triage state, and confidence score must be rendered exactly as stored for that scan run snapshot, with no reinterpretation, re-ranking, or live recalculation.
- When a finding's explanation or fix guidance is missing or empty, the product must explicitly indicate unavailability; it must not generate, infer, or fall back to generic text.
- The feature must not expose findings from a different scan run, project, or team unless the user has permission to access those runs.
- The feature must remain independently usable—loading a past scan's findings must not depend on a new scan being in progress or on live AI model availability.

## Data & State

- Scan run identity: an identifier and metadata (e.g., timestamp, scanned code reference, trigger type) sufficient to select and display the correct run.
- Finding record: per-finding data including severity label, triage state, AI confidence score, plain-language explanation, code location reference, and any available fix guidance as recorded at scan time.
- Triage state values: the set of supported triage states (e.g., Open, In Progress, Fixed, False Positive when supplied) that a finding can have.
- Severity levels: the set of available severity labels (e.g., Critical, High, Medium, Low when supplied) used to classify findings.
- Finding list state: transient UI state for the currently loaded scan run, including loading, empty, error, and loaded states.
- Missing-data indicators: state flags or markers that signal when a field is absent or unavailable per finding, distinct from valid empty or zero values.

## Actions & Triggers

- User selects a past scan run from available scan history to load its findings.
- System fetches and returns the complete findings list for the selected scan run on demand.
- User scrolls or navigates through a large findings list (pagination or virtual scrolling behavior as resolved by implementation).
- User views the detail of a single finding within the list (expand, inline, or drill-down behavior as resolved by implementation).

## API / Integration Needs

- Needs a way to retrieve the list of available past scan runs for the current project or team context.
- Needs a way to fetch all findings for a specific scan run, including each finding's severity label, triage state, confidence score, explanation, code location, and fix guidance.
- Needs a way to fetch the detail of a single finding when users drill down, returning the full recorded snapshot for that finding.

## Permissions & Ownership

- Only project team members with access to the scan history must be able to view past scan findings.
- Access to a scan run's findings must respect the same project or team boundary that governs the scan run itself.
- Findings are owned by the scan run and project; no individual user ownership or assignment modification is permitted from this read-only view.

## Verification Required

- Confirm that selecting any past scan run from history loads all its findings with the correct severity, triage state, and confidence score as recorded at scan time.
- Confirm that a scan run with zero findings displays a clear empty state, not an error or blank screen.
- Confirm that when findings data cannot be retrieved, the product shows an appropriate error or unavailable state and does not display partial or misleading data.
- Confirm that the view is truly read-only: no UI control or API call allows modifying severity, triage state, confidence score, or any other finding field.
- Confirm that missing explanation or fix guidance fields per finding are clearly marked as unavailable and not populated with fallback or placeholder text.
