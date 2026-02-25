/** @type {import("../scripts/build.mjs").Config} */
export default {
  main: "./src/get-pkg.js",
  output: "./dist/get-pkg",
  disableExperimentalSEAWarning: true,
  useCodeCache: true, // the drawbacks of cache are os-dependent, building with CI mitigates this
  execArgv: ["--no-warnings"],
};
