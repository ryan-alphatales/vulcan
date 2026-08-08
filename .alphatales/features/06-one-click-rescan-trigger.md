# One-click Rescan Trigger

**Priority:** High
**Status:** Todo
**Category:** Handle Failed or Incomplete Scan

## Feature Intent

Developers need to recover quickly when a security scan fails or does not complete on a pull request. This feature lets the developer restart the scan on the same PR with a single retry action and receive clear confirmation that a new scan has been queued, so they do not have to close and reopen the PR, push a dummy commit, or manually trigger a scan elsewhere. It reduces the uncertainty of whether a failed scan will be retried and keeps the PR workflow moving without requiring security team intervention.

## In Scope

- A single retry action available to the developer on the same pull request that had a failed or incomplete scan
- Clear confirmation that a new scan is queued, distinct from the previous failed or incomplete scan result
- The rescan must scan the same source code context (same PR, same branch, same commit at time of trigger) that was originally scanned
- The previous scan result must remain viewable and must be clearly marked as superseded or replaced by the new scan

## Out of Scope

- Changing scan sensitivity, scope, or configuration at retry time — retry uses the same scan settings as the original run
- Automatically retrying scans on failure without user action (auto-retry logic)
- Bulk rescan across multiple PRs or repositories

## Functional Requirements

1. The product must provide a single retry action that the developer can trigger from the same pull request context where a scan failed or did not complete.
2. The product must prevent triggering a rescan when a scan is already in progress on the same pull request.
3. The product must clearly indicate that the new scan is queued and distinguish that state from the previous failed or incomplete scan.
4. The product must preserve the previous scan result and make it available for review after the rescan is triggered, with a clear indicator that it has been superseded.
5. The product must scan the same source code context — same pull request, branch, and commit — as the scan being retried.
6. The product must clearly indicate when a rescan cannot be triggered because the source context is no longer available (for example, the PR has been merged, closed, or the branch deleted).
7. The product must use the same scan configuration (sensitivity, scope, rules) as the original scan when triggering the rescan.

## Acceptance Scenarios

- [ ] Given a pull request with a failed scan, when the developer triggers the rescan action, then a new scan is queued and the product shows a confirmation that the scan is queued (not still in the failed state).
- [ ] Given a pull request with an incomplete scan, when the developer triggers the rescan action, then the new scan begins and the previous incomplete result is preserved and marked as superseded.
- [ ] Given a pull request with a scan currently in progress, when the developer attempts to trigger a rescan, then the product prevents the action and clearly indicates that a scan is already running.
- [ ] Given a pull request whose branch has been deleted or the PR has been merged, when the developer attempts to trigger a rescan, then the product prevents the action and clearly indicates why the rescan is unavailable.
- [ ] Given a pull request with a completed successful scan, when the developer views the scan result, then the rescan action is either unavailable or clearly labeled as a new scan (not a retry), and no failed/incomplete state is implied.

## Edge Cases & States

- Scan is already in progress — rescan trigger must be disabled or refused with a clear message.
- PR has been merged or closed — rescan trigger must be unavailable with a clear reason.
- Source branch has been deleted — rescan trigger must be unavailable because the code context is gone.
- Previous scan result is missing or corrupted — rescan must still be allowed, and the missing/corrupted state must be clearly indicated on the previous result.
- Multiple rapid rescan clicks — the product must prevent duplicate queuing and only queue one rescan per trigger.
- The queued rescan itself fails — the product must treat this as a new failed scan, not overwrite the original failure silently, and the rescan action must remain available for another retry.

## Behavior Contract

- A rescan must never overwrite or delete the previous scan result — it creates a new scan run linked to the same pull request.
- Only one scan may be in progress per pull request at any time — the product must enforce this at trigger time.
- The rescan action must use the identical scan configuration as the original run — no configuration changes are permitted through the retry path.
- The product must preserve the full chain of scan runs per pull request so users can see scan history, not just the latest result.
- The product must never silently fail — if the rescan cannot be queued, the reason must be visible to the developer who triggered it.

## Data & State

- Pull request identifier and source branch/commit reference for the scan context
- Previous scan run status (failed, incomplete, completed) and its association to the pull request
- New scan run status (queued, in progress, completed, failed) linked to the same pull request and marked as a retry of the previous run
- Rescan availability state derived from PR status (open/closed/merged) and branch existence
- Scan configuration snapshot used for the original scan, preserved so the retry uses the same settings

## Actions & Triggers

- Developer triggers the rescan action from the pull request context where a failed or incomplete scan exists
- System validates that no scan is already in progress for the same pull request before queuing
- System queues a new scan with the same scan configuration and source context as the original
- System updates the scan status for the pull request to reflect the new queued scan and marks the previous result as superseded

## API / Integration Needs

- Needs a way to trigger a scan run for a specific pull request and commit reference using the stored scan configuration
- Needs a way to check whether a scan is currently in progress for a given pull request before allowing a rescan
- Needs a way to retrieve the current state of the pull request (open, closed, merged) and branch existence to determine rescan availability
- Needs a way to surface rescan availability status and scan queued confirmation back to the pull request context where the developer is working

## Permissions & Ownership

- The developer who has access to the pull request must be able to trigger the rescan — no elevated security-team permissions required
- The product must preserve existing repository and pull request access boundaries — a user without access to the PR must not be able to trigger a rescan on it
- Scan history and previous results must remain visible to anyone with access to the pull request's scan results

## Verification Required

- Verify that triggering a rescan on a PR with a failed scan queues a new scan and shows confirmation without requiring a page refresh or manual poll.
- Verify that the previous failed scan result is still accessible and clearly marked as superseded after the rescan is queued.
- Verify that attempting to rescan a PR with an in-progress scan is blocked with a clear message.
- Verify that the rescan action is unavailable (with a clear reason) when the PR is merged, closed, or the branch is deleted.
- Verify that rapid double-clicking the rescan action queues exactly one scan, not multiple.
