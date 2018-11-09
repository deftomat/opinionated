module.exports = {
  '*.{ts,tsx}': [
    'tslint --config tslint.fix.json --project tsconfig.json --fix',
    'prettier --write',
    'git add'
  ],
  '*.{js,jsx}': ['tslint --config tslint.fix.json --fix', 'prettier --write', 'git add'],
  '*.{html,css,scss,json,yml,graphql,md,mdx}': ['prettier --write', 'git add']
};
