# Credential Error Guidance

**Priority:** High
**Status:** Todo
**Category:** Login to Existing Account

## Feature Intent

When a developer attempts to log into Vulcan and the attempt fails, this feature ensures they receive clear, specific feedback that distinguishes between an unrecognized account and an incorrect password. This reduces login frustration, prevents unnecessary support requests, and helps legitimate users self-correct without exposing account existence to unauthorized parties.

## In Scope

- Displaying distinct feedback messages for unknown account vs. incorrect password scenarios during login
- Preserving account existence ambiguity so an attacker cannot enumerate valid accounts through login error responses
- Handling login failures caused by network unavailability or service errors with distinct, non-confusing messaging
- Presenting failure guidance in the same language and channel where the login attempt was made

## Out of Scope

- Account recovery flows such as password reset, magic link, or email verification — those are separate features
- Account lockout, rate limiting, or brute-force protection mechanisms triggered by repeated failures
- Multi-factor authentication (MFA) failure guidance — this feature covers primary credential validation only

## Functional Requirements

1. The product must display a distinct message when the supplied identifier (username/email) does not match any existing account, without confirming whether the identifier is valid.
2. The product must display a distinct message when the supplied identifier is recognized but the password does not match the stored credential.
3. The product must display a distinct message when the login attempt fails due to a temporary service unavailability or error, clearly labeled as a system issue rather than a credential problem.
4. The product must ensure that no login failure message reveals whether a specific identifier is registered in the system, beyond what is already implied by the credential-check outcome.
5. The product must preserve the exact identifier the user submitted and reflect it (masked or partially redacted when appropriate) in any error context so the user can verify what they entered.
6. The product must provide actionable next-step guidance alongside each failure message — for example, suggesting the user recheck their password, verify their account registration, or wait and retry.
7. The product must log failed login attempts with category metadata (unknown account, bad password, system error) for operational visibility, separate from the user-facing message.

## Acceptance Scenarios

- [ ] Given a login attempt with an email that is not registered in the system, when the user submits the form, then the product displays a message that does not confirm or deny whether the email exists (e.g., 'No account found with these credentials' or equivalent that does not leak existence).
- [ ] Given a login attempt with a registered email and an incorrect password, when the user submits the form, then the product displays a message indicating the password is wrong without revealing the correct password or account details.
- [ ] Given a login attempt when the authentication service is unreachable, when the user submits the form, then the product displays a message clearly stating that a system error occurred and suggests retrying, explicitly distinct from credential-error messages.
- [ ] Given a login attempt with an email that is not registered, when the user views the error, then the guidance includes a suggestion to verify the email or to create a new account, without confirming the email's registration status.
- [ ] Given a login attempt with empty email and password fields, when the user submits the form, then the product displays a validation message that both fields are required, distinct from the credential-error guidance.
- [ ] Passes if no error message variant allows an attacker to reliably determine account existence by comparing responses. Fails if the unknown-account and bad-password responses differ in structure, timing, or content in a way that enables enumeration.
- [ ] Passes if each failure scenario (unknown account, wrong password, system error, empty fields) produces a message that is distinct from the others and includes actionable next-step guidance.

## Edge Cases & States

- Empty identifier field: product must show field-level validation, not a credential error message.
- Empty password field with a recognized identifier: product must show field-level validation for the password, not a bad-password or unknown-account message.
- Authentication service returns a timeout: product must display a system-error message distinct from credential errors and preserve the user's entered identifier for retry.
- User pastes an identifier with leading/trailing whitespace: product must trim whitespace before validation, and the error guidance (if any) must reference the trimmed identifier.
- Consecutive rapid login attempts that all fail: product must not change the content of error messages based on attempt count; rate-limiting behavior is a separate feature but the error guidance must remain consistent.
- Identifier contains non-ASCII or special characters: product must handle the input without leaking internal state and display the same category of error guidance as for standard inputs.

## Behavior Contract

- Error messages must never disclose whether a given identifier exists in the system beyond what a failed password check already reveals.
- Each failure category (unknown account, bad password, system error) must produce a message that is observably distinct from the other categories but structurally consistent within its own category across all attempts.
- The implementation must not include timing side channels, response-size differences, or HTTP status code variations that allow account enumeration through credential error responses.
- Guidance text must be defined at the product level (not hardcoded in UI components) so it can be reviewed for security, localized, and updated without changing implementation logic.
- The feature must treat the login endpoint as the single boundary for credential error guidance — no other surface (API responses, logs visible to the user, email) may leak more detail than the login screen provides.

## Data & State

- Submitted identifier (email or username) — preserved across the failure response so the user can verify what they entered
- Failure category — derived state classifying the attempt as unknown_account, bad_password, system_error, or validation_error
- Failure timestamp — recorded for operational logging and potential rate-limiting features
- User-visible guidance message — the product-level text associated with the failure category, matched to the user's locale when locale context is available
- Attempt context — whether the login attempt was initiated from the default login form, a redirect, or a session expiry prompt; preserved so guidance can be tailored to the entry point when supported

## Actions & Triggers

- User submits login form with credentials
- Authentication service returns a failure response (unknown user, bad password, or error)
- Product evaluates the failure response and classifies it into a failure category
- Product renders the appropriate guidance message to the user
- Product logs the failed attempt with category metadata for operational visibility

## API / Integration Needs

- Needs a way to receive authentication service responses that distinguish between 'user not found' and 'invalid password' without leaking that distinction to the client directly
- Needs a way to detect authentication service unavailability, timeouts, or degraded states so system-error guidance can be triggered
- Needs a way to retrieve locale or language preference for the current session (when supported) so guidance messages can be localized

## Permissions & Ownership

- Any unauthenticated user attempting login can receive credential error guidance — no special permission required
- Operational logs of failed attempts must be accessible only to authorized project or system administrators, not to end users or unauthenticated parties
- The product-level guidance text definitions must be manageable only by users with product configuration or administrative access

## Verification Required

- Verify that submitting an unregistered email produces a message that does not differ structurally from submitting a registered email with a wrong password in a way that enables enumeration.
- Verify that a registered email with a wrong password produces a message distinct from the unknown-account message in content but identical in timing and response structure.
- Verify that an authentication service outage produces a message clearly labeled as a system error, not as a credential error, and that retrying after service recovery succeeds.
- Verify that empty-field submissions produce field-level validation messages that do not reference credential validity.
- Manually review the error message wording with a security reviewer to confirm no account-existence leak and with a non-expert developer to confirm clarity and actionability.
