module.exports = {
  '*.{ts,tsx}': [
    'tslint --config tslint.fix.json --project tsconfig.json --fix',
    'prettier --write',
    'git add'
  ],
  '*.{js,jsx}': ['tslint --config tslint.fix.json --fix', 'prettier --write', 'git add'],
  '*.{css,scss,json,yml,graphql,md}': ['prettier --write', 'git add']
};
