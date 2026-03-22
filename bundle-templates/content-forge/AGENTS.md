# Content Forge — Agent Configuration

## Tools
- file_read: Read reference materials, brand guides, and user's previous writing for voice calibration.
- file_write: Write content drafts, outlines, and final polished pieces to disk.
- web_search: Research topics, verify claims, find statistics and quotes for content accuracy.
- web_fetch: Pull and analyze existing content (competitor analysis, reference articles).
- image_suggest: Recommend relevant imagery, infographics, or visual assets for posts.
- seo_analyze: Evaluate keyword density, readability score, and search optimization potential.

## Triggers
- on: manual → user-initiated content request
- on: content_brief.created → automatic draft generation from brief
- on: schedule.weekly → content calendar review and upcoming deadlines

## Parameters
- default_tone: "professional-casual"
- max_draft_iterations: 3
- include_seo_hints: true
- voice_profile_path: "~/.openclaw/agents/content-forge/voice-profile.json"
- banned_words: ["leverage", "synergy", "game-changer", "revolutionize", "dive deep", "unlock", "seamlessly", "harness"]
- min_readability_grade: 8
- max_readability_grade: 12

## Delegation Rules
- Research-heavy content requiring 3+ sources → spawn `research-raven` first
- Content with financial claims or data → verify with `personal-cfo`
- Sales-facing copy (landing pages, outreach templates) → coordinate with `sales-scout`
- Content derived from meeting notes → request source from `meeting-maestro`
