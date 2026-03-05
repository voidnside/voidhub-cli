import fs from "fs";
import path from "path";
import { VoidHubConfigSchema, type VoidHubConfig } from "../types";

const CONFIG_DIR = ".voidhub";
const CONFIG_FILE = "config.json";

// ─── Internals ────────────────────────────────────────────────────────────────

/**
 * Walks up from `startDir` until it finds a `.voidhub/config.json`.
 * Returns the resolved path, or null if none found up to fs root.
 */
function findConfigPath(startDir: string): string | null {
  let current = path.resolve(startDir);

  while (true) {
    const candidate = path.join(current, CONFIG_DIR, CONFIG_FILE);
    if (fs.existsSync(candidate)) return candidate;

    const parent = path.dirname(current);
    if (parent === current) return null; // reached fs root
    current = parent;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function readConfig(fromDir: string = process.cwd()): VoidHubConfig {
  const configPath = findConfigPath(fromDir);

  if (!configPath) {
    throw new Error(
      `No .voidhub/config.json found in "${fromDir}" or any parent directory.\n` +
        `Run "voidhub init" in your base folder first.`
    );
  }

  const raw: unknown = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  const result = VoidHubConfigSchema.safeParse(raw);

  if (!result.success) {
    throw new Error(`Invalid config at ${configPath}:\n${result.error.toString()}`);
  }

  return result.data;
}

export function writeConfig(config: VoidHubConfig): void {
  const dir = path.join(config.base, CONFIG_DIR);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, CONFIG_FILE), JSON.stringify(config, null, 2));
}

export function getVoidhubDir(base: string): string {
  return path.join(base, CONFIG_DIR);
}