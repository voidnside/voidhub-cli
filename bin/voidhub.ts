#!/usr/bin/env bun
import { initCmd } from "../src/commands/init";
import { addCmd } from "../src/commands/add";
import { syncCmd } from "../src/commands/sync";
import { checkCmd } from "../src/commands/check";
import { dashboardCmd } from "../src/commands/dashboard";

const USAGE = `
🌌 VoidHub CLI

Usage: voidhub <command>

Commands:
  init       Set up VoidHub in a base folder and back it up to GitHub
  add        Scaffold a new app and optionally create its GitHub repo
  sync       Rebuild the dashboard README and push .voidhub to GitHub
  check      Compare local apps vs GitHub repos and report any drift
  dashboard  Open the VoidHub dashboard on GitHub in your browser
`.trim();

const cmd = process.argv[2];

async function main(): Promise<void> {
  switch (cmd) {
    case "init":      return initCmd();
    case "add":       return addCmd();
    case "sync":      return syncCmd();
    case "check":     return checkCmd();
    case "dashboard": return dashboardCmd();
    default:
      console.log(USAGE);
      if (cmd) {
        console.error(`\nUnknown command: "${cmd}"`);
        process.exit(1);
      }
  }
}

main().catch((err) => {
  console.error(`\n❌ ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});