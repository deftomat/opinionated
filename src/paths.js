const path = require('path');

const projectPath = process.cwd();
const toolsPath = path.resolve(`${__dirname}/../`);
const cachePath = path.resolve(`${__dirname}/../.cache`);

module.exports = { projectPath, toolsPath, cachePath };
