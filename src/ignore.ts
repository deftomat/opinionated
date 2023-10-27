import fs from 'node:fs';
import { Context } from './context.js';

/**
 * Returns filename of ignore file for ESLint.
 */
export function findEslintIgnoreFile({ projectRoot, projectSpec }: Context): string | undefined {
  const eslintIgnore = `${projectRoot}/.eslintignore`;
  const opinionatedIgnore = `${projectRoot}/.opinionatedignore`;
  const gitIgnore = `${projectRoot}/.gitignore`;

  if (fs.existsSync(eslintIgnore)) return eslintIgnore;
  if (projectSpec.get().eslintIgnore != null) return;
  if (fs.existsSync(opinionatedIgnore)) return opinionatedIgnore;
  if (fs.existsSync(gitIgnore)) return gitIgnore;
}

/**
 * Returns filename of ignore file for Prettier.
 */
export function findPrettierIgnoreFile({ projectRoot }: Context): string | undefined {
  const prettierIgnore = `${projectRoot}/.prettierignore`;
  const opinionatedIgnore = `${projectRoot}/.opinionatedignore`;
  const gitIgnore = `${projectRoot}/.gitignore`;

  if (fs.existsSync(prettierIgnore)) return prettierIgnore;
  if (fs.existsSync(opinionatedIgnore)) return opinionatedIgnore;
  if (fs.existsSync(gitIgnore)) return gitIgnore;
}

export const defaultIgnorePattern = '**/node_modules/';
