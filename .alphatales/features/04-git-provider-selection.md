# Git Provider Selection

**Priority:** High
**Status:** Todo
**Category:** Connect a Code Repository

## Feature Intent

A developer needs to connect their source code repository to Vulcan so it can be scanned. This feature lets them choose which Git hosting platform — GitHub or GitLab — hosts the repository they want to connect. By providing a clear, bounded choice between the two supported providers, the feature reduces setup friction and ensures Vulcan knows exactly which platform to use when establishing the connection, requesting access, and retrieving source code for scanning.

## In Scope

- Presenting GitHub and GitLab as the two supported repository hosting platforms the developer can choose from
- Capturing and saving the developer's selected provider choice to drive the subsequent connection flow
- Clearly indicating that only GitHub and GitLab are currently supported, with no ambiguous or custom provider input
- Preserving the selected provider as part of the connection configuration so downstream connection and scanning workflows can use it

## Out of Scope

- The actual OAuth flow, token exchange, repository listing, or code retrieval — these belong to a separate repository connection and scanning feature
- Adding, removing, or managing additional Git providers beyond GitHub and GitLab
- Validating that the chosen provider account actually exists or has accessible repositories

## Functional Requirements

1. The product must present GitHub and GitLab as the two available Git provider options for repository connection.
2. The user must be able to select exactly one Git provider — GitHub or GitLab — at a time.
3. The product must prevent the user from proceeding to connection without a selected provider.
4. The product must preserve the selected provider choice so it is available to the downstream repository connection and authorization flow.
5. The product must clearly indicate that GitHub and GitLab are the only supported providers, with no free-text or custom provider entry.
6. The product must allow the user to change their provider selection before completing the connection, replacing the previous choice.

## Acceptance Scenarios

- [ ] Given the provider selection screen is shown, when no provider is selected, then the user cannot proceed to the next step. Passes if the continue action is blocked or disabled. Fails if the user can advance without choosing a provider.
- [ ] Given GitHub is selected, when the user proceeds, then the saved provider value is 'GitHub'. Passes if the downstream flow receives GitHub as the chosen provider. Fails if the wrong provider or a null value is passed.
- [ ] Given GitLab is selected, when the user proceeds, then the saved provider value is 'GitLab'. Passes if the downstream flow receives GitLab as the chosen provider.
- [ ] Given the user selected GitHub, when they go back and change to GitLab before completing the connection, then only GitLab is saved. Passes if the previous selection is fully replaced. Fails if both values persist or the old value is used.
- [ ] Given the provider selection is displayed, when reviewed, then only GitHub and GitLab options are shown with no free-text input for a custom provider. Passes if no custom entry mechanism exists. Fails if a user can type an arbitrary provider name or URL.
- [ ] Given the selected provider is saved, when the user returns to the connection setup later, then their previously saved choice is shown. Passes if the saved provider is displayed. Fails if the selection appears empty or reset.

## Edge Cases & States

- The user has not yet selected any provider — the selection must start in an empty state with neither option pre-selected, and the product must prevent progression.
- The selected provider becomes unavailable due to an upstream service outage (e.g., GitHub or GitLab API unreachable) — the product must handle this in the downstream connection step, but the saved provider choice must remain intact.
- The user navigates away mid-selection and returns — the product must either preserve the partial selection or start cleanly, without leaving the user in an ambiguous state.
- A previously saved provider is no longer supported in a future version — the product must clearly indicate the unsupported state and require a new selection rather than silently carrying forward a stale choice.
- The user attempts to select a provider while offline — the product must allow the selection to be captured locally and saved, deferring provider-dependent validation to the connection step.

## Behavior Contract

- Exactly one provider must be selected before the product allows transition to the connection flow.
- The saved provider value must be a known, supported identifier — only 'GitHub' or 'GitLab' are valid outcomes.
- Changing the provider selection must fully replace the previous choice; the product must never send both values to downstream flows.
- The product must never invent, suggest, or accept provider names outside the supported set of GitHub and GitLab.
- The selected provider must be available to downstream workflows but the provider selection feature must not independently trigger any API calls, authorization, or code retrieval.

## Data & State

- Selected provider: a single value — 'GitHub' or 'GitLab' — representing the developer's chosen Git hosting platform
- Selection state: whether a provider has been chosen (selected vs. unselected), used to gate progression
- Saved connection configuration: the provider choice stored as part of a broader repository connection record so downstream workflows can reference it
- Supported provider list: the fixed set ['GitHub', 'GitLab'] used to render options and validate the saved value

## Actions & Triggers

- User selects a Git provider option (GitHub or GitLab).
- User changes their provider selection, replacing the previous choice.
- User attempts to proceed to the next step — the product validates that a provider has been selected before allowing transition.
- Downstream connection flow reads the saved provider value to initiate the correct platform-specific authorization.

## API / Integration Needs

- Needs a way for the downstream connection flow to receive the saved provider identifier so it can initiate the correct OAuth authorization for GitHub or GitLab.
- Needs a way to validate, at connection time, that the selected provider's API is reachable — this validation belongs to the connection feature, not the selection feature, but the provider value must be preserved for it.

## Permissions & Ownership

- Any developer who can set up a repository connection for scanning must be able to select a Git provider.
- The provider selection must be scoped to the connection being configured and must not affect other team members' connection setups.
- Only authenticated users with access to the Vulcan project or workspace may access the provider selection step.

## Verification Required

- Confirm that selecting GitHub and proceeding stores 'GitHub' as the provider and the downstream connection flow receives it correctly.
- Confirm that selecting GitLab and proceeding stores 'GitLab' as the provider and the downstream connection flow receives it correctly.
- Confirm that attempting to proceed without a selection is blocked and a clear indication is shown to the user.
- Confirm that changing from GitHub to GitLab before completing setup replaces the value and the downstream flow receives only 'GitLab'.
- Confirm that no custom or free-text provider entry mechanism exists — only GitHub and GitLab are selectable.
- Confirm that a saved provider selection survives page navigation and is displayed correctly when the user returns.
