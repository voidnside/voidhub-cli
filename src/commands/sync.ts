import fs from "fs";
import path from "path";
import type { VoidHubConfig } from "../types";
import { readConfig } from "../lib/config";

export async function syncCmd() {
  const config: VoidHubConfig = readConfig();
  const appsDir = path.join(config.base, "apps");
  const voidhubPath = path.join(config.base, ".voidhub");
  const dashboardPath = path.join(voidhubPath, "README.md");

  const apps = fs.existsSync(appsDir)
    ? fs.readdirSync(appsDir).filter(name => fs.existsSync(path.join(appsDir, name, "void.yaml")))
    : [];

  const tableLines = ["| Name | Status | Stage | Energy | Priority |", "| ---- | ------ | ----- | ------ | -------- |"];
  apps.forEach(appName => {
    const yamlPath = path.join(appsDir, appName, "void.yaml");
    const yaml = fs.readFileSync(yamlPath, "utf-8");
    const statusMatch = yaml.match(/status:\s*(\w+)/);
    const stageMatch = yaml.match(/stage:\s*(\w+)/);
    tableLines.push(`| ${appName} | ${statusMatch?.[1] ?? ""} | ${stageMatch?.[1] ?? ""} | low | 3 |`);
  });

  const content = `# 🌌 Void Hub Dashboard

Central control for all apps.

${tableLines.join("\n")}
`;
  fs.writeFileSync(dashboardPath, content);
  console.log(`\n✅ Dashboard synced at ${dashboardPath}`);
}