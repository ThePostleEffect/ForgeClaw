# Xemory Keeper — Agent Configuration

## Tools
- memory_store: Index, tag, and store contextual memories with entity links and confidence scores.
- memory_recall: Retrieve relevant past context by topic, person, project, time range, or semantic similarity.
- memory_update: Update existing memories with new information, confidence changes, or contradiction notes.
- memory_prune: Archive or remove stale memories based on relevance decay and last-accessed date.
- knowledge_graph: Build, query, traverse, and visualize the knowledge graph of entities and relationships.
- file_write: Generate context summaries, "previously on..." briefings, and cross-agent intelligence reports.
- cross_agent_observe: Monitor session summaries from other agents for indexable decisions, insights, and commitments.

## Triggers
- on: agent.session_ended → index new decisions, insights, commitments, and context from the completed session
- on: agent.session_started → surface relevant memories for the starting session's topic and participants
- on: commitment.approaching → proactive alert when a tracked commitment deadline is within 48 hours
- on: contradiction.detected → alert when current context conflicts with stored memory
- on: schedule.weekly → knowledge graph maintenance, pruning, and cross-agent pattern analysis
- on: manual → user-initiated memory recall, search, or knowledge graph exploration

## Parameters
- auto_index: true
- relevance_threshold: 0.7
- confidence_decay_rate: 0.05
- max_memory_age_days: 365
- archive_after_inactive_days: 180
- prune_schedule: "weekly"
- proactive_surfacing: true
- max_proactive_per_session: 3
- contradiction_sensitivity: "medium"
- commitment_reminder_hours: 48
- cross_agent_indexing: true
- context_summary_max_words: 100

## Cross-Agent Observation Rules
- `inbox-zero-sentinel` → index important contacts, communication commitments, relationship patterns
- `content-forge` → index voice decisions, successful content formats, audience insights
- `personal-cfo` → index financial decisions, budget commitments, spending patterns (privacy: high)
- `research-raven` → index key findings, source evaluations, knowledge gaps identified
- `code-companion` → index architectural decisions, tech debt commitments, project evolution milestones
- `customer-whisperer` → index customer sentiment patterns, recurring issues, product feedback themes
- `meeting-maestro` → index all decisions, action items, and commitment owners
- `health-horizon` → index health goals, habit patterns, work-health correlations (privacy: highest)
- `sales-scout` → index deal outcomes, market insights, prospect relationship notes
- `learning-luminary` → index skill acquisitions, learning milestones, knowledge gaps filled

## Special
- This is a meta-agent: it observes and indexes across all other agent sessions
- Requires cross-agent memory access permissions
- Privacy tiers: memories are tagged with sensitivity levels and only surface in appropriate contexts
- Bonus template included with the XemorySystems Premium Bundle
