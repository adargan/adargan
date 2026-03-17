# CLAUDE.md

This file provides guidance to AI assistants (Claude and others) working in this repository.

## Repository Overview

**Repository:** adargan/adargan
**Status:** Newly initialized — no source files have been committed yet.

This CLAUDE.md will be updated as the project evolves. AI assistants should update this file when significant structural or workflow changes are made.

## Current State

The repository contains no source code, dependencies, tests, or documentation beyond this file. Before working on code tasks, check:

```bash
git branch -a          # list all branches
git log --oneline -20  # recent commit history
ls -la                 # current working directory contents
```

## Git Workflow

### Branch Naming
- Feature/AI branches must follow: `claude/<description>-<session-id>`
- Example: `claude/add-claude-documentation-OyrWl`

### Commit Style
- Use concise, imperative-mood commit messages (e.g., "Add authentication module")
- Reference issue numbers when applicable: `Fix login bug (#42)`
- Keep commits focused — one logical change per commit

### Push Protocol
Always push with tracking:
```bash
git push -u origin <branch-name>
```

If push fails due to network issues, retry with exponential backoff: 2s, 4s, 8s, 16s.

**Never push to `main`/`master` directly without explicit permission.**

## Development Setup

> This section should be updated once the project stack is established.

When the project is initialized, document here:
- Language and runtime version requirements
- How to install dependencies
- How to start a development server or REPL
- Required environment variables (never commit secrets)

## Testing

> Update this section once a test framework is chosen.

Document here:
- Test runner command (e.g., `npm test`, `pytest`, `cargo test`, `go test ./...`)
- How to run a single test file or test case
- How to run tests with coverage
- What must pass before committing

## Build & CI

> Update this section once CI/CD is configured.

Document here:
- Build command
- Lint/format commands
- CI pipeline location (`.github/workflows/`, etc.)
- What checks must pass before merging

## Code Conventions

> Update this section once a language and style guide are established.

Document here:
- Formatting tool and config (e.g., Prettier, Black, rustfmt)
- Linter (e.g., ESLint, Ruff, Clippy)
- File and directory naming conventions
- Import ordering conventions

## Key Directories

> Update this section as the project structure takes shape.

| Directory | Purpose |
|-----------|---------|
| _(none yet)_ | _(repository is empty)_ |

## AI Assistant Instructions

1. **Read this file first** before starting any task in this repository.
2. **Update this file** when you make significant structural changes (new directories, new tooling, dependency changes).
3. **Keep secrets out of commits** — use environment variables or secret managers.
4. **Follow the branch rules** above — always work on the designated `claude/` branch.
5. **Prefer small, focused commits** over large atomic changes when possible.
6. **Run tests and linters** before committing (once configured).
7. **Ask before destructive operations** (force-push, branch deletion, database drops, etc.).
