import console from 'node:console';
import path from 'node:path';

async function getPackageJson (currentDirectory) {
  currentDirectory = currentDirectory || process.cwd();
  const file = Bun.file(path.join(currentDirectory, 'package.json'));
  if (await file.exists()) {
    return file;
  }
  const parentDirectory = path.dirname(currentDirectory);
  if (parentDirectory === currentDirectory) {
    return null;
  }
  return getPackageJson(parentDirectory);
}

const packageJson = await getPackageJson();
if (!packageJson) {
  console.error('error: cannot find package.json');
  process.exit(1);
}

const packageJsonContents = await packageJson.text();
console.log(packageJsonContents);
