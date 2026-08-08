# Connection Failure Recovery

**Priority:** Medium
**Status:** Todo
**Category:** Connect a Code Repository

## Feature Intent

This feature helps a developer recover when connecting a code repository fails due to OAuth or repository access problems. It reduces confusion at a critical setup step by clearly stating that the connection did not complete, showing available failure guidance, and allowing the developer to retry or correct the connection so code scanning can proceed with less setup friction.

## In Scope

- Detecting and communicating failed repository connection outcomes during the repository connection flow.
- Showing clear failure guidance for OAuth-related errors and repository access-denied or unavailable states when that reason is available.
- Allowing the developer to retry the connection flow after a failed attempt.
- Preserving the failed connection as incomplete so the product does not treat the repository as connected until access succeeds.

## Out of Scope

- Running security scans or showing scan findings after connection setup.
- Managing repository content, branch selection, or scan configuration beyond the connection step.
- Provider-specific OAuth implementation details or endpoint design not supplied by context.

## Functional Requirements

1. The product must clearly indicate when a repository connection attempt has failed.
2. The product must prevent a failed OAuth or repository access attempt from being treated as a successful repository connection.
3. The product must show available failure guidance that helps the developer retry or correct the connection flow.
4. The user must be able to retry the repository connection flow after a failure.
5. The product must preserve the current connection state as incomplete until repository access succeeds.
6. The product must distinguish an available authorization failure reason from an available repository access failure reason instead of showing a false success state.
7. The product must clearly indicate when the exact failure reason is unavailable and still offer a recovery path.
8. The feature must remain read-only with respect to repository content and must only cover connection recovery behavior.

## Acceptance Scenarios

- [ ] Given a repository connection attempt that fails during OAuth, when the failure is returned, then the product shows that the connection failed and does not mark the repository as connected.
- [ ] Given a repository connection attempt that fails because repository access is denied or unavailable, when that state is returned, then the product shows available guidance to correct access and allows retry.
- [ ] Given a failed connection attempt with no specific failure detail supplied, when the failure is shown, then the product clearly indicates that the exact reason is unavailable and still offers a retry path.
- [ ] Given a previously failed connection attempt, when the developer retries and the connection succeeds, then the product updates the state from incomplete to connected.
- [ ] Fails if the product shows a connected repository state after an OAuth or repository access failure.
- [ ] Passes if recovery guidance stays within the connection flow and does not claim that scanning or repository analysis has started before connection success.

## Edge Cases & States

- OAuth attempt fails before repository authorization completes.
- Repository access is denied, revoked, unavailable, or otherwise insufficient after authorization.
- Failure reason is unavailable or too generic to classify beyond connection failure.
- Retry is attempted after one or more prior failures.
- Connection state is pending during an in-progress attempt and must not be shown as connected until success.
- Existing project access boundaries may prevent the current actor from retrying the connection and must be handled without exposing unauthorized repository details.

## Behavior Contract

- A repository is not connected unless authorization and repository access have both succeeded when required by the source flow.
- Failure recovery must communicate an unsuccessful outcome without inventing unsupported provider-specific causes.
- Recovery guidance must help the developer proceed but must not expose repository content or sensitive authorization data.
- Retry behavior must start a new connection attempt rather than silently treating the previous failed attempt as active.
- When the failure reason is known, the product must preserve that distinction in user-visible guidance.
- When the failure reason is unknown, the product must say so plainly rather than presenting guessed remediation as fact.

## Data & State

- Repository connection state with at least incomplete, pending, failed, and connected meanings.
- Available failure classification for the current attempt, such as OAuth failure, repository access failure, or unknown failure, when supplied by the source context.
- Available recovery guidance associated with the current failed attempt.
- The target repository identity or selected source object being connected, as available in the connection flow.
- Whether a retry was initiated after a prior failed attempt.
- The current actor context so existing project or team access boundaries are preserved during recovery.

## Actions & Triggers

- Developer initiates a repository connection attempt.
- System receives a failed outcome from the repository connection flow.
- Developer retries the connection flow after reviewing failure guidance.
- System updates the repository connection state when a retry succeeds or fails again.

## API / Integration Needs

- Needs a way to receive repository authorization success or failure from the code repository connection flow.
- Needs a way to receive repository access-denied, revoked, or unavailable outcomes when the source can provide them.
- Needs a way to re-initiate the repository connection flow after a failed attempt.
- Needs a way to determine whether the repository should be treated as connected only after access is confirmed.

## Permissions & Ownership

- Only actors already allowed to connect a repository for the current project should be able to retry or correct the connection flow.
- The feature must preserve existing project or team access boundaries when showing failure guidance.
- Actors without repository connection permission must not gain repository access details through failure recovery states.

## Verification Required

- Prove that failed OAuth attempts never create a connected repository state.
- Prove that repository access failures show recovery guidance and preserve an incomplete connection state.
- Prove that retrying after failure can lead to a connected state only on actual success.
- Prove that unknown failure reasons are labeled as unknown or unavailable rather than guessed.
- Manually verify that failure recovery does not expose unauthorized repository details or sensitive authorization information.
