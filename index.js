#!/usr/bin/env node

const { green, red } = require('chalk');
const { checkLockIntegrity } = require('./src/integrity');
const { checkStagedFiles } = require('./src/lintStaged');
const { checkTypeScriptTypes } = require('./src/typeCheck');
const { clearCache } = require('./src/utils');

const runTSC = process.argv.includes('--with-tsc');

async function run() {
  try {
    clearCache();

    // await checkLockIntegrity();
    if (runTSC) await checkTypeScriptTypes();
    await checkStagedFiles();

    console.info(green('🚀  All good! Ship it!'));
  } catch (e) {
    console.error(red(`Unexpected error:\n\n${e}`));
  }
}

run();
