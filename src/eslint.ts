import { CLIEngine } from 'eslint';
import { isMainThread } from 'worker_threads';
import { Context } from './context';
import { ToolError, ToolWarning } from './errors';
import { checkupLintConfig } from './eslintConfig';
import { defaultIgnorePattern, findEslintIgnoreFile } from './ignore';
import { asWorkerMaster, runAsWorkerSlave } from './utils';

// Declares static CLIEngine.getFormatter method as described here:
// https://eslint.org/docs/developer-guide/nodejs-api#cliengine-getformatter
// TODO: Remove after @types/eslint will be fixed!!!
declare module 'eslint' {
  namespace CLIEngine {
    const getFormatter: (format?: string) => CLIEngine.Formatter;
  }
}

/**
 * Runs a full lint on a given project.
 *
 * If a context defines a specific sub-package of a monorepo,
 * then ESLint will run only in that sub-package.
 */
export async function lint({ context, autoFix = false }: { context: Context; autoFix?: boolean }) {
  try {
    const runEslint = asWorkerMaster<typeof getEslintReport>(__filename);

    const { results, errorCount, warningCount } = await runEslint({
      ignorePath: findEslintIgnoreFile(context),
      cachePath: context.cachePath,
      projectRoot: context.projectRoot,
      packageRoot: context.packageRoot,
      autoFix,
    });

    if (errorCount === 0 && warningCount === 0) return;

    const formatter = CLIEngine.getFormatter('stylish');
    const formattedReport = formatter(results);

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

function getEslintReport({
  ignorePath,
  cachePath,
  projectRoot,
  packageRoot,
  autoFix,
}: {
  ignorePath: string | undefined;
  cachePath: string;
  projectRoot: string;
  packageRoot: string | undefined;
  autoFix: boolean;
}) {
  const linter = new CLIEngine({
    ignore: true,
    ignorePath,
    useEslintrc: true,
    ignorePattern: defaultIgnorePattern,
    cache: true,
    cacheLocation: `${cachePath}/checkup-eslintcache`,
    cwd: projectRoot,
    fix: autoFix,
    baseConfig: checkupLintConfig,
  });

  const report = linter.executeOnFiles([`${packageRoot || projectRoot}/**/*.?(js|jsx|ts|tsx)`]);

  if (autoFix) CLIEngine.outputFixes(report);
  return report;
}
