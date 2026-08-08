# Admin & Operations

## Admin Dashboard for Operational Oversight

**Flow Type:** admin_operational
**Scope Status:** later_or_out_of_scope
**Trigger:** Administrator needs to check system health or user activity.
**Outcome:** Dashboard shows key operational metrics.

### Steps

1. **[user]** Log into the Admin Dashboard
   - Administrator authenticates and lands on the operational overview screen.
2. **[system]** Show Scan Volume Summary
   - Dashboard displays total scans run over a selected time period with trend indicator.
3. **[system]** Show Failure Rate Panel
   - Dashboard surfaces the percentage of scans that failed or timed out with a breakdown by reason.
4. **[system]** Display User Activity Overview
   - Dashboard lists active users, repositories connected, and scans triggered per user.
5. **[user]** Filter by Date Range
   - Administrator adjusts the time window to narrow or expand the metrics view.
6. **[user]** Drill into a Specific Metric
   - Administrator clicks a metric card to see detailed logs or scan records behind the number.
7. **[system]** Refresh Dashboard Data
   - System updates all panels with the latest operational data on request or on a timed interval.

