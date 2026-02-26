import assert from "node:assert";
import crypto from "node:crypto";
import fs from "node:fs";
import module from "node:module";
import path from "node:path";
import process from "node:process";
import { $ } from "./shell.mjs";

const { configFile, configOut } = createConfig({
  main: "./src/get-pkg.cjs",
  output: "./dist/node/get-pkg",
  disableExperimentalSEAWarning: true,
  useCodeCache: true, // the drawbacks of cache are os-dependent, building with CI mitigates this
  execArgv: ["--no-warnings"],
});

// build executable
$("node", "--build-sea", configFile);

// sign macOS executables
if (process.platform === "darwin") {
  $("codesign", "--sign", "-", configOut.output);
}

/**
 * see: {@link https://nodejs.org/docs/v25.6.1/api/single-executable-applications.html#generating-single-executable-applications-with---build-sea | Generating single executable applications with `--build-sea`}
 * @typedef {object} Config
 * @property {string} main (example: `"/path/to/bundled/script.js"`)
 * @property {string} [executable] If not specified, uses the current Node.js binary (example: `"/path/to/node/binary"`)
 * @property {string} output (example: `"/path/to/write/the/generated/executable"`)
 * @property {boolean} [disableExperimentalSEAWarning=false] (default: `false`)
 * @property {boolean} [useSnapshot=false] (default: `false`)
 * @property {boolean} [useCodeCache=false] (default: `false`)
 * @property {string[]} [execArgv]
 * @property {string} [execArgvExtension="env"] (default: `"env"`, options: `"none"`, `"env"`, `"cli"`)
 * @property {Object.<string, string>} [assets]
 */

/**
 * @param {Config} configIn
 * @returns {{ configFile: string, configOut: Config }}
 */
function createConfig(configIn) {
  /**
   * Config with better defaults.
   * Also acts to minimally validate required properties, delegating proper validation to `--build-sea`
   * @type {Config}
   */
  const configOut = {
    ...configIn,
    main: configIn.main,
    executable: configIn.executable ?? process.execPath, // supports building locally with nvm
    output: process.platform === "win32" && !configIn.output.endsWith(".exe")
      ? configIn.output + ".exe"
      : configIn.output,
  }

  // build directory is adjacent to the nearest package.json
  const packageJsonPath = module.findPackageJSON(".", import.meta.url);
  assert(packageJsonPath, "cannot resolve package.json path");

  const hash = crypto
    .createHash("shake256", { outputLength: 6 })
    .update(`${configOut.main}\n${configOut.output}`)
    .digest("hex");

  const outFile = path.join(path.dirname(packageJsonPath), "dist", "node", `sea-config-${hash}.json`);
  const outDir = path.dirname(outFile);

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(configOut, null, 2));

  return { configFile: outFile, configOut };
}
