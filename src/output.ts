import { existsSync } from "node:fs";
import { mkdir, readdir, rename, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import { resolveOutputDir } from "./config.js";
import { extractUsernameFromUrl, slugifyKey } from "./scrape/text.js";

export type ScrapeArtifacts = {
  jsonPath: string;
  sessionVideoPath: string;
  videoRecordDir: string;
};

export function createScrapeArtifacts(profileUrl: string, configuredDir?: string): ScrapeArtifacts {
  const outDir = resolveOutputDir(configuredDir);
  const username = extractUsernameFromUrl(profileUrl) ?? "profile";
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const base = `${slugifyKey(username)}-${stamp}`;
  return {
    jsonPath: join(outDir, `${base}.json`),
    sessionVideoPath: join(outDir, `${base}.webm`),
    videoRecordDir: join(outDir, `.playwright-video-${base}`),
  };
}

export function resolveScrapeArtifacts(
  profileUrl: string,
  outputFile?: string,
  configuredDir?: string,
): ScrapeArtifacts {
  if (!outputFile) return createScrapeArtifacts(profileUrl, configuredDir);

  return {
    jsonPath: outputFile,
    sessionVideoPath: outputFile.replace(/\.json$/i, ".webm"),
    videoRecordDir: outputFile.replace(/\.json$/i, ".playwright-video"),
  };
}

/** @deprecated Use createScrapeArtifacts */
export function defaultOutputPath(profileUrl: string, configuredDir?: string): string {
  return createScrapeArtifacts(profileUrl, configuredDir).jsonPath;
}

export async function finalizeSessionVideo(
  videoRecordDir: string,
  targetPath: string,
): Promise<string | undefined> {
  if (!existsSync(videoRecordDir)) return undefined;

  const entries = await readdir(videoRecordDir, { withFileTypes: true });
  const webmFile = entries.find((e) => e.isFile() && e.name.endsWith(".webm"));
  if (!webmFile) return undefined;

  await mkdir(dirname(targetPath), { recursive: true });
  const sourcePath = join(videoRecordDir, webmFile.name);
  await rename(sourcePath, targetPath);
  await rm(videoRecordDir, { recursive: true, force: true }).catch(() => undefined);

  return targetPath;
}

export async function writeJsonOutput(filePath: string, data: unknown): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export function printJson(data: unknown): void {
  process.stdout.write(`${JSON.stringify(data, null, 2)}\n`);
}
