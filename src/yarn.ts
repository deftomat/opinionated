import { bold, underline, yellow } from 'chalk';
import execa from 'execa';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { fixDuplicates, listDuplicates } from 'yarn-deduplicate';
import { Context } from './context';
import { ToolError } from './errors';

export async function checkLockIntegrity(context: Context) {
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
        )}`
      )
    );
  }
}

export async function checkLockDuplicates(context: Context) {
  const duplicates = listDuplicates(readFileSync(`${context.projectRoot}/yarn.lock`).toString());
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

export async function fixLockDuplicates(context: Context) {
  const lockPath = `${context.projectRoot}/yarn.lock`;
  try {
    const originalLock = readFileSync(lockPath).toString();
    const fixedLock = fixDuplicates(originalLock);

    if (originalLock !== fixedLock) {
      writeFileSync(lockPath, fixedLock);
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

export function usesYarn(context: Context) {
  return existsSync(`${context.projectRoot}/yarn.lock`);
}
