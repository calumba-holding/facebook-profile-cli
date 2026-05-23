import type { BrowserContext } from "playwright";

import { launchSignedInChrome } from "../browser.js";
import {
  DEFAULT_NAVIGATION_TIMEOUT_MS,
  DEFAULT_WAIT_AFTER_NAVIGATION_MS,
  resolveChromeExecutable,
  resolveProfileDir,
} from "../config.js";
import {
  createScrapeArtifacts,
  finalizeSessionVideo,
  printJson,
  writeJsonOutput,
} from "../output.js";
import { scrapeFacebookProfile } from "../scrape/profile-scraper.js";
import { normalizeFacebookProfileUrl } from "../urls.js";

export type ScrapeOptions = {
  profileUrl: string;
  chromeExecutable?: string;
  profileRootDir?: string;
  navigationTimeoutMs?: number;
  waitAfterNavigationMs?: number;
  maxPosts?: number;
  outputFile?: string;
  outDir?: string;
  recordVideo?: boolean;
  jsonStdout?: boolean;
};

export async function runScrapeCommand(options: ScrapeOptions): Promise<void> {
  const profileUrl = normalizeFacebookProfileUrl(options.profileUrl);
  const profileDir = resolveProfileDir(options.profileRootDir);
  const chromeExecutable = resolveChromeExecutable(options.chromeExecutable);
  const navigationTimeoutMs = options.navigationTimeoutMs ?? DEFAULT_NAVIGATION_TIMEOUT_MS;
  const waitAfterNavigationMs = options.waitAfterNavigationMs ?? DEFAULT_WAIT_AFTER_NAVIGATION_MS;
  const recordVideo = options.recordVideo !== false;

  const artifacts = options.outputFile
    ? {
        jsonPath: options.outputFile,
        sessionVideoPath: options.outputFile.replace(/\.json$/i, ".webm"),
        videoRecordDir: options.outputFile.replace(/\.json$/i, ".playwright-video"),
      }
    : createScrapeArtifacts(profileUrl, options.outDir ?? "./out");

  let context: BrowserContext | undefined;

  try {
    process.stderr.write(`Using Chrome profile: ${profileDir}\n`);
    process.stderr.write(`Scraping profile: ${profileUrl}\n`);
    if (recordVideo) {
      process.stderr.write(`Session video will be saved to: ${artifacts.sessionVideoPath}\n`);
    }

    context = await launchSignedInChrome({
      profileDir,
      chromeExecutable,
      recordVideoDir: recordVideo ? artifacts.videoRecordDir : undefined,
    });
    const page = context.pages()[0] ?? await context.newPage();

    const result = await scrapeFacebookProfile(page, profileUrl, {
      navigationTimeoutMs,
      waitAfterNavigationMs,
      maxPosts: options.maxPosts ?? 20,
    });

    result.outputJsonPath = artifacts.jsonPath;

    await context.close();
    context = undefined;

    if (recordVideo) {
      const videoPath = await finalizeSessionVideo(
        artifacts.videoRecordDir,
        artifacts.sessionVideoPath,
      );
      if (videoPath) {
        result.sessionVideoPath = videoPath;
        process.stderr.write(`Wrote session video: ${videoPath}\n`);
      } else {
        result.errors.push("Session video recording produced no file");
        process.stderr.write("Warning: session video file was not created\n");
      }
    }

    await writeJsonOutput(artifacts.jsonPath, result);
    process.stderr.write(`Wrote JSON: ${artifacts.jsonPath}\n`);

    if (result.errors.length > 0) {
      process.stderr.write(`Completed with ${result.errors.length} warning(s):\n`);
      for (const err of result.errors) process.stderr.write(`  - ${err}\n`);
    }

    if (options.jsonStdout) {
      printJson(result);
    } else {
      const postCount = result.tabs.all?.posts?.length ?? 0;
      process.stderr.write(
        `Scraped ${Object.keys(result.tabs).length} tab(s), ${postCount} post(s), ${Object.keys(result.moreSections).length} More section(s).\n`,
      );
    }
  } finally {
    await context?.close().catch(() => undefined);
  }
}
