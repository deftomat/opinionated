const fs = require('fs');
const path = require('path');
const createConfig = require('../lint-staged.config');
const { cachePath, projectPath, toolsPath } = require('./paths');

const customConfigPath = path.resolve(`${projectPath}/lint-staged.config.js`);
const random = Math.round(Math.random() * 10000);

if (fs.existsSync(customConfigPath)) {
  module.exports = require(customConfigPath);
} else {
  const customTslint = path.resolve(`${projectPath}/tslint.json`);
  const customTslintFix = path.resolve(`${projectPath}/tslint.fix.json`);
  const defaultTslintFix = path.resolve(`${toolsPath}/tslint.fix.json`);

  if (fs.existsSync(customTslintFix)) {
    module.exports = toConfig(customTslintFix);
  } else if (fs.existsSync(customTslint)) {
    const generatedTslintFix = path.resolve(`${cachePath}/tslint${random}.json`);
    const config = { extends: [customTslint, defaultTslintFix] };
    fs.writeFileSync(generatedTslintFix, JSON.stringify(config, null, 2));
    module.exports = toConfig(generatedTslintFix);
  } else {
    module.exports = toConfig(defaultTslintFix);
  }
}

function toConfig(tslintPath) {
  const tsconfigPath = fs.existsSync(`${projectPath}/tsconfig.base.json`)
    ? 'tsconfig.base.json'
    : 'tsconfig.json';

  return createConfig({
    tslintPath: path.relative(projectPath, tslintPath),
    tsconfigPath
  });
}
