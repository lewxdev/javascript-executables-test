import process from "node:process";
import { $ } from "./shell.mjs";

const target = process.argv[2];
const targetArgs = target ? ["--target", target] : [];

$("bun", "build",
  "--compile",
  ...targetArgs,
  "--outfile", "dist/bun/get-pkg",
  "--minify",
  "--sourcemap",
  "--bytecode",
  "src/get-pkg.cjs",
);
