const fs = require('fs');
const { cyan, red, yellow, bold } = require('chalk');
const { projectPath } = require('./paths');
const { fail, spawnChild } = require('./utils');

const packagesDir = `${projectPath}/packages`;

async function checkTypeScriptTypes() {
  if (fs.existsSync(packagesDir)) return checkMonorepoPackages();
  return checkSimplePackage();
}

async function checkSimplePackage() {
  const path = process.cwd();
  if (!isTypeScriptPackage({ path })) return;

  console.info(cyan('Running type-check...'));

  const result = await withTscResult({ path });
  if (!hasError(result)) return;

  console.info(red(`Type-check failed with the following TypeScript errors:\n`));
  console.info(result.stdout);
}

async function checkMonorepoPackages() {
  console.info(cyan('Running type-check in each TypeScript package...'));

  const packages = fs
    .readdirSync(packagesDir)
    .map(toPackage)
    .filter(isTypeScriptPackage)
    .map(withTscResult);

  const results = await Promise.all(packages);
  if (!results.some(hasError)) return;

  const length = results.filter(hasError).length;
  if (length === 1) {
    console.info(red(`1 package failed with the following TypeScript errors:\n`));
  } else {
    console.info(red(`${length} packages failed with the following TypeScript errors:\n`));
  }

  results.filter(hasError).map(({ name, stdout }) => {
    const decoration = new Array(name.length + 12).fill('=').join('');
    console.info(yellow(decoration));
    console.info(yellow(`  Package ${bold(name)}  `));
    console.info(yellow(decoration + '\n'));
    console.info(stdout);
  });

  fail();
}

async function withTscResult(package) {
  const binPath = `${projectPath}/node_modules/.bin/tsc`;
  const result = await spawnChild(binPath, ['--noEmit', '--noUnusedLocals'], {
    cwd: package.path
  });

  return { ...package, ...result };
}

function hasError({ exitCode }) {
  return exitCode !== 0;
}

function toPackage(name) {
  return { name, path: `${packagesDir}/${name}` };
}

function isTypeScriptPackage({ path }) {
  return fs.existsSync(`${path}/tsconfig.json`);
}

module.exports = { checkTypeScriptTypes };
