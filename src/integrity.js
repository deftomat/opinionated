const { cyan, red, yellow } = require('chalk');
const { fail, spawnChild } = require('./utils');

const commonHelpMsg = 'Please check that all dependencies are correctly installed.';

async function checkLockIntegrity() {
  console.info(cyan('Checking yarn.lock integrity...'));

  const result = await spawnChild('yarn', ['check', '--integrity']);

  if (result.exitCode === 0) return;

  console.error(red('Lockfile integrity check failed:'));
  console.error(result.stderr);
  console.info(yellow(`Error could be caused by an outdated yarn.lock.\n${commonHelpMsg}`));
  fail();
}

async function checkDependenciesIntegrity() {
  console.info(cyan('Checking dependencies tree...'));

  const result = await spawnChild('yarn', ['check', '--verify-tree']);

  if (result.exitCode === 0) return;

  console.error(red('Dependencies integrity check failed:'));
  console.error(result.stderr);
  console.info(
    yellow(`Error could be caused by an outdated node_modules directory.\n${commonHelpMsg}`)
  );
  fail();
}

module.exports = { checkLockIntegrity, checkDependenciesIntegrity };
