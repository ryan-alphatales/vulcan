# Scan Failure Notice in PR

**Priority:** High
**Status:** Todo
**Category:** Handle Failed or Incomplete Scan

## Feature Intent

Developers should know immediately when a Vulcan security scan on their pull request did not complete — without leaving GitHub to check logs or dashboards. This feature posts a clear, scannable failure message directly in the PR review thread that names the reason the scan could not finish. It reduces the uncertainty of silent scan failures, prevents unreviewed code from being merged by mistake, and keeps the developer in their normal PR workflow.

## In Scope

- Posting a single failure notice in the PR review thread when a scan cannot complete
- Including a human-readable reason for the scan failure in the notice
- Ensuring the notice is posted only once per failed scan run
- Making the failure visible to PR participants without requiring them to leave GitHub

## Out of Scope

- Retrying the scan automatically after a failure
- Posting scan results or findings — this feature covers failure notices only
- Updating or deleting the failure notice once posted
- Providing a dashboard or external notification (e.g., Slack, email) for scan failures

## Functional Requirements

1. The product must detect when a Vulcan scan triggered on a pull request did not complete successfully.
2. The product must post a message in the PR review thread indicating the scan failed to complete.
3. The product must include in the failure notice the reason the scan did not complete, using available failure context (for example: timeout, repository access denied, configuration error, internal error).
4. The product must format the failure notice so that PR participants can distinguish a scan failure from a scan that produced findings or passed clean.
5. The product must prevent duplicate failure notices for the same scan run on the same pull request.
6. The product must preserve the existing PR review thread content when posting the failure notice — it must not overwrite or delete other comments.
7. The product must post the failure notice under the identity of the Vulcan integration, clearly labeled as an automated message.

## Acceptance Scenarios

- [ ] Given a PR triggers a Vulcan scan and the scan fails with a timeout, when the failure is detected, then a single comment appears in the PR thread stating the scan failed due to timeout.
- [ ] Given a PR triggers a Vulcan scan and the scan fails because the repository is not accessible, when the failure is detected, then a single comment appears in the PR thread stating the scan failed due to repository access issues.
- [ ] Given a PR triggers a Vulcan scan and the scan completes successfully, when the scan finishes, then no failure notice is posted in the PR thread.
- [ ] Given a PR triggers a Vulcan scan that fails, and the failure notice is already posted for that scan run, when the failure event is processed again, then no duplicate comment is posted.
- [ ] Given a PR triggers a Vulcan scan that fails, when the failure notice is posted, then the notice is distinguishable from a normal scan results comment (for example, it clearly states the scan did not complete rather than listing findings).
- [ ] Given a PR with existing review comments, when a scan failure notice is posted, then none of the existing comments are modified or removed.

## Edge Cases & States

- Scan failure is detected but the failure reason is unknown or cannot be determined — the notice must indicate the scan failed with the reason marked as unavailable.
- The Vulcan integration loses permission to post PR comments between scan start and failure detection — the implementation must handle this gracefully and surface the permission loss through available operational channels.
- The PR is merged or closed before the failure notice can be posted — the notice should still be posted if possible, or the failure must be logged as undelivered with the reason.
- Multiple scan runs on the same PR fail for different reasons — each distinct run produces its own failure notice without duplication.
- The failure notice content exceeds the PR comment character limit — the notice must be truncated with a clear indicator that the full reason may be incomplete.
- A network or API error occurs while posting the failure comment — the implementation must retry at least once and surface persistent posting failures through available operational channels.

## Behavior Contract

- The failure notice must never contain raw stack traces, internal error codes, or system-level details that are meaningless to a developer reviewing a PR.
- The failure notice must always identify itself as an automated Vulcan message so recipients can distinguish it from human review comments.
- A failure notice must be posted exactly once per failed scan run — idempotency must be maintained even if the failure event is delivered multiple times.
- The product must not post a failure notice for a scan that is still in progress — it must wait for a terminal failure state before posting.
- The product must not silently drop a scan failure — every detected failure must either result in a posted notice or a logged delivery failure with reason.

## Data & State

- Scan run identifier — to tie the failure notice to a specific scan attempt and enforce idempotency.
- Pull request identifier — the target PR where the notice must be posted.
- Failure reason — a machine-readable category (for example: timeout, access_denied, config_error, internal_error) and a human-readable description.
- Notice posted flag — indicates whether the failure notice has already been successfully posted for this scan run.
- Delivery failure state — records when a failure notice could not be posted and the reason (for example: permission denied, PR merged, API error).

## Actions & Triggers

- A scan run reaches a terminal failure state — this triggers evaluation for posting a failure notice.
- The product calls the GitHub PR review comment API to post the failure notice.
- If the initial post attempt fails, the system retries once before recording a delivery failure state.

## API / Integration Needs

- GitHub Pull Request Review Comments API — needed to post the failure notice in the PR thread.
- GitHub Checks API (optional) — needed if the product also updates the check run status to failed alongside the comment.
- A way to receive scan failure events from the Vulcan scan orchestration system — either through an internal event bus, webhook, or status polling mechanism.
- A way to retrieve the scan run's failure reason from the scan orchestration system.

## Permissions & Ownership

- The Vulcan GitHub integration must have permission to create PR review comments on repositories where it is installed.
- Only the Vulcan integration identity may post failure notices — individual users cannot trigger or impersonate the notice.
- Repository write access is not required for the integration — PR comment permission is sufficient.
- Team members with access to the PR can view the failure notice — the notice inherits the existing PR visibility rules.

## Verification Required

- Verify that a scan timeout produces exactly one failure comment in the PR thread with a timeout reason.
- Verify that a successful scan produces no failure comment.
- Verify that the same failure event processed twice produces only one comment.
- Verify that the failure comment does not contain raw stack traces or internal system identifiers.
- Verify that when the GitHub comment API returns an error, the system retries once and logs a delivery failure if the retry also fails.
