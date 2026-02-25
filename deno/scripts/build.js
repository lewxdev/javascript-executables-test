/**
 * `deno compile` Supported targets for standalone executables.
 * https://docs.deno.com/runtime/reference/cli/compile/#supported-targets
 * */
const supportedTargets = [
  'x86_64-pc-windows-msvc',
  'x86_64-apple-darwin',
  'aarch64-apple-darwin',
  'x86_64-unknown-linux-gnu',
  'aarch64-unknown-linux-gnu'
];

const [target] = Deno.args;
if (target && !supportedTargets.includes(target)) {
  console.error('error: unknown target');
  Deno.exit(1);
}

let targetArgument;
if (target) {
  targetArgument = '--target=' + target;
}
const args = [
  'compile',
  '--allow-read',
  targetArgument,
  '--output=dist/',
  'src/get-pkg.js'
].filter(Boolean);

const command = new Deno.Command('deno', { args });

const output = await command.spawn().output();
if (output.signal) {
  Deno.kill(Deno.pid, output.signal);
}
if (!output.success) {
  Deno.exitCode = output.code;
}
