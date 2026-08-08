# Provider OAuth Authorization

**Priority:** High
**Status:** Todo
**Category:** Connect a Code Repository

## Feature Intent

This feature enables a developer to securely grant Vulcan read-only access to a code repository so that future scans can be performed without repeated manual authentication. It reduces the risk of over-provisioned access and eliminates the need to share long-lived credentials, giving teams confidence that Vulcan only sees what it needs to analyze.

## In Scope

- Initiating an OAuth authorization flow from Vulcan to a supported repository provider to request read-only repository access
- Receiving, validating, and securely storing the resulting access token or credential so that it can be used for automated future scans
- Clearly indicating the successful connection of the repository provider, including which provider was authorized and that access is read-only
- Handling refusal, cancellation, or failure of the authorization flow with a clear outcome visible to the developer

## Out of Scope

- Selecting which repositories to scan or configuring scan settings — scope selection is a separate step after successful connection
- Performing an actual code scan or generating findings — this feature only establishes the authorization grant
- Managing, rotating, or revoking OAuth tokens over time — token lifecycle management beyond initial storage is a separate concern unless context supports it

## Functional Requirements

1. The product must provide a way for the developer to initiate an OAuth authorization flow to a supported repository provider.
2. The product must request only read-only repository access scopes during authorization, and must clearly communicate those scopes to the user before they proceed.
3. The product must receive the authorization callback from the provider, validate the response, and securely store the resulting access credential for use in future automated scans.
4. The product must clearly indicate when authorization succeeds, including which provider was connected and that access is read-only.
5. The product must clearly indicate when authorization is denied, cancelled, times out, or fails for any reason, and must allow the developer to retry.
6. The stored credential must remain available for subsequent scan operations without requiring the developer to re-authenticate for each scan.

## Acceptance Scenarios

- [ ] Given a developer has not yet connected a repository provider, when they initiate the OAuth flow, then they are redirected to the provider's authorization page with the correct read-only scopes requested.
- [ ] Given a developer completes the provider authorization successfully, when the callback is processed, then Vulcan stores the credential and shows a clear success state with the provider name and read-only access indicated.
- [ ] Given a developer denies authorization on the provider's page, when the callback is received, then Vulcan shows a clear failure state and allows the developer to retry.
- [ ] Given the OAuth flow times out or the callback is lost, when the developer returns to Vulcan, then the product shows that authorization did not complete and offers a way to restart.
- [ ] Given a stored credential exists from a prior successful authorization, when a new scan is triggered, then the scan can use the stored credential without prompting the developer to re-authenticate.
- [ ] Given the provider returns an error during callback processing, when the error is handled, then Vulcan fails safely, does not store a partial or invalid credential, and surfaces that the connection attempt failed.

## Edge Cases & States

- Authorization flow interrupted: the developer closes the browser or navigates away after starting OAuth but before completing it — the product must detect this and allow a fresh start.
- Provider token expiration or revocation after initial storage: the product must handle the credential becoming invalid and indicate that re-authorization is needed when a scan cannot proceed.
- Duplicate authorization: the developer attempts to authorize the same provider again when a valid credential already exists — the product must either confirm replacement or prevent overwrite without explicit confirmation.
- Callback replay or tampering: the product must reject unexpected or replayed callback requests that do not match an in-progress authorization session.
- Rate limiting or throttling by the provider during authorization: the product must surface a clear message if the provider temporarily blocks the attempt, and allow retry after a reasonable interval.

## Behavior Contract

- The product must never request write, delete, or admin-level repository scopes during OAuth authorization; only the minimum read-only scopes needed for code scanning may be requested.
- The stored credential must never be exposed to the end user in plain text after storage, and must only be transmitted to the repository provider for scan operations.
- Authorization state must be durable: once a successful connection is established, it must survive page refreshes, navigation away, and user sessions until explicitly disconnected or the credential becomes invalid.
- The product must not proceed to any scan operation that requires repository access until a valid, non-expired credential is confirmed as stored.

## Data & State

- Authorization session state: an in-progress OAuth flow identifier, including the provider type, requested scopes, and session expiry to prevent replay.
- Stored credential: the access token (or equivalent) received from the provider, associated with the provider identity, stored securely and never displayed in plain text after initial storage.
- Connection status: a persistent record indicating which provider is connected, when authorization was granted, and that access is read-only — surfaced to the user so they know the connection exists.
- Authorization outcome state: success, denied, timeout, or error — transient state used to render the correct outcome UI to the developer after callback processing.

## Actions & Triggers

- Developer initiates OAuth flow by selecting a supported repository provider to connect.
- Provider redirects back to Vulcan with an authorization code or token after the developer approves or denies access.
- Vulcan exchanges the authorization code for an access token (when required by the OAuth flow) and validates the response.
- Vulcan stores the resulting credential and updates the connection status to reflect the outcome.
- Developer retries the flow after a failed or denied authorization attempt.

## API / Integration Needs

- Needs a way to initiate an OAuth authorization request to the repository provider, including constructing the correct authorization URL with client ID, redirect URI, and requested read-only scopes.
- Needs a way to handle the OAuth callback from the repository provider and extract the authorization code or token from the response.
- Needs a way to exchange an authorization code for an access token with the provider's token endpoint, when the provider's OAuth flow requires it.
- Needs a way to securely store the resulting access credential so that future API calls to the provider for scan operations can attach it.

## Permissions & Ownership

- Only the project owner or a team member with repository connection permissions may initiate OAuth authorization for a repository provider.
- The developer performing the authorization must have an account on the target repository provider with sufficient privileges to grant read-only access to the repositories.

## Verification Required

- Verify that the OAuth flow requests only read-only scopes and no write, delete, or admin scopes.
- Verify that a successful authorization results in a stored credential that can be used to list or access repositories without re-authentication.
- Verify that denying authorization at the provider produces a clear failure state in Vulcan and allows retry.
- Verify that the stored credential is not exposed in any client-side response, log, or error message.
- Verify that an expired or revoked credential causes a clear re-authorization prompt rather than a confusing scan failure.
