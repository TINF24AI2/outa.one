# Collaboration Guidelines
This is the documentation for what conventions we use, how to get the project running locally and the workflow we prefer for Collaboration.

## Table of contents
- [Development setup](#development-setup)
- [Branching & PR workflow](#branching-pr-workflow)
- [Commit messages](#commit-messages)
- [Pull request checklist](#pull-request-checklist)
- [Reviews & merging](#reviews-merging)
- [Coding style](#coding-style)
- [Naming conventions](#naming-conventions)
- [Code Structure](#code-structure)

---

<a id="development-setup"></a>
## Development setup

<a id="branching-pr-workflow"></a>
## Branching & PR workflow

We use a feature-branch workflow targeting `main`. Work happens on separate branches categorized by topic. The `main` branch has a linear history and every change requires a Pull Request (which is enforced via GitHub).

- Branch from `main`:
    - `git switch main`
    - `git switch -c <type>/<short-description>`
- Frequently rebase onto `main` to keep your branch up to date.
    - `git fetch origin/main`
    - `git rebase origin/main`

Suggested branch name prefixes with example branch names:

- feat/login-page
- fix/login-button-not-working
- refactor/db-connection
- docs/update-branch-naming
- chore/update-dependencies


<a id="commit-messages"></a>
## Commit messages

Write clear, concise commit messages. Use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) like in the following examples:

- feat: add new trail feature
- fix: crash when opening saved trail
- docs: update CONTRIBUTING.md
- refactor: simplify trail data model
- test: add unit tests for trail parser
- chore: update Gradle dependencies

Format: `<type>(<scope>): <short summary>`

<a id="pull-request-checklist"></a>
## Pull request checklist

Before requesting review, ensure:

- [ ] Branch is up-to-date with `main`. (If not rebase)
- [ ] Code compiles and the app builds.
- [ ] Formatting checks pass.
- [ ] Updated relevant docs (if applicable).
- [ ] Includes description of changes.

<a id="reviews-merging"></a>
## Reviews & merging

The following requirements are enforced via GitHub:
- At least one approving review from a maintainer is required.
- Code Checks are required to pass.
- Only fast forward merges (i.e. only pulling via rebase) are possible to keep `main` linear.

<a id="coding-style"></a>
## Coding style


<a id="naming-conventions"></a>
## Naming conventions


<a id="code-structure"></a>
## Code Structure
