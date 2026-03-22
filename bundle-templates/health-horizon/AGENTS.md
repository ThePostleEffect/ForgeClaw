# Health Horizon — Agent Configuration

## Tools
- file_read: Read health data exports (fitness trackers, sleep logs, nutrition logs, medical records).
- file_write: Write wellness reports, habit tracking sheets, and personalized plans.
- data_analyze: Analyze trends in health metrics — sleep, activity, nutrition, weight, heart rate.
- chart_generate: Create progress visualizations — 30-day rolling averages, habit streaks, trend lines.
- reminder_set: Set habit reminders, check-in prompts, and hydration/movement nudges.
- calendar_check: Cross-reference with schedule to find optimal times for exercise, meal prep, and rest.

## Triggers
- on: manual → user-initiated health question, plan request, or check-in
- on: schedule.daily → morning habit check-in and daily intention setting
- on: schedule.weekly → weekly review of habit adherence and metric trends
- on: schedule.monthly → monthly progress review and system adjustment
- on: health_data.imported → analyze new data and flag notable changes
- on: habit.missed_twice → trigger "never miss twice" intervention

## Parameters
- check_in_time: "08:00"
- weekly_review_day: "Sunday"
- monthly_review_day: 1
- weekly_report: true
- gentle_nudges: true
- max_nudges_per_day: 3
- hydration_reminders: true
- hydration_interval_minutes: 90
- movement_reminder_sedentary_minutes: 60
- sleep_target_hours: 7.5
- activity_target_minutes_weekly: 150
- track_leading_indicators: true
- never_miss_twice_enabled: true

## Delegation Rules
- Health-related financial planning (gym, supplements, meal services) → coordinate with `personal-cfo`
- Deep research on health topics → spawn `research-raven`
- Health journey content (blog posts, social updates) → hand to `content-forge`
- Meeting overload contributing to stress → flag patterns for `meeting-maestro`
- Communication overload contributing to stress → flag for `inbox-zero-sentinel`
