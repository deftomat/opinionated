module.exports = function createConfig({
  tslintPath = 'tslint.fix.json',
  tsconfigPath = 'tsconfig.json'
}) {
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
