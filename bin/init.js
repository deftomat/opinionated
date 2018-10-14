#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const pkg = require(`${__dirname}/../package.json`);
const child = require('child_process');

const [, , type, name] = process.argv;
if (type == null) {
  console.error(chalk.red('App type is required!'));
  process.exit();
}

if (name == null) {
  console.error(chalk.red('App name is required!'));
  process.exit();
}

const source = `${__dirname}/../templates/${type}`;

if (!fs.existsSync(source)) {
  console.error(chalk.red(`App type "${type}" is not supported!`));
  process.exit();
}

const replace = [
  { search: '<NAME>', replace: name },
  { search: '<PKG_VERSION>', replace: pkg.version }
];

const target = `${process.cwd()}/${name}`;

try {
  fs.mkdirSync(target);
} catch (e) {}

fs.readdirSync(source)
  .map(file => `${source}/${file}`)
  .forEach(file => copy(file, target, replace));

try {
  child.execSync(`cd ${target} && git init -q`);
} catch (e) {}

console.info(chalk.green(`Success! Use "cd ${name}" to open an app directory.`));

function copy(sourceFile, destDir, replace = []) {
  const safeNames = {
    gitignore: '.gitignore'
  };

  const content = fs.readFileSync(sourceFile).toString('ascii');

  const updated = replace.reduce(
    (result, { search, replace }) => result.replace(search, replace),
    content
  );

  const targetName = path.basename(sourceFile);
  fs.writeFileSync(`${destDir}/${safeNames[targetName] || targetName}`, updated);
}
