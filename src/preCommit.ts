import { bold, red } from 'chalk';
import { CLIEngine } from 'eslint';
import { promises as fs } from 'fs';
import prettier from 'prettier';
import { onProcessExit } from './cleanup';
import { Context } from './context';
import { ToolError } from './errors';
import { preCommitLintConfig } from './eslintConfig';
import { defaultIgnorePattern, findEslintIgnoreFile, findPrettierIgnoreFile } from './ignore';
import { isNotNil } from './utils';

/**
 * Runs pre-commit operations on staged files.
 */
export async function preCommit(context: Context): Promise<void> {
  const { git } = context;

  const staged = await git.getStagedFiles();
  if (staged.length === 0) return;

  const hasPartiallyStagedFiles = await git.hasPartiallyStagedFiles();

  if (hasPartiallyStagedFiles) await git.stashSave();
  const cleanup = hasPartiallyStagedFiles ? () => git.stashPop() : () => null;
  onProcessExit.add(cleanup);

  const linter = createLinter(context);

  const processed = await Promise.all(staged.map(processFile({ context, linter })));
  const errors = processed.filter(isNotNil);
  const hasError = errors.length > 0;

  if (hasPartiallyStagedFiles && !hasError) await git.updateStash();

  onProcessExit.delete(cleanup);
  await cleanup();

  if (hasError) {
    throw new ToolError(
      'Pre-commit checks failed with the following errors:',
      ...errors.map(e => `${e}\n`)
    );
  }
}

/**
 * Returns `undefined` when a given file processed with no errors.
 *
 * Otherwise, returns `Error` when a given file cannot be processed.
 */
function processFile({ context, linter }: { context: Context; linter: CLIEngine }) {
  return async (filename: string): Promise<string | undefined> => {
    try {
      const prettierFileInfo = await prettier.getFileInfo(filename, {
        ignorePath: findPrettierIgnoreFile(context)
      });

      const { inferredParser } = prettierFileInfo;
      if (inferredParser == null) return;

      const shouldPrettify = !prettierFileInfo.ignored;
      const shouldLint =
        !linter.isPathIgnored(filename) &&
        (inferredParser === 'babel' || inferredParser === 'typescript');

      if (!shouldPrettify && !shouldLint) return;

      const original = (await fs.readFile(filename)).toString();

      if (original.trim() === '') return;

      let content = original;

      if (shouldLint) {
        const { errorCount, warningCount, results } = linter.executeOnText(content, filename);

        if (errorCount !== 0 || warningCount !== 0) {
          return linter.getFormatter('stylish')(results);
        }
        content = results[0].output || content;
      }

      if (shouldPrettify) {
        try {
          const options = await prettier.resolveConfig(filename, { editorconfig: true });
          content = prettier.format(content, { ...options, parser: inferredParser });
        } catch (error) {
          return red(`Failed to run Prettier on ${bold(filename)}!\n`) + error;
        }
      }

      if (original !== content) {
        await fs.writeFile(filename, content);
        await context.git.stageFile(filename);
      }
    } catch (error) {
      return error.toString();
    }
  };
}

function createLinter(context: Context): CLIEngine {
  return new CLIEngine({
    ignore: true,
    ignorePath: findEslintIgnoreFile(context),
    useEslintrc: false,
    ignorePattern: defaultIgnorePattern,
    cwd: context.projectRoot,
    fix: true,
    baseConfig: preCommitLintConfig
  });
}
