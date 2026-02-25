import process from "node:process";

await Bun.build({
  compile: (process.argv[2] as Bun.Build.CompileTarget | undefined) ?? true,
  entrypoints: ["src/get-pkg.ts"],
  outdir: "dist/",
  minify: true,
});
