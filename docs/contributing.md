# Collaboration Guidelines

This is the documentation for what conventions we use, how to get the project running locally and the workflow we prefer for Collaboration.

## Table of contents

- [Collaboration Guidelines](#collaboration-guidelines)
  - [Table of contents](#table-of-contents)
  - [Development setup](#development-setup)
    - [Prerequisites](#prerequisites)
    - [Setting up the project](#setting-up-the-project)
    - [Running the development server](#running-the-development-server)
  - [Branching \& PR workflow](#branching--pr-workflow)
  - [Commit messages](#commit-messages)
  - [Pull request checklist](#pull-request-checklist)
  - [Reviews \& merging](#reviews--merging)
  - [Coding style](#coding-style)
  - [Naming conventions](#naming-conventions)
  - [Code Structure](#code-structure)

---

<a id="development-setup"></a>

## Development setup

### Prerequisites

First of all, make sure you have the latest Node.js LTS version installed. Currently, that is Node.js 24.x LTS. If you haven't, download it from the [official website](https://nodejs.org/en/download/) or using a node version manager like [nvm](https://github.com/nvm-sh/nvm) (for Linux and macOS) or [fnm](https://github.com/Schniz/fnm) (for Windows).

As we are using [pnpm](https://pnpm.io/) as our package manager, you also need to have it installed globally. If you haven't yet, you can install it with npm:

```bash
npm install -g pnpm
```

In order to run the provided Docker Compose setup, make sure you have [Docker](https://www.docker.com/get-started) installed and running on your machine. You can also install [Docker Desktop](https://www.docker.com/products/docker-desktop), if you are using Windows or macOS and prefer a graphical user interface for managing your Docker containers.

> [!NOTE]
> On macOS, you might want to install [OrbStack](https://orbstack.dev/) instead of Docker Desktop. It's an alternative GUI for managing Docker containers on macOS and [offers better performance](https://docs.orbstack.dev/compare/docker-desktop).

### Setting up the project

To clone the project locally, first clone the repository:

```bash
git clone https://github.com/TINF24AI2/outa.one.git
cd outa.one
```

Then, install the dependencies using the following command:

```bash
pnpm i
```

After successfully installing the dependencies, make sure to set up the environment variables. You can do that by copying the `.env.example` file to `.env` and filling in the required values (see comments in the `.env.example` file for more details):

```bash
cp .env.example .env
```

### Running the development server

Before starting the actual development server, make sure to start the database and mail server locally. You can do that by running the following command in the root of the project:

```bash
docker compose up -d
```

To start the development server, run:

```bash
pnpm dev
```

You can access the application at `http://localhost:5173`.

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

Format: `<type>: <short summary>`

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

> TBD

<a id="naming-conventions"></a>

## Naming conventions

> TBD

<a id="code-structure"></a>

## Code Structure

> TBD
