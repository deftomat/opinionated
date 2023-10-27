import { ESLint } from 'eslint';
import { isMainThread } from 'node:worker_threads';
import { Context } from './context.js';
import { ToolError, ToolWarning } from './errors.js';
import { checkupLintConfig } from './eslintConfig.js';
import { findEslintIgnoreFile } from './ignore.js';
import { asWorkerMaster, runAsWorkerSlave } from './utils.js';
import { fileURLToPath } from 'node:url';

/**
 * Runs a full lint on a given project.
 *
 * If a context defines a specific sub-package of a monorepo,
 * then ESLint will run only in that sub-package.
 */
export async function lint(
  context: Context,
  { autoFix = false }: { autoFix?: boolean } = {}
): Promise<void> {
  try {
    const runEslint = asWorkerMaster<typeof getEslintReport>(fileURLToPath(import.meta.url));

    const { results, errorCount, warningCount } = await runEslint({
      ignorePath: findEslintIgnoreFile(context),
      cachePath: context.cachePath,
      projectRoot: context.projectRoot,
      packageRoot: context.packageRoot,
      autoFix
    });

    if (errorCount === 0 && warningCount === 0) return;

    const eslint = new ESLint();

    const formatter = await eslint.loadFormatter('stylish');
    const formattedReport = await formatter.format(results);

    if (errorCount === 0) {
      throw new ToolWarning(
        `We found a minor ESLint warnings. We recommend you to fix them as soon as possible:`,
        formattedReport
      );
    }
    throw new ToolError(`ESLint failed with the following errors:`, formattedReport);
  } catch (error) {
    if (error.messageTemplate === 'file-not-found') return;
    if (error.messageTemplate === 'all-files-ignored') return;
    throw error;
  }
}

if (!isMainThread) {
  runAsWorkerSlave(getEslintReport);
}

async function getEslintReport({
  ignorePath,
  cachePath,
  projectRoot,
  packageRoot,
  autoFix
}: {
  ignorePath: string | undefined;
  cachePath: string;
  projectRoot: string;
  packageRoot: string | undefined;
  autoFix: boolean;
}) {
  const linter = new ESLint({
    ignore: true,
    ignorePath,
    useEslintrc: true,
    cache: true,
    cacheLocation: `${cachePath}/checkup-eslintcache`,
    cwd: projectRoot,
    fix: autoFix,
    baseConfig: checkupLintConfig
  });

  const report = await linter.lintFiles([`${packageRoot || projectRoot}/**/*.?(js|jsx|ts|tsx)`]);

  if (autoFix) ESLint.outputFixes(report);

  const { errorCount, warningCount } = report.reduce(
    (result, current) => {
      result.errorCount += current.errorCount;
      result.warningCount += current.warningCount;
      return result;
    },
    { errorCount: 0, warningCount: 0 }
  );

  return { errorCount, warningCount, results: report };
}
