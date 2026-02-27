import console from "node:console";
import path from "node:path";
import process from "node:process";
import { promises as timers } from "node:timers";
import util from "node:util";
import ora from "ora";
import { fetch } from "undici";

const { positionals: [url], values: options } = util.parseArgs({
  allowPositionals: true,
  options: {
    delay: {
      type: "string",
      short: "d",
    },
  },
});

if (!url || !URL.canParse(url) || options.delay && !/\d+/.test(options.delay)) {
  console.error("usage: %s [-d, --delay int] <url>", path.basename(import.meta.filename));
  process.exit(1);
}

const spinner = ora(`GET ${url}`).start();
const text = await fetch(url).then((response) => response.text());

if (options.delay) {
  await timers.scheduler.wait(Number.parseInt(options.delay));
}

spinner.stop();
console.log(text);
