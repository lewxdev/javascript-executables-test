import child_process from "node:child_process";
import console from "node:console";
import path from "node:path";
import process from "node:process";

const entrypoint = process.argv[2];
const target = process.argv[3];

if (!entrypoint) {
  console.error("usage: deno run %s <entrypoint> [target]", path.basename(import.meta.filename));
  process.exit(1);
}

child_process.execFileSync(
  "deno",
  target
    ? ["compile", "-A", "--target", target, "--output", "dist/deno/", entrypoint]
    : ["compile", "-A", "--output", "dist/deno/", entrypoint],
  { stdio: "inherit" },
);
