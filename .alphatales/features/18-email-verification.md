# Email Verification

**Priority:** High
**Status:** Todo
**Category:** Sign Up and Create Account

## Feature Intent

Email verification helps a developer prove ownership of the email address used for sign up before the Vulcan account becomes active. This reduces fake or mistyped account creation, ensures security-related communication can reach the right person, and establishes a basic trust gate before access to source-code security scanning features is granted.

## In Scope

- Sending a verification link to the email address provided during account creation.
- Blocking account activation until the verification link is successfully used.
- Showing clear account state changes for unverified, verified, expired, and invalid verification attempts.
- Allowing a new verification email to be requested when the prior verification attempt is no longer usable.

## Out of Scope

- Password reset or account recovery flows after sign up.
- Team invitation, organization membership, or role assignment workflows.
- Any downstream scan, repository, or finding-management behavior after account activation.

## Functional Requirements

1. The product must require email verification before activating a newly created account.
2. The product must send a verification email to the email address supplied during sign up.
3. The verification email must contain a verification link that is specific to the pending account.
4. The product must mark the account as verified only after a valid verification link is used.
5. The product must prevent an unverified account from being treated as active.
6. The product must clearly indicate when a verification link is invalid, already used, or no longer valid.
7. The user must be able to request another verification email while the account remains unverified.
8. The product must preserve the verified state once email ownership has been confirmed.

## Acceptance Scenarios

- [ ] Given a new account with a supplied email address, when sign up completes, then the account remains unverified and is not active until verification occurs.
- [ ] Given an unverified account, when the user opens a valid verification link for that account, then the account becomes verified and active.
- [ ] Given an unverified account, when the user attempts to access behavior reserved for active accounts, then access is blocked until email verification is completed.
- [ ] Given an expired, invalid, or already used verification link, when it is opened, then the product does not verify the account and clearly indicates the link cannot be used.
- [ ] Given an unverified account, when the user requests a new verification email, then a new verification attempt is issued and the account remains unverified until a valid link is used.
- [ ] Passes if verifying one account does not verify any other account that may exist with a different pending verification state.

## Edge Cases & States

- Unverified account state after sign up and before successful link use.
- Verification link is invalid, expired, or already consumed.
- Verification email is requested again before the account is verified.
- User supplies an email address that can receive sign-up creation but verification completion has not yet occurred.
- Verified account attempts to use a verification link again after the account is already verified.

## Behavior Contract

- Account activation must not occur before successful email ownership confirmation.
- A verification link must only verify the specific pending account it was issued for.
- The product must refuse to treat an invalid, expired, or reused link as proof of email ownership.
- Once an account is verified, later verification-link failures must not revert the verified state.
- The feature must not assume access to downstream Vulcan security-scanning capabilities until activation is complete.

## Data & State

- User-supplied email address associated with the pending account.
- Account verification status with at least unverified and verified states.
- Verification attempt state needed to determine whether a link is usable, expired, or already used.
- Timestamp or validity state for the active verification attempt when such validity rules are supported.
- Record that a replacement verification email was requested while the account remained unverified.

## Actions & Triggers

- User submits sign-up details including an email address.
- System sends a verification email after account creation.
- User opens the verification link received by email.
- User requests another verification email for an unverified account.
- System updates the account from unverified to verified after successful link validation.

## API / Integration Needs

- Needs a way to send transactional verification emails to the supplied email address.
- Needs a way to generate and validate account-specific verification links.
- Needs a way to update account activation state after successful verification.
- Needs a way to support reissuing a verification attempt for an unverified account.

## Permissions & Ownership

- Only the person with access to the supplied email inbox can complete verification for that account.
- Only the pending account owner must be able to trigger a resend for their own unverified account, subject to existing product access boundaries.
- Verified status changes must remain bound to the account created with that email address.
- The implementation must preserve existing project or team access boundaries because no broader permission model is supplied in context.

## Verification Required

- Prove that a newly created account cannot become active without successful email verification.
- Prove that a valid verification link activates only the intended account.
- Prove that invalid, expired, and already used links are rejected without activating the account.
- Prove that requesting a new verification email does not itself activate the account.
- Prove that once verified, the account remains verified and is not negatively affected by later link reuse attempts.
