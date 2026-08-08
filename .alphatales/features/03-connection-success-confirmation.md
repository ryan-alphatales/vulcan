# Connection Success Confirmation

**Priority:** High
**Status:** Todo
**Category:** Connect a Code Repository

## Feature Intent

After a developer connects a code repository to Vulcan, they need immediate, unambiguous evidence that the connection succeeded and that the repository is ready to trigger scans on future pull requests. Without this confirmation, the developer is left uncertain whether the setup completed, which creates friction and risks the repository being left unmonitored for security flaws and data leak risks. This feature eliminates that uncertainty by providing a clear, inspectable confirmation of the connection state and scan readiness.

## In Scope

- Displaying a clear success state after repository connection completes, including the repository identity as supplied during setup
- Indicating that the connected repository is ready to trigger scans on future pull requests
- Providing enough detail that the developer can verify the correct repository was connected before leaving the flow
- Preserving the confirmed connection state so the developer can return later and see that the repository remains connected and scan-ready

## Out of Scope

- Triggering or running an initial scan on the connected repository
- Displaying scan results, findings, or historical scan data
- Managing or disconnecting an already-connected repository beyond the confirmation step

## Functional Requirements

1. The product must display a confirmation that the repository connection was successful immediately after the connection completes.
2. The product must clearly indicate the identity of the connected repository using the name or identifier the developer supplied or authorized during setup.
3. The product must clearly indicate that the connected repository is ready to trigger scans on future pull requests.
4. The product must preserve the confirmed connection state so that returning to the repository view shows the repository as connected and scan-ready.
5. The product must prevent the developer from leaving the connection flow without seeing a success or failure outcome.
6. When the connection fails, the product must clearly indicate failure and must not show the success confirmation.

## Acceptance Scenarios

- [ ] Given a developer completes repository connection with valid credentials and permissions, when the connection succeeds, then a confirmation is shown that includes the connected repository's name and states it is ready for scans on future pull requests. Passes if both are present.
- [ ] Given the developer views the repository after a previously successful connection, when they return to the repository status view, then the repository still shows as connected and scan-ready. Passes if the confirmed state is preserved.
- [ ] Given a developer initiates repository connection but authorization is denied, when the connection fails, then the product shows a failure indication and does not show the success confirmation. Passes if the success confirmation is absent.
- [ ] Given the success confirmation is displayed, when the developer reads it, then the confirmation text includes scan-readiness language tied to future pull requests. Passes if the confirmation references pull request scans, not manual or one-time scans.
- [ ] Given a developer connects a repository, when the confirmation appears, then the repository identity matches the one the developer selected or authorized. Passes if a mismatch between selected and displayed identity would fail the check.

## Edge Cases & States

- Connection is in progress (pending state): the product must show an in-progress indicator and must not display the success confirmation until completion.
- Connection times out: the product must surface a timeout outcome with a clear message and must not silently fail or show a false success.
- Authorization is revoked mid-flow: the product must surface the failure and must not leave the developer in an ambiguous state.
- Developer navigates away during connection: the product must either retain enough state to resume or surface a clear status on return, and must not show a stale success confirmation from an abandoned attempt.
- Duplicate connection attempt when the repository is already connected: the product must indicate that the repository is already connected and scan-ready instead of creating a duplicate or failing silently.

## Behavior Contract

- The success confirmation must be displayed only after the connection is fully established and verified by the system.
- The confirmation must include the repository identity as supplied during setup, not a system-generated identifier that the developer cannot recognize.
- The confirmation must explicitly tie readiness to future pull requests, not to manual scan triggers or one-time scans, unless broader scan triggers are supported by the product context.
- The product must not display a success confirmation for a failed or pending connection.
- The confirmed connection state must survive page navigation and session boundaries.

## Data & State

- Repository connection state: connected, disconnected, pending, or failed
- Repository identity: the name or identifier supplied during setup, preserved as displayed to the developer
- Connection timestamp: when the connection was established, to support state inspection and audit
- Scan-readiness flag: derived state indicating whether scans are enabled for future pull requests on this repository
- Authorization context: whether the developer's access token or permission grant remains valid, needed to determine if the connected state is current

## Actions & Triggers

- Developer completes repository authorization (OAuth, token, or app installation) and is returned to Vulcan
- System verifies the connection by validating access to the repository after authorization
- System updates the repository connection state from pending to connected or failed
- System presents the success confirmation to the developer upon transition to connected state

## API / Integration Needs

- Needs a way to verify repository access after the developer completes authorization, so the system can confirm the connection is valid before showing the success state.
- Needs a way to retrieve the repository identity (name, owner, or display identifier) from the connected source platform so it can be shown in the confirmation.
- Needs a way to detect whether the authorization grant remains valid when the developer returns to view connection state later.

## Permissions & Ownership

- Only the developer who initiated and authorized the repository connection should see the immediate success confirmation in their session.
- Team members with access to the project should be able to see the connected repository state when viewing the project's repository configuration.
- The confirmation should not expose sensitive authorization tokens or secrets in the user-visible confirmation display.

## Verification Required

- Verify that a successful connection immediately shows the confirmation with the correct repository name.
- Verify that a failed connection never shows the success confirmation.
- Verify that returning to the repository view after a successful connection still shows the connected and scan-ready state.
- Verify that the confirmation includes language about scan readiness for future pull requests.
- Verify that navigating away during connection does not leave the developer with a false or stale success state.
