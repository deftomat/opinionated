import chalk from 'chalk';
import { execa } from 'execa';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { basename } from 'node:path';
import {
  Context,
  isMonorepoContext,
  MonorepoContext,
  MonorepoPackageContext,
  PackageContext
} from './context.js';
import { allocateCore } from './cpu.js';
import { ToolError } from './errors.js';

const { bold, red, yellow } = chalk;

// TODO: Use source files instead of builded files in monorepos!
// Otherwise, your monorepo could contains an outdated build of package and
// any other package which depends on it will be type checked against this outdated declarations.

/**
 * Return TRUE when the given context contains `tsconfig.json` file.
 */
export function containsTypeScript(context: Context): boolean {
  if (isMonorepoContext(context)) return getTypeScriptPackages(context.packages).length > 0;
  return isTypeScriptPackage({ path: context.packageRoot });
}

/**
 * Runs TypeScript checks in the given context.
 */
export async function runTypeCheck(context: Context): Promise<void> {
  if (isMonorepoContext(context)) return runTscInAllPackages(context);
  return runTscInPackage(context);
}

async function runTscInPackage(context: PackageContext | MonorepoPackageContext) {
  const { packageRoot } = context;
  if (!isTypeScriptPackage({ path: packageRoot })) return;

  const result = await withTscResult(context)({ path: packageRoot });
  if (!hasError(result)) return;

  throw new ToolError(red(`Checkup failed with the following TypeScript errors:\n`), result.stdout);
}

async function runTscInAllPackages(context: MonorepoContext) {
  const packages = getTypeScriptPackages(context.packages).map(withTscResult(context));

  const results = await Promise.all(packages);
  if (!results.some(hasError)) return;
  const { length } = results.filter(hasError);
  const header =
    length === 1
      ? red(`1 package failed with the following TypeScript errors:`)
      : red(`${length} packages failed with the following TypeScript errors:`);

  const formatted = results
    .filter(hasError)
    .map(({ name, stdout }) => {
      const decorationLength = 76;
      const decoration = new Array(decorationLength).fill('=').join('');
      const spacing = new Array(Math.round((decorationLength - name.length - 8) / 2))
        .fill(' ')
        .join('');
      return yellow(`\n${decoration}\n${spacing}Package ${bold(name)}\n${decoration}\n\n`) + stdout;
    })
    .join('');

  throw new ToolError(header, formatted);
}

function withTscResult(context: Context) {
  const { projectRoot, cachePath } = context;
  const binPath = `${projectRoot}/node_modules/.bin/tsc`;

  return async pkg => {
    const thread = await allocateCore();

    const outDir = `${cachePath}/tsc/${createHash('sha1')
      .update(pkg.path)
      .digest()
      .toString('hex')}`;

    try {
      await execa(
        binPath,
        [
          '--allowJs',
          '--checkJs',
          '--noEmit',
          'true',
          '--outDir',
          outDir,
          '--incremental',
          '--allowUnreachableCode',
          'false',
          '--pretty',
          '--noUnusedLocals',
          '--removeComments',
          '--sourceMap',
          '--declarationMap',
          'false',
          '--diagnostics',
          'false',
          '--assumeChangesOnlyAffectDirectDependencies',
          'false'
        ],
        { cwd: pkg.path }
      );
      return { ...pkg, stdout: null };
    } catch (error) {
      return { ...pkg, stdout: error.stdout };
    } finally {
      thread.free();
    }
  };
}

function getTypeScriptPackages(packages: string[]) {
  return packages.map(pkg => ({ name: basename(pkg), path: pkg })).filter(isTypeScriptPackage);
}

function hasError({ stdout }) {
  return stdout != null;
}

function isTypeScriptPackage({ path }: { path: string }) {
  return fs.existsSync(`${path}/tsconfig.json`);
}
