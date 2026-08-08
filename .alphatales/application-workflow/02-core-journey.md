# Core Journey

## Detect and Review Data Leaks

**Flow Type:** core_value
**Scope Status:** later_or_out_of_scope
**Trigger:** A scan runs on a pull request.
**Outcome:** Data leak findings are shown alongside vulnerability findings.

### Steps

1. **[system]** Scan changed code for data leaks
   - System scans PR code for secrets, PII patterns, and internal URLs using the AI model.
2. **[system]** Generate data leak findings
   - System produces findings with severity labels, confidence scores, and plain-language explanations for each detected leak.
3. **[system]** Post data leak findings to PR review
   - System delivers data leak findings alongside general vulnerability findings in the pull request review surface.
4. **[user]** Open a data leak finding
   - Developer clicks a data leak finding to see the full explanation, code location, and risk details.
5. **[user]** Review confidence score and explanation
   - Developer reads the plain-language risk explanation and checks the confidence score before deciding action.
6. **[user]** Decide on data leak finding action
   - Developer marks the finding as false positive, fixed, or open based on whether the leak is real.
7. **[system]** Save triage decision to scan history
   - System records the decision state against the scan run and updates the finding status for future reference.

## Trigger Security Scan on Pull Request

**Flow Type:** core_value
**Primary Flow:** yes
**Scope Status:** required_for_first_version
**Trigger:** Developer opens or updates a pull request on a connected repository.
**Outcome:** Vulcan completes the scan and posts findings directly into the PR review with severity labels and plain-language explanations.

### Steps

1. **[system]** Detect pull request event on connected repository
   - Vulcan detects a new or updated pull request via the repository integration and queues a scan for the changed code.
2. **[system]** Extract changed code from the pull request
   - Vulcan pulls the diff of changed files and isolates the code blocks that need analysis.
3. **[system]** Run AI security scan on changed code
   - Vulcan analyses the extracted code for general security vulnerabilities using its AI language model, favouring precision over recall.
4. **[system]** Generate findings with severity and confidence scores
   - Each detected vulnerability gets a severity label, a confidence score, and a plain-language explanation of the risk.
5. **[system]** Filter out low-confidence findings to reduce noise
   - Vulcan suppresses findings that fall below the confidence threshold to keep false positives minimal and preserve developer trust.
6. **[system]** Post findings into the pull request review
   - Vulcan delivers findings as a review comment or status check on the PR, including severity, explanation, and a link to details.
7. **[user]** See scan results appear in the PR
   - The developer views the posted findings directly in the pull request review interface without switching tools.
8. **[user]** Click a finding to see full details
   - The developer opens a finding to read the plain-language explanation, risk highlights, and confidence score.
9. **[user]** Decide next action on the finding
   - The developer proceeds to triage the finding — marking it false positive, fixed, or open — or continues the code review.

