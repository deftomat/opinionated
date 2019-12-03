import execa from 'execa';
import { Context } from './context';
import { ToolError } from './errors';
import { findPrettierIgnoreFile } from './ignore';

// TODO: Add cache support: https://github.com/prettier/prettier/issues/6577
// Make sure that new Prettier version or different Prettier config will invalidate cache.

export async function format(context: Context) {
  const { projectRoot, packageRoot } = context;
  const binPath = `${projectRoot}/node_modules/.bin/prettier`;

  const ignorePath = findPrettierIgnoreFile(context);
  const target = `${packageRoot ||
    projectRoot}/**/*.?(js|jsx|ts|tsx|html|css|scss|json|yml|graphql|md|mdx|gql)`;
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
