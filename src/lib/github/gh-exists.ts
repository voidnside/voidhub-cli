import { execSync } from "child_process";

/**
 * Check if a GitHub repo exists for the current user
 * @param username GitHub username
 * @param repo Repo name
 * @returns true if exists, false otherwise
 */
export function ghExists(
        username: string,
        repo: string
): boolean {
  try {
    execSync(`gh repo view ${username}/${repo}`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}