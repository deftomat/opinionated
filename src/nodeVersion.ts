import { bold, yellow } from 'chalk';
import fs from 'fs';
import { Context } from './context';
import { ToolError } from './errors';

export async function checkNodeVersion(context: Context) {
  const { projectRoot } = context;
  const nvmrcPath = `${projectRoot}/.nvmrc`;

  if (!fs.existsSync(nvmrcPath)) {
    throw new ToolError('Unexpected error during NodeJS version check! ".nvmrc" file is missing.');
  }

  const current = parseVersion(process.versions.node);
  const expected = parseVersion(fs.readFileSync(`${projectRoot}/.nvmrc`).toString());

  if (!satisfies(current, expected)) {
    throw new ToolError(
      `NodeJS version check failed!`,
      yellow(
        `Current version (${current}) doesn't satisfies the requirements specified in ${bold(
          '.nvmrc'
        )} file.`
      ),
      yellow(`Please run this command with NodeJS ${expected}.`)
    );
  }
}

function satisfies(current: Version, expected: Version) {
  if (
    expected.major === current.major &&
    expected.minor === current.minor &&
    expected.patch === current.patch
  ) {
    return true;
  }

  if (
    expected.major === current.major &&
    expected.minor === current.minor &&
    expected.patch === undefined
  ) {
    return true;
  }

  if (
    expected.major === current.major &&
    expected.minor === undefined &&
    expected.patch === undefined
  ) {
    return true;
  }

  return false;
}

function parseVersion(version: string) {
  const parts = version
    .replace(/v/g, '')
    .split('.')
    .map(part => part.trim())
    .filter(part => part !== '');

  return {
    major: parts[0],
    minor: parts[1],
    patch: parts[2],
    toString: () => `v${parts.join('.')}`
  };
}

type Version = ReturnType<typeof parseVersion>;
