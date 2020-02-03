import { bold, red, yellow } from 'chalk';
import execa from 'execa';
import fs from 'fs';
import {
  Context,
  isMonorepoContext,
  MonorepoContext,
  MonorepoPackageContext,
  PackageContext
} from './context';
import { allocateCore } from './cpu';
import { ToolError } from './errors';

// TODO: Use source files instead of builded files in monorepos!
// Otherwise, your monorepo could contains an outdated build of package and
// any other package which depends on it will be type checked against this outdated declarations.

export function containsTypeScript(context: Context) {
  if (isMonorepoContext(context)) return getTypeScriptPackages(context.packagesPath).length > 0;
  return isTypeScriptPackage({ path: context.packageRoot });
}

export async function runTypeCheck(context: Context) {
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
  const { packagesPath } = context;
  const packages = getTypeScriptPackages(packagesPath).map(withTscResult(context));

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

    // TODO: Ensure that temporary directory is still necessary!
    // To be able to use "--incremental", we need to emit files into temporary directory.
    // Once https://github.com/microsoft/TypeScript/issues/30661 will be fixed, then
    // this temporary directory could be remove.
    const outDir = `${cachePath}/tsc/${pkg.path.split('/').join('_')}`;

    try {
      await execa(
        binPath,
        [
          '--noEmit',
          'false',
          '--outDir',
          outDir,
          '--incremental',
          '--allowUnreachableCode',
          'false',
          '--pretty',
          '--noUnusedLocals',
          '--removeComments',
          '--declaration',
          'false',
          '--sourceMap',
          'false',
          '--inlineSourceMap',
          'false',
          '--inlineSources',
          'false',
          '--declarationMap',
          'false',
          '--diagnostics',
          'false',
          '--emitDeclarationOnly',
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

function getTypeScriptPackages(packagesPath: string) {
  return fs
    .readdirSync(packagesPath)
    .map(toPackage(packagesPath))
    .filter(isTypeScriptPackage);
}

function hasError({ stdout }) {
  return stdout != null;
}

function toPackage(packagesPath: string) {
  return name => ({ name, path: `${packagesPath}/${name}` });
}

function isTypeScriptPackage({ path }: { path: string }) {
  return fs.existsSync(`${path}/tsconfig.json`);
}
