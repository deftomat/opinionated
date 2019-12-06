/**
 * ⚠️ !!!STOP: ESSENTIAL RULES MUST BE AUTOFIXABLE !!! ⚠️
 * When adding rules here, you need to make sure they are compatible with
 * `typescript-eslint`, as some rules such as `no-array-constructor` aren't compatible.
 */
const essentialRules = {
  'react/jsx-boolean-value': 'error',
  'react/jsx-fragments': ['error', 'syntax'],
  // 'opinionated/organize-imports': 'error',
  'no-else-return': 'error',
  'no-implicit-coercion': 'error',
  'no-undef-init': 'error',
  // 'multiline-comment-style': 'error',
  'no-lonely-if': 'error',
  'no-unneeded-ternary': 'error',
  'no-useless-computed-key': 'error',
  'no-useless-rename': 'error',
  'no-var': 'error',
  'object-shorthand': 'error',
  'no-regex-spaces': 'error',
  'spaced-comment': ['error', 'always', { exceptions: ['-', '+', '=', '*'] }],
  'dot-notation': 'error',
  'no-useless-return': 'error',
  'prefer-arrow-callback': ['error', { allowNamedFunctions: true, allowUnboundThis: true }],
  'prefer-destructuring': ['error', { array: false, object: true }],
  yoda: ['error', 'never', { exceptRange: true }]
};

/**
 * ⚠️ !!!STOP: ESSENTIAL RULES MUST BE AUTOFIXABLE !!! ⚠️
 * If adding a typescript-eslint version of an existing ESLint rule,
 * make sure to disable the ESLint rule here.
 *
 * Also, please make sure typescript-eslint rule doesn't require type information
 * as type information is not generated during pre-commit because it can be time consuming.
 */
const essentialTypescriptRules = {
  '@typescript-eslint/no-inferrable-types': 'error',
  '@typescript-eslint/prefer-function-type': 'error',
  '@typescript-eslint/array-type': ['error', { default: 'array' }]
};

/**
 * When adding rules here, you need to make sure they are compatible with
 * `typescript-eslint`, as some rules such as `no-array-constructor` aren't compatible.
 */
const strictRules = {
  'no-compare-neg-zero': 'error',
  'no-cond-assign': 'error',
  'no-console': [
    'error',
    { allow: ['warn', 'error', 'info', 'time', 'timeEnd', 'timeLog', 'debug', 'clear'] }
  ],
  'no-constant-condition': ['error', { checkLoops: false }],
  'no-debugger': 'error',
  'no-duplicate-case': 'error',
  'no-empty': ['error', { allowEmptyCatch: true }],
  'no-empty-character-class': 'error',
  'no-extra-boolean-cast': 'error',
  'no-invalid-regexp': 'error',
  'no-sparse-arrays': 'error',
  'no-unsafe-finally': 'error',
  'no-unsafe-negation': 'error',
  'require-atomic-updates': 'error',
  'use-isnan': 'error',
  eqeqeq: ['error', 'always', { null: 'ignore' }],
  'guard-for-in': 'error',
  'no-caller': 'error',
  'no-empty-pattern': 'error',
  'no-eval': 'error',
  'no-extend-native': 'error',
  'no-extra-bind': 'error',
  'no-implied-eval': 'error',
  // 'no-invalid-this': 'error', // not working on class properties: https://github.com/typescript-eslint/typescript-eslint/issues/491
  'no-new': 'error',
  'no-new-wrappers': 'error',
  'no-return-await': 'error',
  'no-script-url': 'error',
  'no-self-assign': 'error',
  'no-useless-catch': 'error',
  'no-useless-escape': 'error',
  radix: ['error', 'as-needed'],
  'no-delete-var': 'error',
  'no-buffer-constructor': 'error',
  'prefer-const': 'error',
  'prefer-numeric-literals': 'error',
  'prefer-rest-params': 'error',
  'prefer-spread': 'error',
  'require-yield': 'error',
  'symbol-description': 'error',
  'import/no-deprecated': 'warn',
  'react/jsx-key': ['error', { checkFragmentShorthand: true }]
};

/**
 * If adding a typescript-eslint version of an existing ESLint rule,
 * make sure to disable the ESLint rule here.
 */
const strictTypescriptRules = {
  '@typescript-eslint/prefer-for-of': 'error',
  '@typescript-eslint/adjacent-overload-signatures': 'error',
  '@typescript-eslint/class-name-casing': ['error', { allowUnderscorePrefix: true }],
  '@typescript-eslint/interface-name-prefix': ['error', { prefixWithI: 'never' }],
  '@typescript-eslint/no-empty-interface': 'error',
  '@typescript-eslint/no-require-imports': 'error',
  '@typescript-eslint/no-useless-constructor': 'error',
  '@typescript-eslint/no-misused-new': 'error',
  '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }],
  // '@typescript-eslint/prefer-readonly': 'error',
  '@typescript-eslint/no-this-alias': ['error', { allowDestructuring: true }]
  // '@typescript-eslint/prefer-nullish-coalescing': ['error'] // TODO: Enable when TypeScript 3.7 will be widely used!
  // '@typescript-eslint/prefer-optional-chain': ['error'] // TODO: Enable when TypeScript 3.7 will be widely used!
};

export const preCommitLintConfig = toLintConfig({
  rules: essentialRules,
  tsOnlyRules: essentialTypescriptRules,
  plugins: ['react'],
  generateTypeInformation: false
});

export const checkupLintConfig = toLintConfig({
  rules: { ...essentialRules, ...strictRules },
  tsOnlyRules: { ...essentialTypescriptRules, ...strictTypescriptRules },
  plugins: ['react', 'import'],
  generateTypeInformation: true
});

export const editorLintConfig = toLintConfig({
  rules: strictRules,
  tsOnlyRules: strictTypescriptRules,
  plugins: ['react', 'import'],
  generateTypeInformation: false
});

function toLintConfig({
  rules,
  tsOnlyRules,
  plugins,
  generateTypeInformation
}: {
  rules: object;
  tsOnlyRules: object;
  plugins: string[];
  generateTypeInformation: boolean;
}) {
  return {
    root: true,
    env: {
      browser: true,
      commonjs: true,
      es6: true,
      jest: true,
      node: true
    },
    settings: {
      react: { version: 'detect' }
    },
    parser: 'babel-eslint',
    parserOptions: {
      ecmaVersion: 2018,
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true
      }
    },
    plugins,
    overrides: [
      {
        files: ['*.ts?(x)'],
        plugins: ['@typescript-eslint'],
        parser: '@typescript-eslint/parser',
        parserOptions: {
          project: generateTypeInformation
            ? ['./packages/*/tsconfig.json', './tsconfig.json']
            : undefined,
          ecmaVersion: 2018,
          sourceType: 'module',
          ecmaFeatures: { jsx: true },
          warnOnUnsupportedTypeScriptVersion: true
        },
        rules: tsOnlyRules
      }
    ],
    rules
  };
}
