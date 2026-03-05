import fs from "fs";
import path from "path";
import * as prompts from "@clack/prompts";
import type { VoidHubConfig } from "../types";
import { readConfig } from "../lib/config";
import { execSync } from "child_process";

export async function addCmd() {
  const config = readConfig();
  const appsDir = path.join(config.base, "apps");
  fs.mkdirSync(appsDir, { recursive: true });

  const name = await prompts.text({ message: "App Name:" });
  if (typeof name !== "string") process.exit(0);

  const slug = await prompts.text({ message: "App Slug (URL-friendly):" });
  if (typeof slug !== "string") process.exit(0);

  const appPath = path.join(appsDir, slug);
  fs.mkdirSync(appPath, { recursive: true });

  // create void.yaml
  const yaml = `name: ${name}
slug: ${slug}
status: idea
stage: idea
visibility: private
type: product
stack:
  - node
energy: low
priority: 3
repo: https://github.com/${config.username}/${slug}
last_review: YYYY-MM-DD
`;
  fs.writeFileSync(path.join(appPath, "void.yaml"), yaml);

  // initialize git
  execSync("git init", { cwd: appPath, stdio: "inherit" });
  execSync(`git add .`, { cwd: appPath });
  execSync(`git commit -m "chore: initial commit"`, { cwd: appPath });

  console.log(`\n✅ App ${name} (${slug}) created locally at ${appPath}`);
  prompts.cancel();
}