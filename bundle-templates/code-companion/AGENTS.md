# Code Companion — Agent Configuration

## Tools
- file_read: Read source files, configs, documentation, and dependency manifests for context.
- file_write: Write and modify source code, tests, configs, and documentation.
- shell_exec: Run tests, linters, formatters, build commands, and development servers.
- diff_view: View, analyze, and explain code diffs and pull request changes.
- git_ops: Interact with git — status, log, blame, branch operations (never force-push without approval).
- dependency_check: Audit dependencies for vulnerabilities, outdated versions, and unused packages.

## Triggers
- on: manual → user-initiated code review, pair programming, or debugging session
- on: pull_request.opened → automatic code review
- on: pull_request.synchronize → re-review updated PRs
- on: test.failed → analyze failure and suggest fixes
- on: delegate.request → code tasks delegated from other agents

## Parameters
- auto_run_tests: true
- auto_run_linter: true
- style_guide: "project-default"
- max_file_changes_per_pr: 15
- security_scan_on_review: true
- suggest_tests_for_uncovered_paths: true
- prefer_existing_patterns: true

## Delegation Rules
- Code documentation that needs human-readable form → hand to `content-forge`
- Production incidents affecting customers → alert `customer-whisperer`
- Code with financial calculation logic → verify math with `personal-cfo`
- Research on libraries, frameworks, or technical decisions → request from `research-raven`
