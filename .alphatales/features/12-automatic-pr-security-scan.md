# Automatic PR Security Scan

**Priority:** High
**Status:** Todo
**Category:** Trigger Security Scan on Pull Request

## Feature Intent

Development teams need security findings to reach code review without requiring someone to remember to run a scan. This feature automatically queues and runs a Vulcan security scan whenever a developer opens or updates a pull request on a connected repository. The outcome is that every PR arrives at review with scan findings already attached, reducing the risk that vulnerable code merges unnoticed and eliminating the manual step that teams routinely skip under delivery pressure.

## In Scope

- Automatically detecting when a pull request is opened or updated (new commits pushed) on a connected repository
- Queuing and running a Vulcan security scan against the code changes associated with the pull request
- Making scan findings available in the context of the pull request so reviewers can see them during code review
- Preserving the link between the scan run and the specific pull request for traceability

## Out of Scope

- Manual scan triggering UI (this feature is about automatic triggering only)
- Blocking or auto-closing pull requests based on scan results (merge gating is a separate feature)
- Scanning branches or commits that are not associated with an open pull request
- Configuring scan sensitivity, scope, or custom rules (handled by scan configuration features)

## Functional Requirements

1. The product must detect when a pull request is opened or receives new commits on a connected repository and automatically queue a security scan.
2. The product must run the queued scan against the code changes in the pull request and associate the resulting findings with that pull request.
3. The product must make scan findings available in the pull request context so reviewers can see them without navigating to a separate tool.
4. The product must clearly indicate the scan status (queued, in progress, completed, failed) so reviewers know whether findings are ready.
5. The product must preserve traceability between each scan run and the specific pull request that triggered it, including when the scan ran and what code revision was scanned.
6. The product must handle cases where a scan is already queued or running for a PR when new commits are pushed, avoiding duplicate or stale scans.
7. The product must clearly indicate when scan results are unavailable due to a scan failure, timeout, or integration error, and must not silently omit findings.

## Acceptance Scenarios

- [ ] Given a connected repository with the PR scan feature enabled, when a developer opens a new pull request, then a scan is automatically queued and its status becomes visible in the PR context within a reasonable time.
- [ ] Given an open pull request with a completed scan, when a developer pushes new commits, then a new scan is automatically queued for the updated code and the previous scan results are replaced or clearly marked as outdated.
- [ ] Given a pull request with a queued or in-progress scan, when a reviewer opens the PR, then the scan status (queued or in-progress) is clearly indicated so the reviewer knows findings are not yet available.
- [ ] Given a pull request with a completed scan, when the reviewer views findings in the PR context, then each finding includes the available plain-language explanation and severity as produced by the Vulcan scan engine.
- [ ] Given a scan that fails or times out, when the reviewer views the PR, then the product clearly indicates that scan results are unavailable and does not silently show zero findings.
- [ ] Given a pull request that receives multiple rapid commits, when scans are triggered, then the product ensures only the most recent relevant scan is active or queued, and stale scan results do not appear as current.

## Edge Cases & States

- Scan queued but not yet started: the PR must show a pending/queued state so reviewers do not assume findings are complete.
- Scan in progress when a new commit is pushed: the previous scan must be cancelled or its results discarded in favor of a fresh scan against the latest code.
- Scan timeout or failure: the PR must surface that the scan did not complete and not silently show zero findings or stale results from an earlier run.
- Repository disconnected or integration broken after a PR is opened: the feature must detect the loss of connection and clearly indicate that automatic scanning is unavailable for that PR.
- Very large pull request with many files: the scan may take longer; the PR context must reflect the in-progress state without blocking the review UI.
- Duplicate events from the repository platform (e.g., webhook retries): the product must not queue multiple identical scans for the same PR revision.

## Behavior Contract

- Every pull request opened or updated on a connected repository must result in exactly one scan trigger per effective code change; duplicate triggers must be deduplicated.
- Scan findings must remain attached to the pull request that triggered them and must not be silently reassigned or lost if the PR branch is rebased.
- If a scan cannot be completed, the product must surface the failure state in the PR context; it must never default to showing zero findings or stale results.
- The feature must not block, modify, or close the pull request based on scan results unless a separate merge-gating feature is explicitly enabled and configured.
- The product must preserve the scan run record (trigger time, PR reference, code revision scanned, completion status) for audit and traceability even after the PR is merged or closed.

## Data & State

- Pull request identity (repository, PR number or ID, branch references) as supplied by the connected repository platform.
- Scan run state: queued, in-progress, completed, failed, or cancelled, with timestamps for each state transition.
- Association between a scan run and the specific code revision (commit SHA) that was scanned.
- Scan findings produced by the Vulcan engine, including available plain-language explanations, severity, and confidence information, linked to the scan run.
- Repository connection status indicating whether automatic scanning is currently active for the repository.

## Actions & Triggers

- Repository platform event: pull request opened triggers scan queuing.
- Repository platform event: new commits pushed to an open pull request triggers scan queuing (cancelling or superseding any in-progress scan for that PR).
- System action: scan orchestration picks up the queued scan, runs the Vulcan analysis against the PR code changes, and posts findings back to the PR context.
- System action: scan timeout or failure detection updates the PR context with the failure state.

## API / Integration Needs

- Needs a way to receive pull request events (opened, updated with new commits) from connected repository platforms such as GitHub or GitLab.
- Needs a way to fetch the code diff or code snapshot associated with a pull request from the connected repository platform.
- Needs a way to post or surface scan findings and scan status back into the pull request context on the connected repository platform.
- Needs a way to trigger the Vulcan scan engine with the fetched code and receive findings with severity, confidence, and plain-language explanations.

## Permissions & Ownership

- The feature must be enabled or configured by a user with repository admin or equivalent permissions on the connected repository.
- Scan findings posted to a pull request must be visible to anyone who can view that pull request on the connected repository platform.
- The scan orchestration must use a stored repository connection credential that has read access to code and write access to PR comments or status checks, as required by the platform.

## Verification Required

- Verify that opening a new PR on a connected repository triggers a scan and findings appear in the PR context without manual intervention.
- Verify that pushing a new commit to an open PR cancels any in-progress scan and queues a fresh scan against the latest code.
- Verify that a scan failure or timeout results in a clear failure indication in the PR context, not silent zero findings.
- Verify that rapid successive commits do not produce duplicate or conflicting scan runs for the same PR.
- Verify that scan findings remain traceable to the correct PR and code revision after the PR is merged or closed.
- Verify that disconnecting a repository stops automatic scans and the PR context reflects the loss of connection for any still-open PRs.
