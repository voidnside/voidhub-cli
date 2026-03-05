# 🌌 VoidHub CLI

A lightweight CLI to track, scaffold, and back up your projects — locally and on GitHub.

## Concept

VoidHub creates a `.voidhub/` folder in your **base directory** (wherever your projects live). This folder contains:
- `config.json` — your base path and GitHub username
- `README.md` — your auto-generated dashboard (pin this on GitHub!)

Any subdirectory anywhere under base that contains a `void.json` is recognized as an app — no required folder structure.

```
~/projects/                    ← base
  .voidhub/
    config.json
    README.md                  ← your GitHub dashboard
  my-app/
    void.json
  work/
    client-site/
      void.json
    internal-tool/
      void.json
  experiments/
    weekend-hack/
      void.json
```

---

## Installation

```bash
bun install
bun link  # makes `voidhub` available globally
```

**Requirements:** [Bun](https://bun.sh), [gh CLI](https://cli.github.com) (authenticated)

---

## Commands

### `voidhub init`
Set up VoidHub in your base folder. Run this once.

- Prompts for base folder and GitHub username (auto-detected via `gh api user`)
- Creates `.voidhub/config.json` and a starter `README.md`
- Backs up `.voidhub/` to `github.com/<you>/voidhub`

```bash
cd ~/projects
voidhub init
```

---

### `voidhub add`
Scaffold a new app anywhere under your base folder.

- Prompts for name, slug, and optional subdirectory path within base
- Creates `<location>/<slug>/void.json`
- Runs `git init` and makes an initial commit
- Optionally creates the GitHub repo and pushes

```bash
voidhub add
# App name: My New Tool
# App slug: my-new-tool
# Where inside your base folder? work/tools
# Create GitHub repo? › yes
# → created at ~/projects/work/tools/my-new-tool/
```

---

### `voidhub sync`
Rebuild the dashboard and push to GitHub.

- Recursively scans base for any `void.json` file
- Regenerates `.voidhub/README.md` with a table of all apps
- Pushes `.voidhub/` to `github.com/<you>/voidhub`

```bash
voidhub sync
```

Pin `github.com/<you>/voidhub` in your browser — it's your live project dashboard.

---

### `voidhub check`
Find drift between local apps and GitHub repos.

- Recursively scans base for `void.json` slugs
- Compares against your GitHub repos via `gh repo list`
- Reports local apps with no GitHub repo, and GitHub repos with no local `void.json`

```bash
voidhub check

# 📂 Local apps not on GitHub:
#    - My New Tool (my-new-tool)  ~/projects/work/tools/my-new-tool
#
# ☁️  GitHub repos not tracked locally:
#    - old-experiment
```

---

## App Manifest (`void.json`)

```json
{
  "name": "My App",
  "slug": "my-app",
  "repo": "https://github.com/you/my-app"
}
```

Minimal by design. Fields can be added over time — the schema is Zod-validated and forward-compatible.

---

## Running from anywhere

VoidHub walks up the directory tree to find `.voidhub/config.json`, so you can run any command from inside a project or any nested subdirectory — just like `git`.

```bash
cd ~/projects/work/tools/my-new-tool
voidhub sync   # ✅ works
```