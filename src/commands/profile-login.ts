import { createInterface } from "node:readline/promises";
import { stdin as input } from "node:process";

import type { BrowserContext } from "playwright";

import { launchSignedInChrome } from "../browser.js";
import { resolveChromeExecutable, resolveProfileDir } from "../config.js";

const FACEBOOK_HOME = "https://www.facebook.com/";

export type ProfileLoginOptions = {
  chromeExecutable?: string;
  profileRootDir?: string;
};

export async function runProfileLoginCommand(options: ProfileLoginOptions): Promise<void> {
  const profileDir = resolveProfileDir(options.profileRootDir);
  const chromeExecutable = resolveChromeExecutable(options.chromeExecutable);

  let context: BrowserContext | undefined;

  try {
    process.stderr.write(`Opening Chrome profile at ${profileDir}\n`);
    process.stderr.write(`Log into Facebook, then press Enter here when ready.\n`);

    context = await launchSignedInChrome({ profileDir, chromeExecutable });
    const page = context.pages()[0] ?? await context.newPage();
    await page.goto(FACEBOOK_HOME, { waitUntil: "domcontentloaded", timeout: 60_000 });

    const rl = createInterface({ input, output: process.stderr });
    await rl.question("Press Enter after login is complete... ");
    rl.close();

    process.stderr.write(`Profile ready at ${profileDir}\n`);
  } finally {
    await context?.close().catch(() => undefined);
  }
}
