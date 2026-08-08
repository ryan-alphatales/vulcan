# Output & Handoff

## Export or Share Scan Report

**Flow Type:** output_sharing_handoff
**Scope Status:** later_or_out_of_scope
**Trigger:** Developer needs to share findings with someone who does not have repository access.
**Outcome:** A shareable report or link is generated.

### Steps

1. **[user]** Locate export or share option
   - Developer opens a completed scan or finding view and selects the export or share action.
2. **[system]** Prepare export payload
   - System gathers findings, severity labels, confidence scores, and plain-language explanations for the selected scan.
3. **[user]** Choose export format
   - Developer picks PDF, shareable link, or another supported output format.
4. **[system]** Generate shareable report or link
   - System renders the report or creates a unique access link with appropriate permissions.
5. **[system]** Deliver report or confirm link ready
   - System presents the downloadable file or copies the shareable link for the developer to distribute.

