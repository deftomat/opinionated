const { cyan, red, yellow } = require('chalk');
const { fail, spawnChild } = require('./utils');

async function checkLockIntegrity() {
  console.info(cyan('Checking yarn.lock integrity...'));

  const result = await spawnChild('yarn', ['check', '--integrity']);

  if (result.exitCode === 0) return;

  console.error(red('Lockfile integrity check failed:'));
  console.error(result.stderr);
  console.info(
    yellow(
      `Error could be caused by an outdated yarn.lock.\nPlease check that all dependencies are correctly installed.`
    )
  );
  fail();
}

module.exports = { checkLockIntegrity };
