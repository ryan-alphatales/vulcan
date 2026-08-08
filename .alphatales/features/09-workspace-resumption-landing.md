# Workspace Resumption Landing

**Priority:** High
**Status:** Todo
**Category:** Login to Existing Account

## Feature Intent

Returning authenticated developers land directly on their workspace with immediate visibility into their connected repositories, recent scan activity, and pending triage items. This eliminates the friction of re-navigating to their work after login and reduces the uncertainty of 'what needs my attention right now.' The feature belongs in Vulcan because scan findings require ongoing triage across sessions, and forcing developers to reconstruct their context on every login would undermine the team workflow the product needs to support.

## In Scope

- Routing an already-authenticated developer directly to a workspace overview on subsequent visits without requiring them to re-select a project or workspace
- Displaying the developer's connected repositories so they can confirm which codebases are linked for scanning
- Showing recent scan activity for those connected repositories, including when scans ran and their current status
- Surfacing the developer's pending triage items — findings that have not yet been resolved, assigned away, or closed — so they can resume work immediately

## Out of Scope

- Executing new scans or triggering scan configuration changes from this landing view
- Adding, removing, or managing repository connections (belongs to repository setup/management)
- Displaying team-wide or aggregate metrics beyond the individual developer's own triage queue and connected repositories

## Functional Requirements

1. The product must route an authenticated developer to the workspace landing without requiring a manual workspace or project selection step on each return visit
2. The product must display the developer's connected repositories, with each repository clearly labeled using the identifier supplied by the source context (e.g., repository name)
3. The product must display recent scan activity for connected repositories, including the scan status and the timestamp of the most recent scan for each
4. The product must display the developer's pending triage items, limited to findings that are assigned to that developer or are unassigned and within their scope, and that have not been resolved or closed
5. The product must clearly indicate when connected repositories, recent scan activity, or pending triage items are unavailable or have not yet been populated
6. The product must preserve the read-only nature of this landing — the developer views their workspace state but does not modify repository connections, scan configurations, or finding statuses from this surface

## Acceptance Scenarios

- [ ] Given an authenticated developer with connected repositories, recent scans, and pending triage items, when they return to Vulcan, then the workspace landing displays all three sections without requiring manual navigation or selection
- [ ] Given an authenticated developer with no connected repositories, when they land on the workspace, then the repository section clearly indicates that no repositories are connected instead of showing an error or blank state
- [ ] Given an authenticated developer with connected repositories but no pending triage items, when they land on the workspace, then the triage section shows a clear empty state indicating nothing is pending
- [ ] Given an authenticated developer whose most recent scan failed or was interrupted, when they land on the workspace, then the scan activity section shows the failed status and the timestamp of that attempt
- [ ] Given an unauthenticated visitor, when they attempt to reach the workspace landing, then the product redirects them to authentication instead of showing an empty or broken workspace
- [ ] Given an authenticated developer returning after another team member reassigned one of their pending items, when they land on the workspace, then that item no longer appears in their pending triage list

## Edge Cases & States

- Loading state: Workspace sections (repositories, scan activity, triage items) load asynchronously and must show a loading indicator rather than blank content or stale cached data
- Empty state: First-time developer with no connected repositories, no scans, and no triage items — all three sections must clearly indicate the empty state with guidance on next steps when available
- Error state: Backend data for one section (e.g., scan activity) fails to load while other sections succeed — the failed section shows an error state without breaking the other sections
- Stale data: Scan activity status that changed between page load and the developer's return to a previously open session — the implementation must either refresh on landing or clearly indicate the last-fetched time
- Permission boundary: A developer who was removed from a repository or team between sessions should not see triage items or scan activity for repositories they no longer have access to
- Large dataset: A developer with many connected repositories and hundreds of pending triage items — the landing must handle pagination or reasonable truncation without performance degradation

## Behavior Contract

- The workspace landing must not require the developer to manually select or navigate to a workspace on return visits — routing is automatic based on the authenticated session
- Each section (repositories, scan activity, triage items) must degrade independently — failure to load one section must not prevent the others from rendering
- The landing must reflect the developer's current access permissions at the time of the request, not cached permissions from a previous session
- The implementation must not allow workspace data from one authenticated developer to be visible to another developer under any circumstance
- Triage items shown must be limited to findings that are genuinely pending — resolved, closed, or false-positive findings must be excluded

## Data & State

- Authenticated developer identity, including session validity and the workspace or team membership that determines which repositories and triage items are visible
- Connected repositories list: each entry includes a repository identifier (name or label as supplied by the source context) and its connection status
- Recent scan activity per repository: scan status (e.g., completed, failed, in progress), timestamp of the most recent scan, and the repository it belongs to
- Pending triage items: each includes the finding identifier, title, severity level (as supplied by the scan), assignment status, and the repository it belongs to
- Temporary loading, empty, and error states per section that the UI layer uses to render appropriate indicators without persisting stale data

## Actions & Triggers

- Developer authenticates (or already has a valid session) and navigates to the Vulcan application — this triggers the workspace landing route
- On landing, the product fetches the developer's connected repositories, recent scan activity, and pending triage items from the backend
- When a scan completes or a triage item is reassigned by another team member while the developer is on the landing, the product needs a way to surface updated data (either on next landing or via a refresh capability)

## API / Integration Needs

- Needs a way to retrieve the authenticated developer's connected repositories and their current connection status
- Needs a way to retrieve recent scan activity for the developer's connected repositories, including scan status and timestamps
- Needs a way to retrieve the developer's pending triage items filtered to unresolved findings assigned to or relevant to that developer
- Needs a way to validate that the developer's session is still active and their access permissions are current before returning workspace data

## Permissions & Ownership

- Only an authenticated developer can access the workspace landing — unauthenticated visitors must be redirected to authentication
- A developer must only see repositories they are connected to or have been granted access to within their team or project scope
- A developer must only see triage items assigned to them or unassigned items within their authorized scope — not items assigned exclusively to other team members
- The workspace landing is per-developer — no other user can view another developer's workspace landing as if it were their own

## Verification Required

- Verify that an authenticated developer arriving at the application lands directly on the workspace without an intermediate project-selection step
- Verify that connected repositories, scan activity, and pending triage items all render correctly for a developer with populated data across all three sections
- Verify that each section handles its own loading, empty, and error states independently without blocking the other sections
- Verify that a developer who is removed from a repository between sessions no longer sees that repository or its associated scan activity and triage items on their next landing
- Verify that pending triage items exclude findings already marked as resolved, closed, or false positive
