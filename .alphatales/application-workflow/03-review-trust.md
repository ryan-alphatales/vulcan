# Review & Trust

## Review Finding with Confidence Score

**Flow Type:** review_approval_trust
**Scope Status:** required_for_first_version
**Trigger:** Developer opens a finding from the PR review or Vulcan dashboard.
**Outcome:** Developer sees the plain-language explanation, risk highlights, confidence score, and a clear flag if the finding needs human review.

### Steps

1. **[user]** Open a finding from the PR
   - Developer clicks a finding link in the PR review comment or selects a finding from the Vulcan dashboard.
2. **[system]** Load the finding detail view
   - System fetches the full finding record including scan metadata, code snippet, and AI-generated explanation.
3. **[system]** Display severity and risk highlights
   - System shows the severity label and a short list of risk highlights above the explanation.
4. **[system]** Show the plain-language explanation
   - System presents the AI-generated explanation describing the vulnerability, its location, and a suggested fix.
5. **[system]** Present the confidence score
   - System displays the AI confidence score as a percentage with a simple visual indicator of trust level.
6. **[system]** Flag low-confidence findings
   - System marks findings below the confidence threshold with a visible banner recommending human review.
7. **[user]** Decide whether to trust the finding
   - Developer evaluates the explanation, confidence score, and code context to judge the finding's accuracy.

## Triage a Finding

**Flow Type:** review_approval_trust
**Scope Status:** required_for_first_version
**Trigger:** Developer has reviewed a finding and made a decision.
**Outcome:** Finding state is updated (false positive / fixed / open) and the developer can move to the next item.

### Steps

1. **[user]** Open the Finding Detail View
   - Click on a finding from the PR review or Vulcan dashboard to see its full explanation and confidence score.
2. **[system]** Display Finding with Triage Controls
   - Show the plain-language explanation, severity label, confidence score, and three triage buttons: False Positive, Fixed, and Open.
3. **[system]** Warn on Low-Confidence Findings
   - Highlight the confidence score and show a 'needs human review' flag when confidence falls below the threshold.
4. **[user]** Choose the Triage Decision
   - Select False Positive, Fixed, or Open based on the developer's assessment of the finding.
5. **[system]** Confirm the Triage Action
   - Prompt for confirmation before applying the state change, especially for False Positive to prevent accidental dismissal.
6. **[user]** Confirm the Decision
   - Approve the confirmation prompt to finalise the triage state for this finding.
7. **[system]** Update Finding State
   - Save the new state immediately and show a brief success message so the developer knows it took effect.
8. **[system]** Return to Finding List
   - Bring the developer back to the finding list or next finding so they can continue without extra navigation.

