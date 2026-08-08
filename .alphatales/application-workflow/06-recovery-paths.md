# Recovery Paths

## Handle Failed or Incomplete Scan

**Flow Type:** exception_recovery
**Scope Status:** supporting_for_first_version
**Trigger:** A scan fails due to repository access issues, AI model errors, or timeout.
**Outcome:** Developer sees a clear failure message with the reason and can trigger a rescan or proceed without blocking the PR merge.

### Steps

1. **[system]** Detect scan failure or timeout
   - Vulcan detects that the scan did not complete — due to repo access errors, AI model unavailability, or a hard timeout.
2. **[system]** Classify the failure reason
   - The system identifies the failure category: repository access issue, AI model error, or scan timeout.
3. **[system]** Post failure notice to the PR
   - Vulcan posts a clear failure message in the PR review thread with the reason and a link to retry.
4. **[user]** Read the failure message in the PR
   - The developer sees the failure notice in their pull request and reads why the scan did not finish.
5. **[user]** Decide to retry or skip the scan
   - The developer chooses to trigger a rescan or proceed with merging the PR without scan results.
6. **[user]** Trigger a rescan from the PR
   - If retrying, the developer clicks the retry link to restart the security scan on the same pull request.
7. **[system]** Restart the scan on the pull request
   - Vulcan re-initiates the scan against the current PR diff and begins fresh analysis.
8. **[system]** Confirm scan restart in the PR
   - The system posts a brief confirmation that a new scan has been queued so the developer knows the retry worked.

