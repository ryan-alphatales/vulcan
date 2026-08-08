# Changed Code Extraction

**Priority:** High
**Status:** Todo
**Category:** Trigger Security Scan on Pull Request

## Feature Intent

Development teams need scans to focus on new risk introduced in a pull request, not re-scan the entire codebase on every change. This feature extracts only the changed code blocks from a pull request so that the downstream security scan analyzes precisely the diff that matters. The beneficiary is any developer or security reviewer who wants fast, relevant findings tied directly to what the pull request changes, reducing scan time and noise from unchanged code.

## In Scope

- Pull the diff of changed files from a pull request using the available source-control integration
- Isolate the added and modified code blocks within each changed file, excluding deleted lines and unchanged regions
- Produce a bounded extract of changed code that the downstream scan step can consume without re-fetching the diff
- Preserve enough source context (file path, line range, change type) so findings can be traced back to the pull request

## Out of Scope

- Running the AI security scan on the extracted code (that is a downstream workflow step)
- Determining which pull requests trigger a scan or managing scan policy/thresholds
- Storing scan results, assigning findings, or managing finding triage states
- Processing full-repository or branch-level scans outside of a pull request context

## Functional Requirements

1. The product must fetch the file-level diff from the pull request using the available source-control integration mechanism
2. The product must isolate only added and modified code lines from each changed file, excluding deleted lines and unchanged context regions
3. The product must assemble the extracted changes into a bounded result that includes, for each changed block, the file path, the line range, and the change type (added or modified)
4. The product must make the extracted changed-code result available to the downstream scan step in a deterministic, machine-readable form
5. The product must handle pull requests that contain multiple changed files and produce one consolidated extraction result
6. The product must clearly indicate when the diff is empty, the pull request is unavailable, or the fetch fails, so the downstream workflow can decide whether to skip or retry
7. The product must preserve the original code content exactly as it appears in the diff, without reformatting, truncation, or normalization

## Acceptance Scenarios

- [ ] Passes if a pull request with three changed files (one added, two modified) produces an extraction result containing only the added and modified lines, each with correct file path, line range, and change type, and no deleted lines appear.
- [ ] Passes if a pull request with no code changes (documentation-only or empty commit) results in a clear indication that the diff is empty, and the downstream scan step can decide to skip the scan.
- [ ] Fails if deleted lines or unchanged diff context regions appear in the extracted code blocks that are handed to the scan step.
- [ ] Fails if the extraction mutates, reformats, or normalizes the code content from the diff before passing it downstream.
- [ ] Passes if the extraction result includes every changed file from the pull request and does not silently omit files due to size, encoding, or path length without a clear error indication.
- [ ] Passes if attempting to fetch a diff from an unavailable or deleted pull request results in a clear failure indication rather than an empty extraction or silent skip.
- [ ] Passes if the extraction result includes sufficient source identity (repository, pull request identifier, commit range) that a finding generated downstream can be traced back to the specific pull request and file location.

## Edge Cases & States

- Empty diff: pull request has no file changes (e.g., metadata-only, already-merged base). The extraction must return an explicit empty state, not an error.
- Binary or non-text files changed: the diff includes files that cannot be meaningfully line-extracted (images, compiled assets). The product must either exclude them with a clear note or indicate that the file type is unsupported for extraction.
- Very large diff: a pull request touches hundreds of files or contains thousands of changed lines. The extraction must complete without timeout or truncation, or must clearly indicate the extraction size limit reached.
- Pull request unavailable: the source-control integration cannot reach the pull request (deleted, permissions revoked, transient API failure). The product must surface an unavailable state with enough detail for the downstream to decide retry or skip.
- Encoding or binary content in text files: a file marked as text contains non-UTF-8 or binary-looking content. The extraction must handle this without corruption and flag any unreadable segments.
- Renamed or moved files: the diff shows a file rename with no content change. The extraction must capture the change as zero added/modified lines unless content also changed, and preserve the new file path for traceability.

## Behavior Contract

- The extraction step must never alter the code content from the diff — it is a pass-through isolator, not a transformer
- The extraction must not execute, lint, compile, or interpret the code; it only isolates text blocks
- The extraction result must be deterministic: the same pull request diff always produces the same extracted blocks
- The extraction must not filter or suppress code based on language, framework, or perceived risk — filtering is a downstream concern
- If the diff fetch fails for any reason, the extraction must fail explicitly rather than silently produce a partial or empty result
- The extracted code blocks must retain their association with the source file path and pull request for audit and finding traceability

## Data & State

- Pull request identifier (e.g., PR number or ID) and source repository reference
- Per-file diff data: file path, change type (added, modified, renamed), and the original diff content
- Extracted code blocks: for each changed block, the file path, start line, end line, change type, and the exact code content
- Extraction result state: success with changed blocks, empty diff (no changes), or failure with error detail and retrieval context
- Pull request metadata: base branch, head branch, commit range, requested by (when available from the source integration)

## Actions & Triggers

- Triggered when a downstream workflow (scan orchestration) requests changed-code extraction for a specific pull request
- The extraction fetches the diff via the available source-control integration (the exact mechanism is a required capability for architecture to resolve)
- On successful extraction, the result is passed as input to the next step in the scan workflow
- On empty diff or failure, the extraction returns the appropriate state so the workflow orchestrator can skip, retry, or notify

## API / Integration Needs

- Needs a way to fetch the file-level diff for a given pull request from the source-control system (e.g., GitHub, GitLab, or equivalent host)
- Needs a way to resolve the pull request identity (repository, PR number) from the triggering event or workflow context
- Needs a way to surface the extraction result, including failure states, to the next step in the scan pipeline
- Needs a way to handle authentication and access to the source repository at the permission level required to read pull request diffs

## Permissions & Ownership

- The extraction must operate with read access to the source repository and pull request, using the same access boundary as the scan workflow
- Access to the source-control system must respect the project's existing repository permissions — the extraction must not escalate privileges
- The extraction result (changed code blocks) must inherit the access control of the scan workflow that triggered it, so only authorized workflows can consume it

## Verification Required

- Prove that a pull request with known added and modified lines across multiple files produces an extraction containing exactly those lines and no deleted or unchanged lines
- Prove that an empty pull request diff results in a clearly distinguishable empty state, not a generic error or silent success
- Prove that a pull request with a binary or unsupported file does not crash the extraction and that the unsupported file is noted in the result
- Prove that a fetch failure (simulated unavailable pull request) produces a failure state with enough detail for the workflow to decide next action, without leaking credentials or internal stack traces
- Prove that extraction performance for a pull request with at least 500 changed lines across 50 files completes without timeout and preserves all changed blocks
- Prove that the extraction result can be consumed by the next step in the scan pipeline without additional parsing or transformation
