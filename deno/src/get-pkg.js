import * as fs from '@std/fs';
import * as path from '@std/path';

function getPackageJsonPath (currentDirectory) {
  currentDirectory = currentDirectory || Deno.cwd();

  const candidatePath = path.join(currentDirectory, 'package.json');
  if (fs.existsSync(candidatePath)) {
    return candidatePath;
  }

  const parentDirectory = path.dirname(currentDirectory);
  if (parentDirectory === currentDirectory) {
    return null;
  }

  return getPackageJsonPath(parentDirectory);
}

const packageJsonPath = getPackageJsonPath();

if (!packageJsonPath) {
  console.error('error: cannot find package.json');
  Deno.exit(1);
}

const packageJsonContents = Deno.readTextFileSync(packageJsonPath);
console.log(packageJsonContents);
