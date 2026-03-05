import { readConfig } from "../lib/config";

/**
 * Prints the VoidHub dashboard URL.
 * Opening the browser is left to the user — gh browse is unreliable on WSL/headless.
 */
export async function dashboardCmd(): Promise<void> {
  const config = readConfig();
  const url = `https://github.com/${config.username}/voidhub`;
  console.log(`\n🌌 Dashboard: ${url}\n`);
}