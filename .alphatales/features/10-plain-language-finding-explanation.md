# Plain-Language Finding Explanation

**Priority:** High
**Status:** Todo
**Category:** Review Finding with Confidence Score

## Feature Intent

Developers and security reviewers need to understand a vulnerability well enough to act on it without waiting for a security specialist. This feature turns the AI analysis into a plain-language explanation that tells the developer what the risk is, where it lives in the code, and a suggested fix — all in everyday terms. It reduces triage friction, lowers the security bottleneck, and helps the team decide whether to fix, suppress, or defer the finding with more confidence.

## In Scope

- Generating a plain-language explanation for each finding that describes the vulnerability in everyday terms a developer can understand
- Including the code location (file, line, or code context) as part of the explanation so the developer knows exactly where to look
- Including a suggested fix that is concrete and actionable, derived from the AI analysis of the code pattern
- Making the explanation available alongside the finding, so it is immediately visible during review and triage without additional steps

## Out of Scope

- Automatic fix application — the feature explains and suggests, but does not modify source code
- Editing, approving, or rejecting the explanation itself by users — review workflow on the finding is separate
- Generating explanations for historical or closed findings outside the current scan context

## Functional Requirements

1. The product must generate a plain-language explanation for every security or data-leak finding produced by a scan.
2. The explanation must describe the vulnerability in everyday language that avoids requiring security-expert terminology.
3. The explanation must include the code location where the risk was identified, using file and line information available from the scan.
4. The explanation must include a suggested fix that is specific to the code pattern identified, not a generic template.
5. The product must make the plain-language explanation available alongside the finding immediately when the finding is displayed.
6. The product must preserve the explanation text and code location as read-only output tied to the finding — the explanation is not user-editable.
7. The product must clearly indicate when the confidence score for a finding is low, so the developer knows the explanation may be less reliable.
8. The product must ensure the explanation is generated only from the scanned source code and the AI analysis, without leaking unrelated code or data outside the finding scope.

## Acceptance Scenarios

- [ ] Given a finding flagged as a hardcoded secret, when the explanation is displayed, then it passes if it uses plain language (e.g., 'a credential is stored directly in the code' rather than only a rule name) and includes the file and line where the secret appears.
- [ ] Given a finding with a high confidence score, when the explanation is shown, then it passes if the suggested fix references the specific code pattern (e.g., 'move this value to an environment variable') rather than a templated statement.
- [ ] Given a finding with a low confidence score, when the explanation is displayed, then it passes if the product clearly indicates the explanation may be less reliable (e.g., a visible confidence qualifier).
- [ ] Given a scan with ten findings, when the review page loads, then it passes if every finding has a plain-language explanation available without an extra click or manual request.
- [ ] Given a finding where the AI has limited context, when the explanation is generated, then it passes if the product still provides the best available explanation rather than failing silently or showing an empty state.
- [ ] Given a finding that is later marked as a false positive, when the explanation is viewed, then it passes if the original explanation remains preserved and read-only, unchanged by the false-positive triage decision.
- [ ] Given a finding with no code line information available, when the explanation is displayed, then it passes if the product clearly indicates the code location is unavailable rather than inventing a location.

## Edge Cases & States

- Empty or missing explanation: the AI produces no usable explanation — the product must show a clear 'explanation unavailable' state rather than a blank area or error.
- Low-confidence finding: the confidence score is below a threshold — the product must visibly qualify the explanation so the developer does not treat it as authoritative.
- Code location unavailable: the scan cannot resolve a file or line — the explanation must indicate the missing location rather than fabricating one.
- Very large or minified code block: the AI may produce a confusing or truncated explanation — the product must handle excessive code context without breaking the explanation display.
- Multiple findings on the same line: overlapping vulnerabilities — each finding must have its own explanation that is distinct and scoped to that specific risk, not a merged description.
- Non-English or mixed-language code: comments or identifiers in a language the AI may interpret poorly — the product must still produce the best available explanation and not fail.

## Behavior Contract

- Every finding must have exactly one plain-language explanation — never zero and never more than one per finding.
- The explanation must be generated from and scoped to the code pattern of that finding only; it must not reference other findings or unrelated code.
- The explanation is read-only after generation — no user action can edit, overwrite, or delete it (it is tied to the scan run).
- When confidence is low, the product must surface that qualifier with the explanation; it must not hide uncertainty.
- The explanation must never include raw secrets, tokens, or sensitive values discovered in the code — only the description that a risk exists.
- The explanation language must default to the product-configured language or English; it must not mix languages unpredictably.

## Data & State

- plain_language_explanation: the generated text describing the vulnerability in everyday terms, tied to one finding
- code_location: file path, line number, and any code snippet context available from the scan for that finding
- suggested_fix: the AI-generated fix recommendation specific to the identified code pattern
- confidence_score_qualifier: a derived indicator (e.g., 'low confidence') that flags when the explanation may be less reliable, based on the finding's confidence score
- explanation_generation_status: state tracking whether the explanation was generated successfully, is pending, or failed, so the product can display the appropriate state

## Actions & Triggers

- On scan completion, the system triggers explanation generation for every finding produced by the scan.
- When a user opens a finding for review, the system displays the pre-generated explanation immediately.
- Needs a way to regenerate or refresh explanations if a scan is re-run on updated code, without duplicating findings.

## API / Integration Needs

- Needs a way to retrieve the plain-language explanation, code location, and suggested fix for a specific finding by finding identifier.
- Needs a way for the scan-completion process to trigger explanation generation and store results against each finding.
- Needs a way to surface the confidence score alongside the explanation so the frontend can apply the low-confidence qualifier.

## Permissions & Ownership

- Any user who can view a finding must also be able to view its plain-language explanation — no separate permission is required.
- Only the system (AI scan engine) can generate or update the explanation; no human user role can edit it.
- Project-level access boundaries must apply: a user who cannot access a project's scan results must not see explanations for findings in that project.

## Verification Required

- Verify that every finding in a completed scan has a non-empty plain-language explanation or a clear 'unavailable' state.
- Verify that explanations for findings with different code patterns produce distinct, pattern-specific text rather than identical templates.
- Verify that a low-confidence finding's explanation is visually qualified as less reliable.
- Verify that the explanation does not expose raw secrets or tokens from the scanned code.
- Verify that the code location (file and line) in the explanation matches the actual finding location from the scan output.
- Manual review: ask a developer with no security background to read explanations for three different finding types and confirm they understand the risk and fix without outside help.
