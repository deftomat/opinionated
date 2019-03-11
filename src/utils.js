const fs = require('fs');
const rimraf = require('rimraf');
const { spawn } = require('child_process');
const { cachePath } = require('./paths');

function spawnChild(command, args, options) {
  return new Promise((resolve, reject) => {
    let stdout = '';
    let stderr = '';

    const child = spawn(command, args, options);

    child.on('error', err => {
      reject(`Failed to spawn the process:\n\n${err}`);
    });

    if (child.stdout) {
      child.stdout.on('data', data => (stdout += data));
    }

    if (child.stderr) {
      child.stderr.on('data', data => (stderr += data));
    }

    child.on('close', exitCode => {
      resolve({ stdout, stderr, exitCode });
    });
  });
}

function clearCache() {
  if (fs.existsSync(cachePath)) rimraf.sync(cachePath);
  fs.mkdirSync(cachePath);
}

function fail() {
  process.exit(1);
}

module.exports = { clearCache, fail, spawnChild };
