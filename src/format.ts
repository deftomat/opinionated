import execa from 'execa';
import fs from 'fs';
import { Context } from './context';
import { ToolError } from './errors';

// TODO: Add cache support: https://github.com/prettier/prettier/issues/6577
// Make sure that new Prettier version or different Prettier config will invalidate cache.

export async function format(context: Context) {
  const { projectRoot, packageRoot } = context;
  const binPath = `${projectRoot}/node_modules/.bin/prettier`;

  const ignorePath = findIgnoreFile(context);
  const target = `${packageRoot || projectRoot}/**/*.?(js|jsx|ts|tsx)`;
  try {
    const ignoreOption = ignorePath ? ['--ignore-path', ignorePath] : [];
    await execa(binPath, ['--write', target, ...ignoreOption], { cwd: projectRoot });
  } catch (error) {
    throw new ToolError(
      'We were unable to format your codebase! Prettier failed with the following error:',
      error.stdout
    );
  }
}

function findIgnoreFile({ projectRoot }: Context): string | undefined {
  if (fs.existsSync(`${projectRoot}/.prettierignore`)) {
    return `${projectRoot}/.prettierignore`;
  }

  if (fs.existsSync(`${projectRoot}/.gitignore`)) {
    return `${projectRoot}/.gitignore`;
  }
}
