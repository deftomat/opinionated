import { defaultIgnorePattern } from './ignore';
import { ESLint } from 'eslint';

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
  'spaced-comment': ['error', 'always', { exceptions: ['-', '+', '=', '*'], markers: ['/'] }],
  'dot-notation': 'error',
  'no-useless-return': 'error',
  'prefer-arrow-callback': ['error', { allowNamedFunctions: true, allowUnboundThis: true }],
  'prefer-destructuring': [
    'error',
    {
      VariableDeclarator: { array: false, object: true },
      AssignmentExpression: { array: false, object: false }
    }
  ],
  yoda: ['error', 'never', { exceptRange: true }]
};

/**
 * ⚠️ !!!STOP: ESSENTIAL RULES MUST BE AUTOFIXABLE !!! ⚠️
 * If adding a typescript-eslint version of an existing ESLint rule,
 * make sure to disable the ESLint rule here.
 *
 * Also, please make sure rule doesn't require type information
 * as type information is not generated because it can be time consuming.
 */
const essentialTypescriptRules = {
  '@typescript-eslint/no-inferrable-types': 'error',
  '@typescript-eslint/prefer-function-type': 'error',
  '@typescript-eslint/array-type': ['error', { default: 'array-simple' }]
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
    {
      allow: [
        'warn',
        'error',
        'info',
        'time',
        'timeEnd',
        'timeLog',
        'debug',
        'clear',
        'group',
        'groupCollapsed',
        'groupEnd'
      ]
    }
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
  // 'no-new': 'error', // disabled because AWS-CDK is breaking this rule extensively
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
  'import/no-deprecated': 'warn'

  // Disabled as it raises false-positive error in components like this:
  //
  //   <Dictionary>
  //     {[
  //        ['Source', data.articleOne.sources.join(', ')],
  //        ['Published', <LocaleDate date={data.articleOne.appearedAt} />],
  //     ]}
  //    </Dictionary>
  //
  // 'react/jsx-key': ['error', { checkFragmentShorthand: true }]

  // Enable the following JSX rules to fix false-positive errors when no-unused-vars rule is used!
  // 'react/jsx-uses-vars': 'error',
  // 'react/jsx-uses-react': 'error'
};

/**
 * If adding a typescript-eslint version of an existing ESLint rule,
 * make sure to disable the ESLint rule here.
 *
 * Also, please make sure rule doesn't require type information
 * as type information is not generated because it can be time consuming.
 */
const strictTypescriptRules = {
  '@typescript-eslint/prefer-for-of': 'error',
  '@typescript-eslint/adjacent-overload-signatures': 'error',
  '@typescript-eslint/no-empty-interface': 'error',
  '@typescript-eslint/no-require-imports': 'error',
  '@typescript-eslint/no-useless-constructor': 'error',
  '@typescript-eslint/no-this-alias': ['error', { allowDestructuring: true }]
};

export const preCommitLintConfig = toLintConfig({
  rules: essentialRules,
  tsOnlyRules: essentialTypescriptRules,
  plugins: ['react']
});

export const checkupLintConfig = toLintConfig({
  rules: { ...essentialRules, ...strictRules },
  tsOnlyRules: { ...essentialTypescriptRules, ...strictTypescriptRules },
  plugins: ['react', 'import']
});

// export const editorLintConfig = toLintConfig({
//   rules: strictRules,
//   tsOnlyRules: strictTypescriptRules,
//   plugins: ['react', 'import']
// });

function toLintConfig({
  rules,
  tsOnlyRules,
  plugins
}: {
  rules: object;
  tsOnlyRules: object;
  plugins: string[];
}): ESLint.ConfigData {
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
      react: { version: '999.999.999' }
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
    ignorePatterns: [defaultIgnorePattern],
    overrides: [
      {
        files: ['*.ts?(x)'],
        plugins: ['@typescript-eslint'],
        parser: '@typescript-eslint/parser',
        parserOptions: {
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
