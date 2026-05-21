import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import { extractUsernameFromUrl, slugifyKey } from "./scrape/text.js";

export function defaultOutputPath(profileUrl: string, outDir = "./out"): string {
  const username = extractUsernameFromUrl(profileUrl) ?? "profile";
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  return join(outDir, `${slugifyKey(username)}-${stamp}.json`);
}

export async function writeJsonOutput(filePath: string, data: unknown): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export function printJson(data: unknown): void {
  process.stdout.write(`${JSON.stringify(data, null, 2)}\n`);
}
