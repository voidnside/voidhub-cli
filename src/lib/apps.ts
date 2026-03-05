import fs from "fs";
import path from "path";
import { AppManifestSchema, type DiscoveredApp } from "../types";

const MANIFEST_FILE = "void.json";
const EXCLUDED_DIRS = new Set([".voidhub"]);

// ─── Internals ────────────────────────────────────────────────────────────────

function readManifest(dir: string): DiscoveredApp["manifest"] | null {
  const manifestPath = path.join(dir, MANIFEST_FILE);
  if (!fs.existsSync(manifestPath)) return null;

  let raw: unknown;
  try {
    raw = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  } catch {
    return null; // malformed JSON — skip silently
  }

  const result = AppManifestSchema.safeParse(raw);
  if (!result.success) return null;

  return result.data;
}

/**
 * Recursively walks `dir`, collecting every subdirectory that contains
 * a valid void.json. Skips `.voidhub/` at any level of the tree.
 *
 * An app directory stops further descent — nested apps are not supported.
 */
function walk(dir: string, results: DiscoveredApp[]): void {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return; // unreadable directory — skip
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (EXCLUDED_DIRS.has(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);
    const manifest = readManifest(fullPath);

    if (manifest) {
      results.push({ slug: manifest.slug, manifest, dir: fullPath });
    } else {
      walk(fullPath, results);
    }
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Discovers all apps under `baseDir` by recursively scanning for void.json.
 */
export function discoverApps(baseDir: string): DiscoveredApp[] {
  const results: DiscoveredApp[] = [];
  walk(baseDir, results);
  return results;
}

/**
 * Writes a void.json manifest to a directory.
 */
export function writeManifest(dir: string, manifest: DiscoveredApp["manifest"]): void {
  fs.writeFileSync(path.join(dir, MANIFEST_FILE), JSON.stringify(manifest, null, 2));
}