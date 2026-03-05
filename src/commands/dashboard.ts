import { execSync } from "child_process";
import { readConfig } from "../lib/config";

/**
 * Opens the VoidHub dashboard README on GitHub in the browser.
 * URL: https://github.com/<username>/voidhub
 */
export async function dashboardCmd(): Promise<void> {
  const config = readConfig();
  const url = `https://github.com/${config.username}/voidhub`;

  console.log(`\n🌌 Opening dashboard: ${url}\n`);

  try {
    execSync(`gh browse --repo ${config.username}/voidhub`, { stdio: "inherit" });
  } catch {
    // gh browse not available — fall back to xdg-open / open
    const opener = process.platform === "darwin" ? "open" : "xdg-open";
    execSync(`${opener} ${url}`, { stdio: "inherit" });
  }
}