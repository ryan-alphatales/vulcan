# Account Activation and Session Start

**Priority:** High
**Status:** Todo
**Category:** Sign Up and Create Account

## Feature Intent

After a developer verifies their account (e.g., via email or another supported verification method), this feature activates the account and establishes an authenticated session. It lands the developer on their workspace, ready to connect a code repository. This reduces onboarding friction by combining activation with session start so the developer does not need to re-authenticate immediately after verification.

## In Scope

- Completing account activation after the verification step succeeds
- Creating an authenticated session that identifies the developer for subsequent product actions
- Delivering the developer to a workspace state where connecting a repository is the next expected action
- Ensuring unverified or not-yet-activated accounts cannot start a session or access workspace features

## Out of Scope

- The verification step itself (email delivery, verification code validation, magic link handling)
- Repository connection workflow — this feature only ensures the developer lands ready to connect, not the connection flow
- Team member invitations, organization creation, or multi-user workspace setup

## Functional Requirements

1. The product must activate the developer account only after a supported verification step has been successfully completed
2. The product must prevent session creation for an account that is not yet verified or activated
3. The product must create an authenticated session upon successful activation so the developer does not need to sign in separately
4. The product must present the workspace as the landing destination after activation and session start
5. The product must clearly indicate that connecting a repository is the next available action, when the workspace context supports it
6. The product must preserve the activation state across subsequent sessions so the developer is not asked to activate again
7. The product must refuse access to workspace features when the session is invalid, expired, or missing

## Acceptance Scenarios

- [ ] Given a developer whose account has been verified, when activation completes, then an authenticated session is created and the workspace is presented
- [ ] Given a developer whose account has not been verified, when the product attempts activation, then the activation is refused and no session is created
- [ ] Given a developer with an active session, when they navigate to the workspace, then they see the repository connection prompt as the next expected action
- [ ] Given a previously activated account, when the developer returns and signs in again, then the product does not require re-activation
- [ ] Given an expired or invalid session, when the developer attempts a workspace action, then the product refuses and requires re-authentication
- [ ] Fails if an unverified account can start a session or access workspace features

## Edge Cases & States

- Activation token or link has expired — the product must refuse activation and direct the developer to request a new verification
- Developer attempts to activate an already-activated account — the product must handle this gracefully, either starting a session or redirecting to sign-in without error
- Session expires while the developer is on the workspace — the product must detect this and require re-authentication before allowing further actions
- Verification succeeds but activation fails due to a system error — the product must preserve the verified state and allow retry without requiring re-verification
- The workspace has no repositories connected yet — the empty state must clearly prompt repository connection without implying an error

## Behavior Contract

- Account activation is a one-time state transition from verified to active; it must never re-execute for an already-active account
- An authenticated session must always be linked to exactly one active developer account
- The product must never create a session for an unverified or deactivated account
- The workspace landing must always present the next logical onboarding action when the project context supports it; it must not present a blank or confusing state

## Data & State

- Account activation state: unverified, verified (pre-activation), active, or deactivated
- Session state: active, expired, or invalid, linked to the developer account identity
- Workspace onboarding state: whether the developer has already connected a repository, used to determine if the repository prompt should be shown
- Activation outcome information: whether activation succeeded, failed, or is pending retry after a system error

## Actions & Triggers

- Developer completes the verification step — triggers the activation flow
- System completes activation successfully — triggers session creation and workspace landing
- Session reaches expiry — triggers re-authentication requirement on next protected action
- Developer explicitly signs out — terminates the current session and clears authenticated state for that session

## API / Integration Needs

- Needs a way to confirm that the verification step has been completed before activation proceeds
- Needs a way to create an authenticated session tied to the activated developer account
- Needs a way to retrieve workspace onboarding state so the product can decide whether to show the repository connection prompt
- Needs a way to validate session validity on subsequent requests to protected workspace features

## Permissions & Ownership

- Only the developer who owns the account can complete activation — no other user, including admins, may activate on their behalf
- The authenticated session must be scoped to the activated developer account only
- Access to workspace features requires an active, valid session owned by the account holder
- If team or organization constructs are supported, workspace access must respect the developer's membership boundary as defined by the project context

## Verification Required

- Verify that an unverified account cannot start a session or access workspace features
- Verify that activation is a one-time state change and cannot be re-executed
- Verify that session expiry triggers re-authentication before protected actions can proceed
- Verify that the workspace landing correctly prompts repository connection when no repository is connected, using supported project context
- Verify that activation failure preserves the verified state and allows retry without re-verification
