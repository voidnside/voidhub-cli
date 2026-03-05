import fs from "fs";
import path from "path";
import type { VoidHubConfig } from "../../types";

export function ensureConfigDir(base: string) {
  const dir = path.join(base, ".voidhub");
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function writeConfig(config: VoidHubConfig) {
  const dir = ensureConfigDir(config.base);
  fs.writeFileSync(path.join(dir, "config.json"), JSON.stringify(config, null, 2));
}

export function readConfig(): VoidHubConfig {
  const cwd = process.cwd();
  const configPath = path.join(cwd, ".voidhub", "config.json");
  if (!fs.existsSync(configPath)) throw new Error(".voidhub/config.json not found");
  return JSON.parse(fs.readFileSync(configPath, "utf-8"));
}