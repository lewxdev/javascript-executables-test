import child_process from "node:child_process";

/**
 * @see {@linkcode child_process.spawnSync}
 * @param {string} command The command to run.
 * @param {string[]} args List of string arguments.
 */
export function $(command, ...args) {
  console.info("running:", command, ...args);
  const result = child_process.spawnSync(command, args, { stdio: "inherit" });

  if (result.error) {
    throw result.error;
  }
  if (result.signal) {
    process.kill(process.pid, result.signal);
  }
  if (result.status !== 0) {
    process.exitCode = result.status;
  }
}
