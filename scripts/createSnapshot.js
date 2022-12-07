
const childProcess = require('child_process');
const vm = require('vm');
const path = require('path');
const fs = require('fs');
const electronLink = require('electron-link');

const excludedModules = {};

async function main() {
  const baseDirPath = path.resolve(__dirname, '..');

  const mainPath = `${baseDirPath}/imports.js`;

  console.log('Creating a linked script..');
  const result = await electronLink({
    baseDirPath: baseDirPath,
    mainPath,
    cachePath: `${baseDirPath}/cache`,
    shouldExcludeModule: (modulePath) =>
      excludedModules.hasOwnProperty(modulePath),
  });

  const snapshotScriptPath = `${baseDirPath}/cache/snapshot.js`;
  fs.writeFileSync(snapshotScriptPath, result.snapshotScript);

  // Verify if we will be able to use this in `mksnapshot`
  console.log('running in context');
  vm.runInNewContext(result.snapshotScript, undefined, {
    filename: snapshotScriptPath,
    displayErrors: true,
  });

  const outputBlobPath = path.resolve(__dirname, '../cache/');
  console.log(`Generating startup blob in "${outputBlobPath}"`);
  try {
    childProcess.execFileSync(
      path.resolve(
        __dirname,
        '..',
        'node_modules',
        '.bin',
        'mksnapshot' + (process.platform === 'win32' ? '.cmd' : '')
      ),
      [snapshotScriptPath, '--output_dir', outputBlobPath],
      { stdio: 'inherit' }
    );
  } catch {
    // actual errors go to stdio
    throw new Error('Error in mksnapshot');
  }
}

main().then(
  () => console.log('done'),
  (err) => console.error(err)
);
