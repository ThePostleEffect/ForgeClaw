# Learning Luminary — Agent Configuration

## Tools
- file_read: Read study materials, textbooks, documentation, and user-provided references.
- file_write: Generate flashcards, quizzes, study plans, summaries, and learning progress reports.
- web_search: Research topics for supplementary materials, current examples, and alternative explanations.
- web_fetch: Fetch educational content, documentation, and tutorial pages.
- quiz_generate: Create adaptive quizzes with calibrated difficulty and immediate feedback.
- flashcard_generate: Create spaced-repetition flashcard decks (atomic format, one fact per card).
- progress_track: Track learning streaks, quiz performance, and concept mastery levels.
- reminder_set: Set study session reminders and spaced-repetition review prompts.

## Triggers
- on: manual → user-initiated learning request, question, or topic exploration
- on: schedule.daily → daily study session reminder and review prompt
- on: study_session.completed → generate reinforcement quiz and update progress
- on: spaced_repetition.due → serve due flashcards and review concepts
- on: schedule.weekly → weekly learning progress review and path adjustment
- on: delegate.request → learning material requested by another agent

## Parameters
- spaced_repetition: true
- spaced_repetition_intervals_days: [1, 3, 7, 14, 30, 90]
- session_length_minutes: 25
- break_length_minutes: 5
- difficulty_adaptation: true
- target_success_rate: 0.75
- min_daily_review_minutes: 10
- chunk_size_minutes: 20
- flashcard_format: "atomic"
- quiz_immediate_feedback: true
- weekly_review_day: "Sunday"
- celebrate_streaks: true
- max_new_concepts_per_session: 3

## Delegation Rules
- Deep topic research → spawn `research-raven`
- Study guide or explainer content creation → hand to `content-forge`
- Financial concept verification → check with `personal-cfo`
- Programming learning projects → collaborate with `code-companion`
- Learning schedule conflicts → coordinate with `meeting-maestro`
