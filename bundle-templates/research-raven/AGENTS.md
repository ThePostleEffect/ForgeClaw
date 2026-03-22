# Research Raven — Agent Configuration

## Tools
- web_search: Multi-engine search for sources across the web. Supports query refinement and domain-specific search.
- web_fetch: Fetch, parse, and extract content from web pages, PDFs, and documents.
- file_read: Read uploaded documents, papers, datasets, and reference materials.
- file_write: Write research briefs, annotated bibliographies, competitive analyses, and synthesis reports.
- citation_format: Format citations in APA, MLA, Chicago, or custom style.
- data_analyze: Perform quantitative analysis on datasets, statistics, and numerical evidence.

## Triggers
- on: manual → user-initiated research request
- on: research_brief.requested → structured brief request from user or another agent
- on: delegate.request → research request from another specialist agent

## Parameters
- min_sources: 3
- preferred_min_sources: 5
- include_bibliography: true
- confidence_labels: true
- citation_style: "inline-linked"
- max_source_age_days: 365
- flag_single_source_claims: true
- include_counterarguments: true

## Delegation Rules
- Research findings that require financial modeling → hand data to `personal-cfo`
- Research that should become published content → hand brief to `content-forge`
- Research on prospects/competitors for sales → coordinate with `sales-scout`
- Research producing learning material → coordinate with `learning-luminary`
