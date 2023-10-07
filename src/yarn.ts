import chalk from 'chalk';
import { execa } from 'execa';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fixDuplicates, listDuplicates } from 'yarn-deduplicate';
import { Context } from './context.js';
import { ToolError } from './errors.js';

const { bold, underline, yellow } = chalk;

/**
 * Trows when the `yarn.lock` doesn't match the `node_modules` content.
 */
export async function checkLockIntegrity(context: Context): Promise<void> {
  try {
    await execa('yarn', ['check', '--integrity'], { cwd: context.projectRoot });
  } catch (error) {
    throw new ToolError(
      'Integrity check failed with the following errors:',
      error.stderr,
      yellow('Error could be caused by an outdated yarn.lock.'),
      yellow(
        `Please check that all dependencies are correctly installed by running ${bold(
          'yarn install'
        )}.`
      )
    );
  }
}

/**
 * Throws when the `yarn.lock` contains dependencies, which can be deduplicated.
 */
export async function checkLockDuplicates(context: Context): Promise<void> {
  const duplicates = listDuplicates(
    readFileSync(`${context.projectRoot}/yarn.lock`).toString(),
    {}
  );
  if (duplicates.length === 0) return;

  throw new ToolError(
    `We found ${duplicates.length} duplicates in yarn.lock file!`,
    yellow(
      `Please use ${bold('yarn-deduplicate')} to manually fix these duplicates or run ${bold(
        'checkup'
      )} again with auto-fix enabled.\nSee ${underline(
        'https://bit.ly/2QS3FC5'
      )} for more information.`
    )
  );
}

/**
 * Deduplicate dependencies in `yarn.lock` and run `yarn install` if necessary.
 *
 * Use `autoInstall=false` to skip `yarn install`.
 */
export async function fixLockDuplicates(
  context: Context,
  { autoInstall = true } = {}
): Promise<void> {
  const lockPath = `${context.projectRoot}/yarn.lock`;
  try {
    const originalLock = readFileSync(lockPath).toString();
    const fixedLock = fixDuplicates(originalLock);

    if (originalLock !== fixedLock) {
      writeFileSync(lockPath, fixedLock);

      if (autoInstall) {
        await execa('yarn', ['install'], { cwd: context.projectRoot });
      }
    }
  } catch (error) {
    throw new ToolError(
      `Failed to deduplicate dependencies in yarn.lock file!`,
      yellow(
        `Please use ${bold('yarn-deduplicate')} to manually fix these duplicates.\nSee ${underline(
          'https://bit.ly/2QS3FC5'
        )} for more information.`
      )
    );
  }
}

/**
 * Return TRUE, when the given context uses Yarn.
 */
export function usesYarn(context: Context): boolean {
  return existsSync(`${context.projectRoot}/yarn.lock`);
}
