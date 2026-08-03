import assert from "node:assert/strict";
import { homedir } from "node:os";
import { isAbsolute, join, relative, sep } from "node:path";
import { afterEach, describe, it } from "node:test";

import { resolveOutputDir } from "../src/config.js";
import { createScrapeArtifacts, resolveScrapeArtifacts } from "../src/output.js";

const OUTPUT_ENV = "FACEBOOK_CLI_OUTPUT_DIR";
const originalOutputDir = process.env[OUTPUT_ENV];

afterEach(() => {
  if (originalOutputDir === undefined) {
    delete process.env[OUTPUT_ENV];
  } else {
    process.env[OUTPUT_ENV] = originalOutputDir;
  }
});

describe("capture output paths", () => {
  it("resolves the default below the runtime home directory", () => {
    delete process.env[OUTPUT_ENV];

    assert.equal(
      resolveOutputDir(),
      join(homedir(), ".exxpress-cli", "evidence", "facebook-profile-cli", "captures"),
    );
  });

  it("keeps explicit file and configured directory overrides ahead of the environment", () => {
    process.env[OUTPUT_ENV] = "/environment/captures";
    const explicitFile = "/explicit/profile.json";

    assert.equal(
      resolveScrapeArtifacts("https://www.facebook.com/example", explicitFile, "/configured").jsonPath,
      explicitFile,
    );
    assert.match(
      createScrapeArtifacts("https://www.facebook.com/example", "/configured").jsonPath,
      /^\/configured\/example-/,
    );
    assert.match(
      createScrapeArtifacts("https://www.facebook.com/example").jsonPath,
      /^\/environment\/captures\/example-/,
    );
  });

  it("keeps the default location outside the repository", () => {
    process.env[OUTPUT_ENV] = "";
    const repositoryRoot = process.cwd();
    const pathFromRepository = relative(repositoryRoot, resolveOutputDir());
    const isInsideRepository =
      pathFromRepository !== "" &&
      pathFromRepository !== ".." &&
      !pathFromRepository.startsWith(`..${sep}`) &&
      !isAbsolute(pathFromRepository);

    assert.equal(isInsideRepository, false);
  });
});
