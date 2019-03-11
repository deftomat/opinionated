const { cyan } = require('chalk');
const { projectPath } = require('./paths');
const { fail, spawnChild } = require('./utils');

async function checkStagedFiles() {
  console.info(cyan('Running linters and formatters on staged files:'));

  const binPath = `${projectPath}/node_modules/.bin/lint-staged`;
  const configPath = require.resolve(`./lint-staged.config.js`);

  const result = await spawnChild(binPath, ['--config', configPath], {
    stdio: ['pipe', 'inherit', 'pipe']
  });

  if (result.exitCode === 0) return;

  console.error(result.stderr);
  fail();
}

module.exports = { checkStagedFiles };
