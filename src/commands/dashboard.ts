import { execSync } from "child_process";
import { readConfig } from "../lib/config";

/**
 * Opens the VoidHub dashboard README on GitHub in the browser.
 * Uses `gh browse` which is already a hard dependency.
 */
export async function dashboardCmd(): Promise<void> {
  const config = readConfig();
  const url = `https://github.com/${config.username}/voidhub`;

  console.log(`\n🌌 Opening dashboard: ${url}\n`);

  execSync(`gh browse --repo ${config.username}/voidhub`, { stdio: "inherit" });
}