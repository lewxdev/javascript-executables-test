const console = require("node:console");
const fs = require("node:fs");
const module_ = require("node:module");
const path = require("node:path");
const process = require("node:process");
const url = require("node:url");

const packageJsonPath = module_.findPackageJSON(url.pathToFileURL(process.cwd() + path.sep));
if (!packageJsonPath) {
  console.error("error: cannot find package.json");
  process.exit(1);
}

const packageJsonContents = fs.readFileSync(packageJsonPath, "utf8");
console.log(packageJsonContents);
