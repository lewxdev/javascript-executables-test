/** @see {@link https://docs.deno.com/runtime/reference/cli/compile/#supported-targets | Supported Targets | `deno compile`, standalone executables} */
const supportedTargets = new Set([
  "x86_64-pc-windows-msvc",
  "x86_64-apple-darwin",
  "aarch64-apple-darwin",
  "x86_64-unknown-linux-gnu",
  "aarch64-unknown-linux-gnu",
]);

const [target] = Deno.args;
if (target && !supportedTargets.has(target)) {
  console.error("error: unknown target");
  Deno.exit(1);
}

const command = new Deno.Command("deno", {
  args: target
    ? ["compile", "--allow-read", `--target=${target}`, "--output=dist/", "src/get-pkg.ts"]
    : ["compile", "--allow-read", "--output=dist/", "src/get-pkg.ts"],
});

const output = await command.spawn().output();
if (output.signal) {
  Deno.kill(Deno.pid, output.signal);
}
if (!output.success) {
  Deno.exitCode = output.code;
}
