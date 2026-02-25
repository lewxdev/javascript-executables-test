import process from 'node:process';

await Bun.build({
  compile: process.argv[2] ?? true,
  entrypoints: ['src/get-pkg.js'],
  outdir: 'dist/',
  minify: true
});
