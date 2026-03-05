import { execSync } from "child_process";
import path from "path";
import fs from "fs";
import type { VoidHubConfig } from "../../types";
import { ghExists } from "./gh-exists";

/**
 * Pushes .voidhub folder to GitHub safely.
 * Handles local/remote repos, branch mismatch, and empty commits.
 */
export function pushVoidhub(config: VoidHubConfig) {
  const voidhubPath = path.join(config.base, ".voidhub");
  const remoteUrl = `https://github.com/${config.username}/voidhub.git`;

  try {
    // 1️⃣ Initialize git if missing, always set branch main
    if (!fs.existsSync(path.join(voidhubPath, ".git"))) {
      console.log("⚡ Initializing git inside .voidhub...");
      execSync("git init -b main", { cwd: voidhubPath, stdio: "inherit" });
    }

    // 2️⃣ Ensure branch is main
    try {
      execSync("git branch -M main", { cwd: voidhubPath });
    } catch { }

    // 3️⃣ Add remote if missing
    try {
      execSync("git remote get-url origin", { cwd: voidhubPath, stdio: "ignore" });
    } catch {
      if (!ghExists(config.username, "voidhub")) {
        console.log(`⚡ Creating GitHub repo: ${config.username}/voidhub`);
        execSync(`gh repo create ${config.username}/voidhub --private -y`, {
          cwd: voidhubPath,
          stdio: "inherit",
        });
      }
      execSync(`git remote add origin ${remoteUrl}`, { cwd: voidhubPath });
    }

    // 4️⃣ Stage all changes
    execSync("git add .", { cwd: voidhubPath, stdio: "inherit" });

    // 5️⃣ Commit only if there are changes
    try {
      execSync("git diff-index --quiet HEAD || git commit -m \"chore: update .voidhub\"", {
        cwd: voidhubPath,
        stdio: "inherit",
      });
    } catch (e: any) {
      console.log("⚡ Nothing to commit, .voidhub already up to date.");
    }

    // 6️⃣ Pull first from remote to avoid conflicts
    try {
      execSync("git pull --rebase origin main", { cwd: voidhubPath, stdio: "inherit" });
    } catch (e: any) {
      console.warn("⚠️ Pull failed or remote empty, continuing:", e.message);
    }

    // 7️⃣ Push changes
    try {
      execSync("git push -u origin main", { cwd: voidhubPath, stdio: "inherit" });
      console.log("✅ .voidhub fully backed up to GitHub!");
    } catch (e: any) {
      console.warn(
        "⚠️ Push failed. You may need to resolve conflicts manually:",
        e.message
      );
    }
  } catch (e) {
    console.error("❌ Failed to backup .voidhub:", e);
  }
}