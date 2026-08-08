# Scan Run History List

**Priority:** High
**Status:** Todo
**Category:** View Scan History and Past Findings

## Feature Intent

The developer needs to see what scans have already run, when they ran, and what they found, so they can locate a past scan without searching through notifications, tickets, or CI logs. This feature gives Vulcan users a single, chronological record of every scan attempt, making it easy to find the right scan run before drilling into its findings or comparing results across time.

## In Scope

- Display a chronological list of past scan runs, ordered with the most recent scan run first by default
- Show repository, branch, scan date, and finding count for each listed scan run when that data is available from the scan record
- Keep the list read-only — viewing history does not modify, delete, or retrigger any scan
- Support enough scan-run identity metadata so the user can distinguish similar runs (for example, same repo and branch scanned at different times)

## Out of Scope

- Drill-down into a single scan run's findings listing or detail view
- Re-triggering, cancelling, or scheduling scans from this history view
- Comparing two or more scan runs side by side or diffing finding counts across runs

## Functional Requirements

1. The product must display a list of past scan runs sourced from the available scan-run records.
2. The product must order the list chronologically, with the most recent scan run appearing first by default.
3. For each scan run, the product must show the repository identifier, branch name, scan date, and total finding count when those values are available in the scan-run record.
4. The product must preserve and display the scan-run identity (such as a run ID or scan timestamp) so the user can distinguish one run from another even when repository and branch are the same.
5. The product must indicate when a listed scan run has missing or unavailable metadata (for example, missing branch name or unknown finding count) rather than showing misleading defaults.
6. The product must keep the history view read-only; no scan-modifying action may be triggered from this list.
7. The product must handle the empty state when no scan runs exist yet and clearly tell the user that no scan history is available.

## Acceptance Scenarios

- [ ] Given at least one completed scan run exists, when the user opens the scan run history, then the list shows that scan run with its repository, branch, scan date, and finding count at a minimum.
- [ ] Given multiple scan runs exist for the same repository and branch, when the user views the list, then each run appears as a separate row with its own scan date and finding count, and the user can tell them apart.
- [ ] Given no scan runs have been performed yet, when the user opens the history, then the product shows a clear empty-state message indicating no scan history is available.
- [ ] Given a scan-run record is missing its branch name, when the list displays that run, then the product clearly indicates the branch is unknown rather than showing a blank or a made-up value.
- [ ] Given the most recent scan run is from three days ago and an older scan run is from seven days ago, when the user opens the list, then the three-day-old scan appears before the seven-day-old scan.
- [ ] Passes if the list never offers edit, delete, retrigger, or cancel actions on any scan-run row.
- [ ] Fails if the list invents a finding count (such as zero) when the scan-run record did not supply one.

## Edge Cases & States

- Empty state: No scan runs have been completed; the list area must show an informative empty message instead of a blank table.
- Loading state: Scan-run records are being fetched; the list must indicate loading without showing stale or partial data.
- Partial metadata: A scan-run record exists but one or more expected fields (repository, branch, date, finding count) are absent or corrupted; the row must clearly mark those fields as unavailable.
- Large history: Hundreds of scan runs exist across many repositories; the list must remain usable (for example, through pagination or lazy loading) without degrading to an unscrollable wall of data.
- Permission-limited: The authenticated user has access to some scan runs but not all; only runs the user is permitted to see appear in the list.
- Concurrent new scan: A scan completes while the user is viewing the history; the list must either reflect the new run on next load or the user must have a way to refresh without losing their place.

## Behavior Contract

- The history list must never alter, delete, or retrigger scan-run records; it is strictly a read-only view.
- Scan-run ordering must be deterministic: most recent first by scan date. If two runs share the same timestamp, the tie-breaking rule must be consistent and repeatable.
- Missing metadata must be rendered as an explicit unavailable indicator, never as a silent default value that could be mistaken for real data.
- The list must not fabricate scan runs; only runs that have been recorded by the scan system may appear.
- Returning to the history list after navigating away must reflect the current state of scan-run records (up to reasonable freshness), not a stale snapshot held indefinitely.

## Data & State

- Scan-run record: unique run identifier, repository identifier, branch name, scan start or completion timestamp, total finding count, and scan status (for example, completed, failed, in-progress).
- List ordering state: the current sort key (scan date) and direction (descending by default).
- Pagination or windowing state: current page or cursor position when the full history exceeds a single load.
- Empty-state flag: derived boolean indicating whether zero scan runs exist for the current user scope.
- Metadata-availability flags per field: indicates whether repository, branch, date, and finding count are present or missing for each row.

## Actions & Triggers

- User opens the scan run history view to see past scans.
- User scrolls or paginates through a long list of scan runs.
- User refreshes the list to see newly completed scans.
- System records a new scan-run completion; that run becomes available in the history on the next data load.

## API / Integration Needs

- Needs a way to fetch a paginated, chronologically ordered list of scan-run summaries for the authenticated user's authorized scope.
- Needs a way to retrieve per-run metadata fields: repository, branch, scan date, finding count, and run status.
- Needs a way to filter or scope scan-run history by at least the authenticated user's permitted repositories or projects.

## Permissions & Ownership

- Only authenticated users with access to a repository or project may see scan runs belonging to that repository or project.
- The product must enforce the existing project or repository access boundary; no user may view scan-run history they are not authorized to see.
- If the product supports team or organization roles, scan-run visibility must respect those roles without exposing cross-team scan data.

## Verification Required

- Verify that a user with multiple completed scans sees them ordered most-recent-first with repository, branch, date, and finding count displayed per run.
- Verify that a user with no scan history sees a clear empty-state message, not a blank screen or error.
- Verify that a scan run with missing branch or finding count metadata displays an explicit unavailable label rather than a default value.
- Verify that pagination or lazy loading works correctly when more scan runs exist than fit in one view.
- Verify that a user cannot see scan runs belonging to a repository they do not have access to.
- Verify that no edit, delete, or retrigger controls appear anywhere in the scan-run history list view.
