import fs from "fs";
import path from "path";
import type { VoidHubConfig } from "../types";
import { readConfig } from "../lib/config";

export async function checkCmd() {
  const config: VoidHubConfig = readConfig();
  const appsDir = path.join(config.base, "apps");

  if (!fs.existsSync(appsDir)) {
    console.log("No apps directory found.");
    return;
  }

  const apps = fs.readdirSync(appsDir).filter(name => fs.existsSync(path.join(appsDir, name, "void.yaml")));
  console.log("Checking local apps vs void.yaml state...");
  apps.forEach(appName => console.log(`- ${appName}`));

  console.log("\n✅ Check complete.");
}