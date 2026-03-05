import fs from "fs";
import path from "path";
import * as prompts from "@clack/prompts";
import type { VoidHubConfig } from "../types";
import { writeConfig } from "../lib/config";
import { detectGitHubUsername } from "../lib/git/detect-git-username";
import { pushVoidhub } from "../lib/github/push-voidhub";

export async function initCmd() {
  const cwd = process.cwd();
  console.log(`\n🌌 Initializing VoidHub at base folder: ${cwd}\n`);

  // 1️⃣ Base folder
  const baseInput = await prompts.text({ message: "Base folder for apps?", initialValue: cwd });
  if (typeof baseInput !== "string") process.exit(0);
  const base = baseInput;

  // 2️⃣ Detect GitHub username
  const detectedUsername = detectGitHubUsername() ?? "";
  let username: string;

  if (detectedUsername) {
    const useDetected = await prompts.confirm({
      message: `Detected GitHub username "${detectedUsername}". Use this?`,
      initialValue: true,
    });
    if (typeof useDetected !== "boolean") process.exit(0);

    if (useDetected) username = detectedUsername;
    else {
      const inputUsername = await prompts.text({ message: "Enter GitHub username:" });
      if (typeof inputUsername !== "string") process.exit(0);
      username = inputUsername;
    }
  } else {
    const inputUsername = await prompts.text({ message: "Enter GitHub username:" });
    if (typeof inputUsername !== "string") process.exit(0);
    username = inputUsername;
  }

  // 3️⃣ Create .voidhub folder
  const voidhubPath = path.join(base, ".voidhub");
  fs.mkdirSync(voidhubPath, { recursive: true });

  // 4️⃣ Write local config.json
  const config: VoidHubConfig = { base, username };
  writeConfig(config);

  // 5️⃣ Generate dashboard README if missing
  const dashboardPath = path.join(voidhubPath, "README.md");
  if (!fs.existsSync(dashboardPath)) {
    const template = `# 🌌 Void Hub Dashboard

Central control for all apps.

| Name | Status | Stage | Energy | Priority |
| ---- | ------ | ----- | ------ | -------- |
<!-- Generated automatically via sync.ts -->
`;
    fs.writeFileSync(dashboardPath, template);
  }

  // 6️⃣ Show config
  console.log(`\n📝 Current .voidhub/config.json:\n${fs.readFileSync(path.join(voidhubPath, "config.json"), "utf-8")}\n`);

  // 7️⃣ Auto push backup
  pushVoidhub(config);

  // 8️⃣ Final log
  console.log(`\n✅ VoidHub initialized!`);
  console.log(`Base folder: ${base}`);
  console.log(`GitHub username: ${username}`);
  console.log(`Dashboard path: ${dashboardPath}`);

  prompts.cancel();
}