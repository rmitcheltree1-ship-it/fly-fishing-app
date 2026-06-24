# AI_WORKFLOW.md

Purpose:

Define how ChatGPT, Codex, and Claude Code should collaborate on this project.

---

# Project Philosophy

This application is an offline-first personal fishing intelligence platform.

Goals:

1. Reliability
2. Simplicity
3. Data quality
4. Long-term analytics

Avoid:

* Premature optimization
* Unnecessary refactors
* Over-engineering
* Building AI features before data foundations exist

---

# Source of Truth

GitHub is the source of truth.

Important documents:

* PROJECT_STATE.md
* NEXT_FEATURE.md
* CHANGELOG.md
* AI_WORKFLOW.md

All agents should review these files before making recommendations.

---

# Agent Responsibilities

## ChatGPT

Role:

Product Manager
Architect
Technical Reviewer

Responsibilities:

* Feature planning
* Roadmap creation
* Database design
* Product prioritization
* Technical reviews
* Code reviews

Should NOT:

* Rewrite large portions of the codebase
* Perform broad refactors without justification

---

## Claude Code

Role:

Primary Builder

Responsibilities:

* Implement NEXT_FEATURE.md
* Write production code
* Create migrations
* Update affected files
* Follow existing architecture

Should NOT:

* Redesign unrelated systems
* Change project direction
* Add extra features not requested

Prompt Pattern:

Implement NEXT_FEATURE.md.
Do not modify unrelated functionality.
Preserve existing behavior.
Update CHANGELOG.md when complete.

---

## Codex

Role:

Reviewer
Debugger
Repository Analyst

Responsibilities:

* Review pull requests
* Identify bugs
* Find architecture risks
* Suggest improvements
* Review database impacts

Should NOT:

* Make large architectural decisions
* Expand project scope

Prompt Pattern:

Review current implementation against NEXT_FEATURE.md.

Provide:

1. Risks
2. Bugs
3. Missing requirements
4. Suggested fixes

Do not modify code.

---

# Development Process

Step 1

ChatGPT creates:

* Feature specification
* Acceptance criteria
* Success criteria

Output:

NEXT_FEATURE.md

---

Step 2

Claude Code implements feature on a branch.

Branch naming:

feature/<feature-name>

Examples:

feature/catch-tracking
feature/fly-box-v2

---

Step 3

Codex reviews implementation.

Focus:

* Bugs
* Missing requirements
* Sync concerns
* Data model concerns

---

Step 4

Claude Code fixes review findings.

---

Step 5

Manual testing.

Checklist:

* Offline mode
* Cloud sync
* Existing data compatibility
* Mobile experience

---

Step 6

Merge to main.

Update:

CHANGELOG.md

Update:

PROJECT_STATE.md

---

# Current Priorities

Priority 1

Catch-Level Tracking

Priority 2

Fly Box Improvements

Priority 3

Fly Analytics

Priority 4

River Analytics

Priority 5

Fishing Copilot

---

# Architectural Rules

Rule 1

Offline functionality is required.

IndexedDB remains primary storage.

---

Rule 2

Supabase is synchronization, not primary storage.

---

Rule 3

Existing user data must not break.

Backward compatibility is preferred.

---

Rule 4

Favor small incremental changes.

Avoid large refactors unless necessary.

---

Rule 5

Analytics require clean data.

Prioritize data quality over flashy features.

---

# Definition of Success

The application should eventually answer:

"What should I fish today based on my historical success?"

Every feature should move the system toward answering that question.
