import child_process from "node:child_process";
import console from "node:console";
import path from "node:path";
import process from "node:process";

const entrypoint = process.argv[2];
const target = process.argv[3];

if (!entrypoint) {
  console.error("usage: bun run %s <entrypoint> [target]", path.basename(import.meta.filename));
  process.exit(1);
}

const filename = path.basename(entrypoint, path.extname(entrypoint));
const outfile = `dist/bun/${filename}`;

child_process.execFileSync(
  "bun",
  target
    ? ["build", "--compile", "--target", target, "--outfile", outfile, entrypoint]
    : ["build", "--compile", "--outfile", outfile, entrypoint],
  { stdio: "inherit" },
);
