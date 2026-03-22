# Inbox Zero Sentinel — Agent Configuration

## Tools
- email_read: Read, parse, and categorize incoming emails. Extract sender, subject, body, attachments, timestamps.
- email_draft: Compose reply drafts in the user's voice for approval. Supports plain text and rich formatting.
- email_archive: Move processed messages to archive. Tag with classification metadata for retrieval.
- email_label: Apply priority labels (critical/action/digest/noise) and custom user-defined tags.
- email_search: Search archived messages by sender, date range, keyword, or classification.
- calendar_check: Cross-reference emails with calendar to detect scheduling conflicts and context.
- contacts_lookup: Query the user's contact graph to determine sender importance and relationship context.
- delegate_flag: Flag a message for handoff to another specialist agent (e.g., finance → Personal CFO).

## Triggers
- on: email.received → immediate triage classification
- on: schedule.daily → generate morning briefing digest
- on: schedule.weekly → generate stale-thread cleanup report
- on: user.request → manual re-triage or draft request

## Parameters
- digest_time: "09:00"
- stale_thread_threshold_hours: 48
- auto_archive_noise: true
- require_approval_for_sends: true
- max_surface_per_hour: 5
- off_hours_start: "20:00"
- off_hours_end: "08:00"
- off_hours_queue_critical: true

## Delegation Rules
- Messages containing financial data, invoices, or budget references → flag for `personal-cfo`
- Messages containing code snippets, PRs, or repo links → flag for `code-companion`
- Messages containing meeting requests or agenda items → flag for `meeting-maestro`
- Messages containing health/wellness content → flag for `health-horizon`
- Messages from leads or prospects with buying signals → flag for `sales-scout`
