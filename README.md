# 🌌 VoidHub CLI

VoidHub CLI is a lightweight tool for managing your personal projects and apps in a structured, GitHub-backed workspace.

## Features

* **Local-first SSOT**: All configuration and dashboard data are stored locally in `.voidhub`.
* **Dashboard generation**: Automatic creation and sync of a central dashboard (`README.md`).
* **App management**: Detect apps with `void.yaml` and track their status, stage, and metadata.
* **GitHub integration**: Optional push of `.voidhub` for backup.
* **Command-line workflow**: Simple and consistent commands for initialization, app addition, sync, and state checks.

## Installation

```bash
bun add -g voidhub-cli
```

## CLI Commands

### init

Initialize VoidHub in the current directory. Prompts for base folder and GitHub username.

```bash
voidhub init
```

### add

Add a new app locally and optionally on GitHub.

```bash
voidhub add
```

### sync

Scan apps and update the local dashboard (`.voidhub/README.md`).

```bash
voidhub sync
```

### check

Check for differences between local apps and their GitHub state.

```bash
voidhub check
```

## void.yaml (per app)

Each app must contain a `void.yaml` file as its source of truth:

```yaml
name: <app-name>
slug: <app-slug>
status: idea
stage: idea
visibility: private
type: product
stack:
  - node
energy: low
priority: 3
repo: https://github.com/<username>/<app-name>
last_review: YYYY-MM-DD
```

---

## Contributing

1. Fork the repository.
2. Make changes to the CLI or scripts.
3. Submit a pull request.

---

## License

MIT License
