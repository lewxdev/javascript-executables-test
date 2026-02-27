import child_process from "node:child_process";
import console from "node:console";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import esbuild from "esbuild";

const entrypoint = process.argv[2];

if (!entrypoint) {
  console.error("usage: node %s <entrypoint>", path.basename(import.meta.filename));
  process.exit(1);
}

const filename = path.basename(entrypoint, path.extname(entrypoint));
const builtEntrypoint = `dist/node/${filename}.js`;
const builtExecutable = process.platform === "win32"
  ? `dist/node/${filename}.exe`
  : `dist/node/${filename}`;

const build = esbuild.buildSync({
  entryPoints: [entrypoint],
  outfile: builtEntrypoint,
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node25",
  banner: {
    js: `import { createRequire as createRequireFromModule } from "node:module";
const require = createRequireFromModule(import.meta.url);`,
  },
});

if (build.errors.length) {
  for (const error of build.errors) {
    console.error("error:", error.text);
  }
  process.exit(1);
}

/** @type {Config} */
const config = {
  main: path.resolve(builtEntrypoint),
  mainFormat: "module",
  output: path.resolve(builtExecutable),
  disableExperimentalSEAWarning: true,
  execArgv: ["--no-warnings"],
}

const configHash = crypto
  .createHash("shake256", { outputLength: 6 })
  .update(`${config.main}\n${config.output}`)
  .digest("hex");

const configPath = path.join("dist", "node", `sea-config-${configHash}.json`);

fs.mkdirSync(path.dirname(configPath), { recursive: true });
fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

// build executable
child_process.execFileSync("node", ["--build-sea", configPath], { stdio: "inherit" });

// sign macOS executable
if (process.platform === "darwin") {
  child_process.execFileSync("codesign", ["--sign", "-", config.output], { stdio: "inherit" });
}

/**
 * see: {@link https://nodejs.org/docs/v25.7.0/api/single-executable-applications.html#generating-single-executable-applications-with---build-sea | Generating single executable applications with `--build-sea`}
 * @typedef {object} Config
 * @property {string} main (example: `"/path/to/bundled/script.js"`)
 * @property {string} [mainFormat="commonjs"] (default: `"commonjs"`, options: `"commonjs"`, `"module"`)
 * @property {string} [executable] If not specified, uses the current Node.js binary (example: `"/path/to/node/binary"`)
 * @property {string} output (example: `"/path/to/write/the/generated/executable"`)
 * @property {boolean} [disableExperimentalSEAWarning=false] (default: `false`)
 * @property {boolean} [useSnapshot=false] (default: `false`)
 * @property {boolean} [useCodeCache=false] (default: `false`)
 * @property {string[]} [execArgv]
 * @property {string} [execArgvExtension="env"] (default: `"env"`, options: `"none"`, `"env"`, `"cli"`)
 * @property {Object.<string, string>} [assets]
 */
