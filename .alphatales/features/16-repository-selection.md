# Repository Selection

**Priority:** High
**Status:** Todo
**Category:** Connect a Code Repository

## Feature Intent

A developer or team member who has connected a code hosting provider needs to see which repositories they can give Vulcan access to, and pick the one they want scanned. This feature reduces the uncertainty of not knowing whether a repo is reachable, and it prevents the product from scanning the wrong codebase or silently failing because the right repo was never selected. It belongs in Vulcan because the product must receive an explicit, informed repo choice before any scan can run.

## In Scope

- Displaying the list of repositories available to the authenticated user on the connected provider, clearly distinguishing repos that can be selected from those that are unavailable
- Letting the user choose exactly one repository that Vulcan should monitor, and capturing that selection as the active scan target
- Preserving the selected repository identity — including provider, owner/org, and repo name — as the authoritative source for subsequent scan workflows
- Clearly indicating when the repository list cannot be fetched (provider error, token scope insufficient, rate-limited) and preventing selection until the list is available

## Out of Scope

- Connecting or authenticating the code hosting provider itself (that is a separate provider-connection feature)
- Running a scan, scheduling scans, or configuring scan parameters for the selected repository
- Managing multiple selected repositories or switching between repos after initial selection (unless the workflow explicitly supports re-selection as part of this feature)

## Functional Requirements

1. The product must fetch and display the repositories that the authenticated user can access on the connected provider, using the credentials established during provider connection.
2. The product must clearly distinguish repositories that are available for selection from those that are inaccessible, insufficiently permissioned, or already archived.
3. The user must be able to select one repository from the displayed list and confirm it as the repository Vulcan will monitor.
4. The product must prevent the user from proceeding to scan configuration or scanning without a confirmed repository selection.
5. The product must preserve the selected repository identity (provider, owner or organization, repository name) and make it available as the scan target for all downstream workflows.
6. The product must clearly indicate when the repository list is loading, when it is empty (no accessible repos), and when fetching fails due to provider errors, expired credentials, or insufficient token scope.
7. The product must allow the user to re-initiate repository fetching if the initial attempt fails or if credentials have been refreshed.

## Acceptance Scenarios

- [ ] Given a developer has completed provider connection with valid credentials that grant repo read access, when they reach the repository selection step, then a list of accessible repositories is displayed and each entry shows enough detail for the developer to identify the correct repo.
- [ ] Given a list of accessible repositories is displayed, when the developer selects one repo and confirms, then the product records that repo as the active scan target and allows the developer to proceed.
- [ ] Given the provider credentials lack sufficient scope to list repositories, when the product attempts to fetch the repo list, then the product clearly indicates that the repository list is unavailable due to permission scope and does not show an empty list as if no repos exist.
- [ ] Given the provider returns no repositories (e.g., newly created account with no repos), when the product fetches the list, then the product clearly indicates that no repositories were found and prevents selection until repos exist.
- [ ] Given no repository has been selected yet, when the developer tries to move to the next step (e.g., scan configuration), then the product prevents proceeding and clearly indicates that a repository must be selected first.
- [ ] Given a previously confirmed repository selection is stored, when downstream workflows request the scan target, then the product returns the correct provider, owner/org, and repository name as supplied by the provider.

## Edge Cases & States

- Loading state: the repository list is being fetched from the provider; the product must indicate fetching is in progress and prevent interaction that depends on the list.
- Empty state: the authenticated user has zero accessible repositories on the connected provider; the product must show a clear message and guidance rather than a blank or broken view.
- Error state: the provider API returns an error (rate limit, token expired, permission denied, provider downtime); the product must surface the error reason in user-understandable terms and offer a way to retry.
- Partial access state: the user can see some repos but not others because of mixed permission levels; the product must show accessible repos while clearly marking inaccessible ones as unavailable for selection.
- Credential expiry mid-session: the provider token expires after the initial connection but before the repo list is fetched or refreshed; the product must detect this and prompt re-authentication rather than silently failing.
- Very large repo list: the user has hundreds or thousands of repositories; the product must handle pagination or search without degrading usability or silently truncating the list.

## Behavior Contract

- The product must never allow scan workflows to start without a confirmed repository selection whose identity is traceable to the provider.
- The product must not cache or display repositories that the authenticated user cannot actually access according to the provider at the time of listing.
- If the repository list fetch fails, the product must not silently fall back to a stale, cached list unless the product explicitly indicates staleness and the user accepts it.
- The selected repository identity must remain immutable once confirmed for a scan configuration — changing the target repo requires an explicit re-selection action.
- The product must not expose raw provider API tokens, secrets, or internal pagination tokens in user-visible state or error messages.

## Data & State

- Selected repository identity: provider name, owner or organization identifier, repository name, and a unique provider-assigned repository ID if available.
- Repository list state: loading, loaded (with accessible repos), empty (no repos found), error (with error reason), stale (cached from previous fetch).
- Individual repository availability: accessible and selectable, inaccessible due to permissions, archived or disabled by provider, or unknown due to partial fetch failure.
- Selection confirmation state: unselected (default), selected and confirmed, or selection in progress (user has picked but not yet confirmed).
- Provider connection reference: the linked provider identity and credential context that authorizes the repository list fetch, without storing the raw credential.

## Actions & Triggers

- User action: initiate repository list fetch after provider connection is established.
- User action: select a repository from the displayed list and confirm the selection.
- User action: retry repository list fetch after a failed attempt or after refreshing provider credentials.
- System trigger: upon provider connection completion, the product may automatically initiate the repository list fetch as the next step.

## API / Integration Needs

- Needs a way to fetch the list of repositories accessible to the authenticated user from the connected code hosting provider, including repository name, owner/org, and a stable provider identifier.
- Needs a way to determine whether the current provider credentials have sufficient scope to list repositories, and to surface scope-related errors distinctly from other fetch failures.
- Needs a way to handle provider pagination for accounts with large numbers of repositories, ensuring the full accessible list can be retrieved.
- Needs a way to refresh or validate provider credentials before fetching the repository list, to detect expired tokens early and prompt re-authentication.

## Permissions & Ownership

- Only the user who authenticated the provider connection may view the repository list for that connection; the list must respect the provider's own permission model.
- The repository selection must be scoped to the project or workspace in which the provider connection was established.
- If Vulcan supports team workspaces, team members with appropriate access to the project should be able to view the selected repository but only the connection owner may re-fetch the list or change the selection.

## Verification Required

- Verify that after a successful provider connection, the repository list fetch returns real, correctly permissioned repos and displays them with enough detail to distinguish repos with similar names.
- Verify that when provider credentials have insufficient scope (e.g., no repo read permission), the product shows a scope-related error and does not display an empty or partial list that misleads the user.
- Verify that selecting a repository and confirming it prevents proceeding without a selection, and that the stored selection identity (provider, owner, repo name) is correct when read by a downstream workflow.
- Verify that a very large repo list (hundreds of repos) can be fetched and navigated without timeouts, truncation, or UI breakage.
- Verify that when the provider API is unreachable or returns a rate-limit error, the product surfaces the error clearly and allows the user to retry.
