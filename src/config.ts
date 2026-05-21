import { homedir } from "node:os";
import { join } from "node:path";

export const DEFAULT_CHROME_EXECUTABLE =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

export const DEFAULT_PROFILE_ROOT_DIR = join(homedir(), ".scrape", "profiles");

export const DEFAULT_FACEBOOK_PROFILE_DIR = join(DEFAULT_PROFILE_ROOT_DIR, "facebook");

export const DEFAULT_NAVIGATION_TIMEOUT_MS = 60_000;

export const DEFAULT_WAIT_AFTER_NAVIGATION_MS = 2_000;

export function resolveChromeExecutable(override?: string): string {
  return override ?? process.env.FACEBOOK_CLI_CHROME_EXECUTABLE ?? DEFAULT_CHROME_EXECUTABLE;
}

export function resolveProfileDir(overrideRoot?: string): string {
  const root = overrideRoot ?? process.env.FACEBOOK_CLI_PROFILE_ROOT ?? DEFAULT_PROFILE_ROOT_DIR;
  return join(root, "facebook");
}
