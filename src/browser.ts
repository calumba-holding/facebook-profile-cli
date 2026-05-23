import { mkdir } from "node:fs/promises";

import { chromium, type BrowserContext } from "playwright";

export type LaunchSignedInChromeOptions = {
  profileDir: string;
  chromeExecutable: string;
  recordVideoDir?: string;
};

const closeExtraBlankPages = async (context: BrowserContext): Promise<void> => {
  await Promise.all(
    context.pages()
      .filter((page) => page.url() === "about:blank")
      .map(async (page) => page.close().catch(() => undefined)),
  );
};

export async function launchSignedInChrome(
  options: LaunchSignedInChromeOptions,
): Promise<BrowserContext> {
  await mkdir(options.profileDir, { recursive: true });

  if (options.recordVideoDir) {
    await mkdir(options.recordVideoDir, { recursive: true });
  }

  const context = await chromium.launchPersistentContext(options.profileDir, {
    executablePath: options.chromeExecutable,
    headless: false,
    viewport: { width: 1366, height: 768 },
    ...(options.recordVideoDir
      ? {
          recordVideo: {
            dir: options.recordVideoDir,
            size: { width: 1366, height: 768 },
          },
        }
      : {}),
  });

  await closeExtraBlankPages(context);
  return context;
}
