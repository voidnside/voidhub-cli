import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import * as p from "@clack/prompts";
import { readConfig } from "../lib/config";
import { writeManifest } from "../lib/apps";
import { ghRepoExists, ghCreateRepo } from "../lib/git";
import type { AppManifest } from "../types";

export async function addCmd(): Promise<void> {
  const config = readConfig();

  // 1. Prompt for name and slug
  const name = await p.text({
    message: "App name:",
    validate: (v) => (v?.trim() ? undefined : "Name cannot be empty"),
  });
  if (p.isCancel(name)) return p.cancel("Cancelled.");

  const slug = await p.text({
    message: "App slug (URL-friendly, e.g. my-app):",
    validate: (v) => {
      if (!v?.trim()) return "Slug cannot be empty";
      if (!/^[a-z0-9-]+$/.test(v)) return "Slug must be lowercase alphanumeric with dashes only";
    },
  });
  if (p.isCancel(slug)) return p.cancel("Cancelled.");

  // 2. Prompt for location within base (optional subdirectory)
  const location = await p.text({
    message: "Where inside your base folder? (relative path, or Enter for root)",
    initialValue: "",
    placeholder: "e.g. work/tools — leave empty to place directly in base",
  });
  if (p.isCancel(location)) return p.cancel("Cancelled.");

  const parentDir = (location as string).trim()
    ? path.join(config.base, location as string)
    : config.base;
  const appDir = path.join(parentDir, slug as string);

  if (fs.existsSync(appDir)) {
    console.error(`❌ "${appDir}" already exists.`);
    process.exit(1);
  }

  // 3. Create local directory and void.json
  fs.mkdirSync(appDir, { recursive: true });

  const manifest: AppManifest = {
    name: name as string,
    slug: slug as string,
    repo: `https://github.com/${config.username}/${slug}`,
  };
  writeManifest(appDir, manifest);

  // 4. Git init and initial commit
  execSync("git init -b main", { cwd: appDir, stdio: "inherit" });
  execSync("git add .", { cwd: appDir, stdio: "inherit" });
  execSync(`git commit -m "chore: initial commit"`, { cwd: appDir, stdio: "inherit" });

  console.log(`\n✅ App "${name}" created at ${appDir}`);

  // 5. Optionally create GitHub repo
  const createRemote = await p.confirm({
    message: `Create GitHub repo "${config.username}/${slug}" now?`,
    initialValue: true,
  });
  if (p.isCancel(createRemote)) return p.cancel("Cancelled.");

  if (createRemote) {
    if (ghRepoExists(config.username, slug as string)) {
      console.log(`  ℹ️  Repo ${config.username}/${slug} already exists on GitHub, skipping creation.`);
    } else {
      console.log(`⚡ Creating GitHub repo: ${config.username}/${slug}`);
      ghCreateRepo(`${config.username}/${slug}`, { cwd: appDir });
    }

    execSync(`git remote add origin https://github.com/${config.username}/${slug}.git`, {
      cwd: appDir,
      stdio: "inherit",
    });
    execSync("git push -u origin main", { cwd: appDir, stdio: "inherit" });
    console.log(`✅ Pushed to GitHub: https://github.com/${config.username}/${slug}`);
  }
}