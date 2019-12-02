import { bold, red } from 'chalk';
import { CLIEngine } from 'eslint';
import { promises as fs } from 'fs';
import prettier from 'prettier';
import { Context } from './context';
import { ToolError } from './errors';
import { defaultIgnorePattern, preCommitLintConfig } from './eslintConfig';
import { GitWorkflow } from './git';
import { isNotNil } from './utils';

export async function preCommit(context: Context) {
  const { projectRoot, git } = context;

  const staged = await git.getStagedFiles();
  if (staged.length === 0) return;

  const hasPartiallyStagedFiles = git.hasPartiallyStagedFiles();
  if (hasPartiallyStagedFiles) await git.stashSave();

  const linter = createLinter(context);

  const processed = await Promise.all(staged.map(processFile({ projectRoot, git, linter })));
  const errors = processed.filter(isNotNil);
  const hasError = errors.length > 0;

  if (hasPartiallyStagedFiles && !hasError) await git.updateStash();
  if (hasPartiallyStagedFiles) await git.stashPop();
  if (errors.length > 0) {
    throw new ToolError('Pre-commit checks failed with the following errors:', ...errors);
  }
}

/**
 * Returns `undefined` when a given file processed with no errors.
 *
 * Otherwise, returns `Error` when a given file cannot be processed.
 */
function processFile({
  projectRoot,
  git,
  linter
}: {
  projectRoot: string;
  git: GitWorkflow;
  linter: CLIEngine;
}) {
  return async (filePath: string): Promise<string | undefined> => {
    try {
      const prettierFileInfo = await prettier.getFileInfo(filePath, {
        ignorePath: `${projectRoot}/.prettierignore`
      });

      const { inferredParser } = prettierFileInfo;
      if (inferredParser == null) return;

      const shouldPrettify = !prettierFileInfo.ignored;
      const shouldLint =
        !linter.isPathIgnored(filePath) &&
        (inferredParser === 'babel' || inferredParser === 'typescript');

      if (!shouldPrettify && !shouldLint) return;

      const original = (await fs.readFile(filePath)).toString();
      let content = original;

      if (shouldLint) {
        const { errorCount, warningCount, results } = linter.executeOnText(content, filePath);

        if (errorCount !== 0 || warningCount !== 0) {
          return linter.getFormatter('stylish')(results);
        }
        content = results[0].output;
      }

      if (shouldPrettify) {
        try {
          const options = await prettier.resolveConfig(filePath, { editorconfig: true });
          content = prettier.format(content, { ...options, parser: inferredParser });
        } catch (e) {
          return red(`Failed to run Prettier on ${bold(filePath)}!\n`) + e;
        }
      }

      if (original !== content) {
        await fs.writeFile(filePath, content);
        await git.stageFile(filePath);
      }
    } catch (e) {
      return e.toString();
    }
  };
}

function createLinter({ projectRoot }: Context): CLIEngine {
  return new CLIEngine({
    ignore: true,
    useEslintrc: false,
    ignorePattern: defaultIgnorePattern,
    cwd: projectRoot,
    fix: true,
    baseConfig: preCommitLintConfig
  });
}
