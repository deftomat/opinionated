module.exports = function createConfig({ tslintPath, tsconfigPath }) {
  if (tslintPath == null) throw Error('"tslintPath" must be provided!');
  if (tsconfigPath == null) throw Error('"tsconfigPath" must be provided!');

  return {
    '*.{ts,tsx}': [
      `tslint --config ${tslintPath} --project ${tsconfigPath} --fix`,
      'prettier --write',
      'git add'
    ],
    '*.{js,jsx}': [`tslint --config ${tslintPath} --fix`, 'prettier --write', 'git add'],
    '*.{html,css,scss,json,yml,graphql,md,mdx}': ['prettier --write', 'git add']
  };
};
