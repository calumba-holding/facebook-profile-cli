#!/usr/bin/env node
import { Command } from "commander";

import { runProfileLoginCommand } from "./commands/profile-login.js";
import { runScrapeCommand } from "./commands/scrape.js";
import { resolveProfileDir } from "./config.js";

const program = new Command();

program
  .name("facebook")
  .description("Scrape Facebook profiles in a signed-in Chrome session")
  .version("0.1.0");

const sharedBrowserOptions = (cmd: Command): Command =>
  cmd
    .option(
      "--chrome-executable <path>",
      "Path to Google Chrome binary",
      process.env.FACEBOOK_CLI_CHROME_EXECUTABLE,
    )
    .option(
      "--profile-root-dir <dir>",
      "Profile root directory (uses <dir>/facebook, same as chrome-scraper)",
      process.env.FACEBOOK_CLI_PROFILE_ROOT,
    );

const profile = program.command("profile").description("Manage the persistent Facebook Chrome profile");

const profileLogin = profile
  .command("login")
  .description("Open Facebook in Chrome so you can log in once");

sharedBrowserOptions(profileLogin);
profileLogin.action(async (opts: { chromeExecutable?: string; profileRootDir?: string }) => {
  await runProfileLoginCommand(opts);
});

profile
  .command("path")
  .description("Print the resolved Facebook Chrome profile directory")
  .option("--profile-root-dir <dir>", "Profile root directory", process.env.FACEBOOK_CLI_PROFILE_ROOT)
  .action((opts: { profileRootDir?: string }) => {
    process.stdout.write(`${resolveProfileDir(opts.profileRootDir)}\n`);
  });

const scrape = program
  .command("scrape")
  .description("Scrape a Facebook profile (tabs, About, More menu) and write JSON")
  .argument("<profile-url>", "Facebook profile URL to scrape")
  .option("--output <path>", "JSON output file path (default: ./out/<username>-<timestamp>.json)")
  .option("--json", "Also print the full JSON to stdout", false)
  .option("--navigation-timeout-ms <ms>", "Navigation timeout in milliseconds", (v) => Number(v), 60_000)
  .option("--wait-after-navigation-ms <ms>", "Pause after page load before continuing", (v) => Number(v), 2_000)
  .option("--max-posts <n>", "Max timeline posts to scrape on the All tab", (v) => Number(v), 20)
  .option("--no-video", "Skip session screen recording", false);

sharedBrowserOptions(scrape);

scrape.action(
  async (
    profileUrl: string,
    opts: {
      chromeExecutable?: string;
      profileRootDir?: string;
      output?: string;
      json?: boolean;
      navigationTimeoutMs: number;
      waitAfterNavigationMs: number;
      maxPosts: number;
      noVideo?: boolean;
    },
  ) => {
    await runScrapeCommand({
      profileUrl,
      chromeExecutable: opts.chromeExecutable,
      profileRootDir: opts.profileRootDir,
      outputFile: opts.output,
      jsonStdout: opts.json,
      navigationTimeoutMs: opts.navigationTimeoutMs,
      waitAfterNavigationMs: opts.waitAfterNavigationMs,
      maxPosts: opts.maxPosts,
      recordVideo: !opts.noVideo,
    });
  },
);

program.showHelpAfterError();
program.parseAsync(process.argv).catch((err) => {
  const msg = err instanceof Error ? err.message : String(err);
  process.stderr.write(`${msg}\n`);
  process.exitCode = 1;
});
