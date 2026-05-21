import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type { Page } from "playwright";

const MODULE_DIR = dirname(fileURLToPath(import.meta.url));

function resolveBrowserScriptPath(name: string): string {
  const candidates = [
    join(MODULE_DIR, "browser", `${name}.js`),
    join(process.cwd(), "src/scrape/browser", `${name}.js`),
  ];
  for (const path of candidates) {
    if (existsSync(path)) return path;
  }
  throw new Error(`Browser script not found: ${name}`);
}

function loadBrowserScript(name: string): string {
  const source = readFileSync(resolveBrowserScriptPath(name), "utf8");
  const match = source.match(/function\s+(\w+)\s*\(/);
  if (!match) throw new Error(`Browser script ${name} must export a top-level function`);
  return match[1];
}

export async function runBrowserScript<T>(page: Page, name: string, arg?: number | string): Promise<T> {
  const fnName = loadBrowserScript(name);
  const script = readFileSync(resolveBrowserScriptPath(name), "utf8");
  const expression =
    arg === undefined
      ? `(() => { ${script}; return ${fnName}(); })()`
      : `(() => { ${script}; return ${fnName}(${JSON.stringify(arg)}); })()`;
  return page.evaluate(expression) as Promise<T>;
}
