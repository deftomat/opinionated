import { CLIEngine } from 'eslint';
import { Context } from './context';
import { ToolError, ToolWarning } from './errors';
import { checkupLintConfig, defaultIgnorePattern, findIgnoreFile } from './eslintConfig';

/**
 * Runs a full lint on a given project.
 *
 * If a context defines a specific sub-package of a monorepo,
 * then ESLint will run only in that sub-package.
 */
export async function lint({ context, autoFix = false }: { context: Context; autoFix?: boolean }) {
  const { projectRoot, packageRoot, cachePath } = context;

  const linter = new CLIEngine({
    ignore: true,
    ignorePath: findIgnoreFile(context),
    useEslintrc: true,
    ignorePattern: defaultIgnorePattern,
    cache: true,
    cacheLocation: `${cachePath}/checkup-eslintcache`,
    cwd: projectRoot,
    fix: autoFix,
    baseConfig: checkupLintConfig
  });

  try {
    const report = linter.executeOnFiles([`${packageRoot || projectRoot}/**/*.?(js|jsx|ts|tsx)`]);

    if (autoFix) CLIEngine.outputFixes(report);

    const { errorCount, warningCount, results } = report;

    if (errorCount === 0 && warningCount === 0) return;
    const formatter = linter.getFormatter('stylish');
    const formatted = formatter(results);

    if (errorCount === 0) {
      throw new ToolWarning(
        `We found a minor ESLint warnings. We recommend you to fix them as soon as possible:`,
        formatted
      );
    }
    throw new ToolError(`ESLint failed with the following errors:`, formatted);
  } catch (e) {
    if (e.messageTemplate === 'file-not-found') return;
    if (e.messageTemplate === 'all-files-ignored') return;
    throw e;
  }
}
