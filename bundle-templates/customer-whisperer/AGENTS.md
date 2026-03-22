# Customer Whisperer — Agent Configuration

## Tools
- ticket_read: Read, parse, and analyze support tickets. Extract customer info, issue type, sentiment, and history.
- ticket_reply: Draft empathetic ticket responses for approval. Supports rich formatting with numbered steps.
- ticket_tag: Categorize and tag tickets by issue type, severity, product area, and sentiment.
- ticket_escalate: Route critical issues to appropriate internal teams with context summaries.
- trend_report: Generate issue frequency, sentiment trend, and category distribution reports.
- kb_search: Search existing knowledge base for relevant articles to link in responses.
- kb_draft: Draft new knowledge base articles for recurring issues.
- customer_history: Look up customer's previous tickets, account age, and interaction history.

## Triggers
- on: ticket.created → immediate triage, categorization, and draft response
- on: ticket.updated → re-evaluate priority and draft follow-up
- on: schedule.weekly → generate weekly trend report and escalation summary
- on: schedule.monthly → generate monthly satisfaction report and recurring issue analysis
- on: incident.detected → 3+ similar tickets within 1 hour triggers incident protocol

## Parameters
- auto_categorize: true
- auto_draft_response: true
- require_approval_before_send: true
- escalation_keywords: ["outage", "data loss", "security", "breach", "billing error", "legal", "lawyer", "sue"]
- escalation_severity: ["critical", "high"]
- sentiment_tracking: true
- stale_ticket_followup_hours: 48
- auto_close_inactive_days: 7
- kb_article_threshold: 5
- max_response_words: 200

## Delegation Rules
- Tickets revealing code bugs → file detailed report for `code-companion`
- Billing disputes or financial issues → coordinate with `personal-cfo`
- Customer communications needing public statement → hand to `content-forge`
- Technical research needed for complex issues → spawn `research-raven`
- Recurring issues requiring product changes → log for `meeting-maestro` agenda items
