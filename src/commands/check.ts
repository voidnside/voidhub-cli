import { execSync } from "child_process";
import { readConfig } from "../lib/config";
import { discoverApps } from "../lib/apps";

/**
 * Fetches all GitHub repo names for the authenticated user via gh CLI.
 * Returns a Set of repo names (lowercase).
 */
function fetchRemoteRepos(): Set<string> {
  try {
    const output = execSync("gh repo list --json name --limit 1000 --jq '.[].name'", {
      encoding: "utf-8",
    }).trim();

    if (!output) return new Set();

    return new Set(output.split("\n").map((name) => name.trim().toLowerCase()));
  } catch {
    throw new Error(
      "Could not fetch GitHub repos. Make sure `gh` is installed and authenticated."
    );
  }
}

export async function checkCmd(): Promise<void> {
  const config = readConfig();

  console.log("\n🔍 Checking local apps vs GitHub repos...\n");

  // Discover all apps anywhere under base
  const localApps = discoverApps(config.base);
  const localSlugs = new Set(localApps.map((a) => a.slug.toLowerCase()));

  // Fetch remote repos
  let remoteSlugs: Set<string>;
  try {
    remoteSlugs = fetchRemoteRepos();
  } catch (err) {
    console.error(`❌ ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }

  // Local apps not on GitHub
  const localOnly = localApps.filter((a) => !remoteSlugs.has(a.slug.toLowerCase()));

  // GitHub repos not tracked locally (exclude the voidhub backup repo itself)
  const remoteOnly = [...remoteSlugs].filter(
    (name) => !localSlugs.has(name) && name !== "voidhub"
  );

  // ─── Report ───────────────────────────────────────────────────────────────

  if (localOnly.length === 0 && remoteOnly.length === 0) {
    console.log("✅ Everything is in sync — no drift found.\n");
    return;
  }

  if (localOnly.length > 0) {
    console.log("📂 Local apps not on GitHub:");
    localOnly.forEach((a) => console.log(`   - ${a.manifest.name} (${a.slug})  ${a.dir}`));
    console.log();
  }

  if (remoteOnly.length > 0) {
    console.log("☁️  GitHub repos not tracked locally:");
    remoteOnly.forEach((name) => console.log(`   - ${name}`));
    console.log();
  }
}