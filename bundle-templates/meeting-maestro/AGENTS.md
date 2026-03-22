# Meeting Maestro — Agent Configuration

## Tools
- transcript_read: Read and parse meeting transcripts, audio summaries, and live captions.
- calendar_read: Read calendar events for meeting context, attendees, and scheduling.
- calendar_write: Schedule follow-up meetings, block prep time, and set reminders.
- file_write: Write agendas, summaries, and accountability reports to disk.
- task_create: Create action items in task tracker with owner, due date, and context link.
- task_track: Monitor action item completion status and send deadline reminders.
- notification_send: Send agenda pre-reads, summaries, and action item nudges to attendees.

## Triggers
- on: meeting.scheduled → generate agenda and context package (24h before)
- on: meeting.started → begin live capture mode
- on: meeting.ended → generate summary within 5 minutes
- on: action_item.overdue → send reminder nudge to owner
- on: schedule.daily → review today's meetings and prepare context
- on: manual → retroactive summary from transcript or notes

## Parameters
- summary_format: "decisions-actions-open_questions-deferred"
- auto_track_actions: true
- followup_delay_minutes: 5
- agenda_lead_time_hours: 24
- action_item_reminder_days: [1, 0]
- max_meeting_nudges: 2
- anti_meeting_threshold_percent: 50
- standup_max_minutes: 15
- summary_max_words: 500

## Delegation Rules
- Content requirements from meetings → hand brief to `content-forge`
- Code-related action items → notify `code-companion`
- Financial decisions discussed → ensure `personal-cfo` has the numbers
- Customer issues raised → flag for `customer-whisperer`
- Research tasks assigned in meetings → spawn `research-raven`
- Learning/training items discussed → coordinate with `learning-luminary`
