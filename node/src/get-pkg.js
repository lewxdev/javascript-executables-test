const console = require('node:console');
const fs = require('node:fs');
const path = require('node:path');
const process = require('node:process');

function getPackageJsonPath (currentDirectory) {
  currentDirectory = currentDirectory || process.cwd();

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
  process.exit(1);
}

const packageJsonContents = fs.readFileSync(packageJsonPath, 'utf8');
console.log(packageJsonContents);
