import assert from "node:assert";
import child_process from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import module from "node:module";
import path from "node:path";
import process from "node:process";
import url from "node:url";

const configUrl = url.pathToFileURL(path.resolve(process.argv[2]));
const { default: configIn } = await import(configUrl.href);
const { configFile, configOut } = createConfig(configIn);

// build executable
const build = child_process.spawnSync(process.execPath, ["--build-sea", configFile], { stdio: "inherit" });
inheritChildExit(build);

// attempt signing
if (process.platform === "darwin") {
  const sign = child_process.spawnSync("codesign", ["--sign", "-", configOut.output], { stdio: "inherit" });
  inheritChildExit(sign); // macOS executables MUST be signed
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

  const outFile = path.join(path.dirname(packageJsonPath), ".sea", `sea-config-${hash}.json`);
  const outDir = path.dirname(outFile);

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(configOut, null, 2));

  return { configFile: outFile, configOut };
}

/**
 * @param {child_process.SpawnSyncReturns<*>} result
 */
function inheritChildExit(result) {
  if (result.error) {
    throw result.error;
  }
  if (result.signal) {
    process.kill(process.pid, result.signal);
  }
  if (result.status !== 0) {
    process.exitCode = result.status;
  }
}
