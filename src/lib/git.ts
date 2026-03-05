import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import type { VoidHubConfig } from "../types";

// ─── Username detection ───────────────────────────────────────────────────────

export function detectGitHubUsername(): string | null {
  try {
    const login = execSync("gh api user --jq .login", { encoding: "utf-8" }).trim();
    if (login) return login;
  } catch { /* fall through */ }

  try {
    const name = execSync("git config user.name", { encoding: "utf-8" }).trim();
    if (name) return name;
  } catch { /* fall through */ }

  return null;
}

// ─── GitHub repo helpers ──────────────────────────────────────────────────────

export function ghRepoExists(username: string, repo: string): boolean {
  try {
    execSync(`gh repo view ${username}/${repo}`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

export function ghCreateRepo(
  repo: string,
  opts: { private?: boolean; cwd?: string } = {}
): void {
  const visibility = opts.private !== false ? "--private" : "--public";
  execSync(`gh repo create ${repo} ${visibility} --confirm`, {
    cwd: opts.cwd,
    stdio: "inherit",
  });
}

// ─── Voidhub backup ──────────────────────────────────────────────────────────

const VOIDHUB_REPO = "voidhub";

function run(cmd: string, cwd: string): void {
  execSync(cmd, { cwd, stdio: "inherit" });
}

function tryRun(cmd: string, cwd: string): boolean {
  try {
    execSync(cmd, { cwd, stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

function hasLocalCommits(cwd: string): boolean {
  return tryRun("git rev-parse HEAD", cwd);
}

function hasStagedChanges(cwd: string): boolean {
  // git diff-index exits non-zero when there are changes vs HEAD
  return !tryRun("git diff-index --quiet HEAD", cwd);
}

/**
 * Backs up `.voidhub/` to GitHub as `username/voidhub`.
 * Idempotent — safe to call on every sync/init.
 *
 * Strategy for first init when remote already exists (e.g. GitHub auto-README):
 *   Force push — this is a personal backup repo owned by the user.
 *   We never want GitHub's auto-generated content to win over our own.
 *
 * Strategy for subsequent syncs:
 *   Normal pull --rebase then push.
 */
export function pushVoidhub(config: VoidHubConfig): void {
  const voidhubDir = path.join(config.base, ".voidhub");
  const remoteUrl = `https://github.com/${config.username}/${VOIDHUB_REPO}.git`;

  try {
    // 1. Init git repo if not already
    if (!fs.existsSync(path.join(voidhubDir, ".git"))) {
      run("git init -b main", voidhubDir);
    }

    // 2. Ensure branch is main
    tryRun("git branch -M main", voidhubDir);

    // 3. Ensure remote exists
    const hasRemote = tryRun("git remote get-url origin", voidhubDir);
    if (!hasRemote) {
      if (!ghRepoExists(config.username, VOIDHUB_REPO)) {
        console.log(`⚡ Creating GitHub repo: ${config.username}/${VOIDHUB_REPO}`);
        ghCreateRepo(`${config.username}/${VOIDHUB_REPO}`, { cwd: voidhubDir });
      }
      run(`git remote add origin ${remoteUrl}`, voidhubDir);
    }

    // 4. Stage all changes
    run("git add .", voidhubDir);

    // 5. Commit if there are staged changes
    if (!hasLocalCommits(voidhubDir) || hasStagedChanges(voidhubDir)) {
      run(`git commit -m "chore: update voidhub"`, voidhubDir);
    } else {
      console.log("  Nothing to commit, .voidhub already up to date.");
    }

    // 6. Push — force only on first local commit to win over any remote auto-content
    //    (GitHub sometimes auto-creates a README when creating a repo)
    const isFirstPush = !tryRun("git rev-parse origin/main", voidhubDir);
    if (isFirstPush) {
      run("git push --force -u origin main", voidhubDir);
    } else {
      tryRun("git pull --rebase origin main", voidhubDir);
      run("git push -u origin main", voidhubDir);
    }

    console.log("✅ .voidhub backed up to GitHub.");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`❌ Failed to push .voidhub: ${message}`);
  }
}