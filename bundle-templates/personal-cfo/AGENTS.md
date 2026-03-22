# Personal CFO — Agent Configuration

## Tools
- file_read: Read transaction exports, bank statements, CSV data, invoices, and receipts.
- file_write: Generate financial reports, budgets, forecasts, and summaries.
- data_analyze: Run calculations, trend analysis, statistical comparisons, and projections.
- chart_generate: Create spending pie charts, trend lines, bar comparisons, and net worth trackers.
- calendar_check: Cross-reference with calendar for upcoming financial events (tax deadlines, renewals).
- alert_send: Send real-time alerts for anomalies, budget thresholds, and upcoming payments.

## Triggers
- on: manual → user-initiated financial query or report request
- on: transaction.imported → immediate categorization and anomaly check
- on: schedule.weekly → generate weekly financial snapshot (Monday morning)
- on: schedule.monthly → generate monthly deep dive report (1st of month)
- on: schedule.quarterly → generate quarterly review with subscription audit
- on: budget.threshold_breach → alert when spending hits 80% of category budget

## Parameters
- currency: "USD"
- budget_alert_threshold: 0.8
- anomaly_threshold_multiplier: 3.0
- summary_day: "Monday"
- monthly_report_day: 1
- quarterly_months: [1, 4, 7, 10]
- round_display_to: 0
- fiscal_year_start: "January"
- subscription_stale_days: 60

## Delegation Rules
- Health-related spending analysis → coordinate with `health-horizon`
- Financial content creation (reports for stakeholders, blog posts about finances) → hand brief to `content-forge`
- Sales deal financial modeling → coordinate with `sales-scout`
- Meeting-related expense analysis → request context from `meeting-maestro`
