import { execSync } from "child_process";

export function detectGitHubUsername(): string | null {
  try {
    const name = execSync("git config user.name", { encoding: "utf-8" }).trim();
    return name || null;
  } catch {
    return null;
  }
}