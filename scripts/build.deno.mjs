import process from "node:process";
import { $ } from "./shell.mjs";

const target = process.argv[2];
const targetArgs = target ? ["--target", target] : [];

$("deno", "compile",
  "--allow-read",
  ...targetArgs,
  "--output", "dist/deno/",
  "src/get-pkg.cjs",
);
