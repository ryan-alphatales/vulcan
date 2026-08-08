# Webhook Installation

**Priority:** High
**Status:** Todo
**Category:** Connect a Code Repository

## Feature Intent

Development teams need Vulcan to detect new and updated pull requests without manual intervention. This feature automatically registers a webhook on a selected repository so that Vulcan can trigger scans when pull requests are created or modified. The primary beneficiary is the developer or team lead setting up the repository connection, who gets a zero-manual-effort scan trigger once the webhook is installed.

## In Scope

- Automatic registration of a webhook on a user-selected repository
- Detection of new pull requests and pull request updates (e.g., new commits pushed to an open PR) via the installed webhook
- Clear indication of webhook installation status (pending, active, failed) so the user knows whether scan triggers are working
- Ability for the user to select which repository the webhook targets during the connection flow

## Out of Scope

- Executing the scan itself — scan orchestration is a downstream feature triggered by the webhook event, not part of installation
- Managing webhooks for multiple repositories in bulk — this feature covers single-repository selection at a time
- Uninstalling or removing the webhook — removal is a separate feature unless the packet explicitly requires it here

## Functional Requirements

1. The product must allow the user to select a repository from their connected source-control account for webhook installation.
2. The product must register a webhook on the selected repository that listens for pull request creation and update events.
3. The product must clearly indicate when webhook registration is in progress, has succeeded, or has failed, along with a reason for any failure.
4. The product must preserve the association between the installed webhook and the selected repository so downstream scan triggers can correctly identify which repository an event belongs to.
5. The product must prevent duplicate webhook registrations for the same repository when an active webhook already exists.
6. The product must require that the user has sufficient permissions on the selected repository before attempting webhook registration.

## Acceptance Scenarios

- [ ] Passes if the user can select a repository and successfully register a webhook, receiving a clear success indication.
- [ ] Passes if the installed webhook triggers a detectable event (e.g., event logged or queued) when a new pull request is created on the selected repository.
- [ ] Passes if the installed webhook triggers a detectable event when a new commit is pushed to an existing open pull request.
- [ ] Fails if the product silently registers a duplicate webhook when an active webhook already exists for the same repository.
- [ ] Passes if the product clearly shows a failure message and reason when the user lacks sufficient repository permissions to install a webhook.
- [ ] Passes if the product shows an appropriate error when the source-control account connection is unavailable or expired during webhook installation.

## Edge Cases & States

- Loading state: webhook registration is in progress (waiting for confirmation from the source-control provider).
- Error state: the user's source-control account token has expired or been revoked, preventing webhook registration.
- Permission-denied state: the authenticated user does not have admin or webhook-management permissions on the selected repository.
- Empty state: the user has no repositories available in their connected source-control account to select from.
- Conflict state: an active webhook already exists for the selected repository and the product must prevent duplication.

## Behavior Contract

- The product must never register a webhook silently — the user must explicitly select a repository and initiate the action.
- The product must not trigger scans for events older than the webhook installation time (no backfill of pre-existing PRs from the webhook alone).
- The product must preserve the webhook's association with the specific repository and account that installed it.
- The product must not expose the webhook secret or internal delivery URL in user-facing messages or logs.
- If webhook registration fails, the product must not leave a partially registered or orphaned webhook on the repository.

## Data & State

- Selected repository identity (platform-specific repository ID, name, owner/org as supplied by the source-control provider).
- Webhook registration status: pending, active, failed, with failure reason when applicable.
- Webhook delivery destination (the endpoint Vulcan exposes to receive events — treated as opaque internal state).
- Association between the installed webhook and the user's connected source-control account.
- Timestamp of webhook installation for audit and event freshness determination.

## Actions & Triggers

- User action: select a repository from a list of available repositories on the connected source-control account.
- User action: initiate webhook installation on the selected repository.
- System action: register a webhook on the source-control provider via its API, subscribed to pull request create and update events.
- System action: receive and validate incoming webhook events from the source-control provider.
- System action: update local webhook status based on the provider's registration response (success or failure).

## API / Integration Needs

- Needs a way to list repositories available to the authenticated user from the connected source-control provider.
- Needs a way to create a webhook on a specific repository via the source-control provider's API, subscribed to pull request events.
- Needs a way to receive incoming webhook payloads from the source-control provider and validate their authenticity.
- Needs a way to check the authenticated user's permissions on a given repository before attempting webhook registration.
- Needs a way to detect whether a webhook already exists for the repository to prevent duplicate registrations.

## Permissions & Ownership

- Only a user with admin or webhook-management permissions on the selected repository may successfully register the webhook.
- The product must verify repository permissions through the connected source-control account before attempting registration.
- The installed webhook is owned by the user who initiated the installation and is scoped to their connected source-control account.
- Other team members accessing the same Vulcan workspace must not be able to modify or remove a webhook installed by another user unless they share equivalent repository permissions.

## Verification Required

- Verify that webhook registration succeeds for a repository where the user has admin permissions, and the status is clearly indicated.
- Verify that a new pull request on the registered repository produces a received event on the Vulcan side within an acceptable time window.
- Verify that a push to an existing pull request produces a received event distinct from the initial PR creation.
- Verify that attempting to register a webhook on a repository where the user lacks admin permissions results in a clear, non-technical error.
- Verify that attempting to register a webhook on a repository that already has an active one results in a clear conflict indication rather than a duplicate.
- Verify that webhook registration fails gracefully and does not leave orphaned state when the source-control provider returns an error.
