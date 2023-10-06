import { bold, yellow } from 'chalk';
import execa from 'execa';
import { existsSync } from 'fs';
import { Context } from './context';
import { ToolError } from './errors';

/**
 * Trows when the `package-lock.json` doesn't match the `node_modules` content.
 */
export async function checkNpmLockIntegrity(context: Context): Promise<void> {
  try {
    await execa('npm', ['audit', 'signatures'], { cwd: context.projectRoot });
  } catch (error) {
    throw new ToolError(
      'Integrity check failed with the following errors:',
      error.stderr,
      yellow('Error could be caused by an outdated yarn.lock.'),
      yellow(
        `Please check that all dependencies are correctly installed by running ${bold(
          'npm install'
        )}.`
      )
    );
  }
}

/**
 * Runs `npm audit`.
 */
export async function checkNpmAudit(context: Context): Promise<void> {
  try {
    await execa('npm', ['audit'], { cwd: context.projectRoot });
  } catch (error) {
    throw new ToolError(`Failed to run npm audit!`);
  }
}

/**
 * Runs `npm audit fix`.
 */
export async function fixNpmAudit(context: Context): Promise<void> {
  try {
    await execa('npm', ['audit', 'fix'], { cwd: context.projectRoot });
  } catch (error) {
    throw new ToolError(`Failed to run npm audit fix!`);
  }
}

/**
 * Deduplicate dependencies in `package-lock.json` and run `npm install` if necessary.
 *
 * Use `autoInstall=false` to skip `yarn install`.
 */
export async function fixNpmLockDuplicates(context: Context): Promise<void> {
  try {
    await execa('npm', ['dedup'], { cwd: context.projectRoot });
  } catch (error) {
    throw new ToolError(`Failed to deduplicate dependencies in package-lock.json file!`);
  }
}

/**
 * Return TRUE, when the given context uses npm.
 */
export function usesNpm(context: Context): boolean {
  return existsSync(`${context.projectRoot}/package-lock.json`);
}
