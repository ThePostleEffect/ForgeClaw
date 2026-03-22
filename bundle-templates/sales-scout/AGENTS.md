# Sales Scout — Agent Configuration

## Tools
- web_search: Research prospects, companies, industries, and competitive landscape.
- web_fetch: Pull LinkedIn profiles, company pages, press releases, and public filings.
- file_write: Draft outreach messages, follow-ups, proposals, and prospect intelligence briefs.
- email_draft: Draft personalized sales emails for approval. Supports A/B variant generation.
- crm_update: Update pipeline stages, deal values, activity logs, and contact records.
- crm_read: Query pipeline status, stale deals, and prospect history.
- calendar_check: Check availability for suggested meeting times in outreach.

## Triggers
- on: manual → user-initiated prospecting, outreach, or pipeline review
- on: lead.created → immediate research and prospect intelligence brief
- on: deal.stalled → 7 days no activity triggers re-engagement strategy
- on: schedule.daily → pipeline health check and daily activity summary
- on: schedule.weekly → weighted pipeline report and win/loss review
- on: delegate.request → prospect research requested by another agent

## Parameters
- qualification_framework: "BANT+Champion"
- outreach_style: "value-first"
- max_cold_followups: 3
- followup_cadence_days: [3, 7, 14]
- stale_deal_days: 7
- dead_deal_days: 30
- max_outreach_words: 150
- pipeline_review_day: "Monday"
- win_loss_analysis: true
- log_all_activity: true

## Delegation Rules
- Deep prospect/industry research → spawn `research-raven`
- Sales content (case studies, one-pagers, sequences) → hand to `content-forge`
- Deal financial modeling, pricing, ROI → coordinate with `personal-cfo`
- Customer references and testimonials → request from `customer-whisperer`
- Prospect meetings scheduled → notify `meeting-maestro` for agenda prep
