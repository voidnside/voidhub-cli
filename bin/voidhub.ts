#!/usr/bin/env bun
import { initCmd } from "../src/commands/init";
import { addCmd } from "../src/commands/add";
import { syncCmd } from "../src/commands/sync";
import { checkCmd } from "../src/commands/check";

const cmd = process.argv[2];

switch (cmd) {
  case "init":
    await initCmd();
    break;
  case "add":
    await addCmd();
    break;
  case "sync":
    await syncCmd();
    break;
  case "check":
    await checkCmd();
    break;
  default:
    console.log("VoidHub CLI commands: init, add, sync, check");
}