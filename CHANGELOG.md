# 0.9.0

- feat: stop generating `.nvmrc` file in favor of Volta.

# 0.8.1

- fix: disable `strictPropertyInitialization` tsconfig option

# 0.8.0

- BREAKING: drop support for Node 12
- feat: TypeScript 4.4 support
- fix: disable `react/jsx-key` as it raises false-positive errors in components like this:
  ```tsx
  <Dictionary>
    {[
      ['Source', data.articleOne.sources.join(', ')],
      ['Published', <LocaleDate date={data.articleOne.appearedAt} />]
    ]}
  </Dictionary>
  ```

# 0.7.2

- fix: disable `no-new` ESLint rule because AWS-CDK is breaking this rule extensively

# 0.7.1

- fix: reduce cache size

# 0.7.0

- feat: major TypeScript, ESLint, YarnDeduplicate and Prettier upgrade

# 0.6.6

- feat: allow to use `console.group*` statements

# 0.6.5

- feat: always check JS files during TypeScript check

# 0.6.4

- fix: warning banner rendering

# 0.6.3

- fix: programmatic API

# 0.6.2

- feat: export programmatic API for each Opinionated feature
- feat: auto install deduplicated dependencies if possible
- fix: CPU allocation during TypeScript checks

# 0.6.1

- fix: do not add trailing comma during formatting

# 0.6.0

- feat: upgrade to Prettier 2.0
- feat: sort package.json entries with `prettier-plugin-package`
- fix: step elapsed time

# 0.5.9

- fix: do not generate source maps and declaration files during TypeScript checks

# 0.5.8

- fix: require Node v12

# 0.5.7

- fix: typo in warning message

# 0.5.6

- fix: properly format type check error messages

# 0.5.5

- fix: use `array-simple` in `@typescript-eslint/array-type` rule
- fix: ensure minimum Git version

# 0.5.4

- feat: measure check time
- fix: ESLint config
- fix: type check performance
- fix: better Prettier error handling

# 0.5.3

- fix: remove type info support from ESLint

# 0.5.2

- fix: fix failing `pre-commit` command
- fix: better messages
- feat: more TS ESLint rules & type info support

# 0.5.1

- fix: specify `typescript` as peer dependency

# 0.5.0

A complete rewrite which introduces the new `pre-commit` and `checkup` commands.

- feat: remove dependency on `lint-staged`
- feat: replace `TSLint` with `ESLint`
- feat: create all necessary configs automatically (EditorConfig, Prettier, NVM)
- feat: duplicate dependencies check

# 0.4.7

- fix: disable integrity check due to multiple false positive warnings

# 0.4.6

- fix: enforce `pretty=true` flag to pretty print errors emitted by TypeScript

# 0.4.5

- fix: fail on type errors in non-monorepo projects

# 0.4.4

- fix: better integrity check error message
- bump dependencies

# 0.4.3

- support classic non-monorepo projects
- make options in `lint-staged.config.js - createConfig()` required

# 0.4.2

- support `tsconfig.base.json`
- make TSC optional - added new flag `--with-tsc`

# 0.4.1

- remove node_modules verification as it is broken in Yarn workspaces
- replace deprecated `no-unnecessary-bind` by build-in `unnecessary-bind` TSLint rule

# 0.4.0

Provides a fully featured pre-commit command which will run the following checks:

- check yarn.lock integrity
- check dependencies tree
- check all TypeScript packages for TS errors
- lint and format all staged files

# 0.3.10

- upgraded dependencies
- NVM support
- TSConfig: `jsx": "preserve"`
- TSConfig: absolute path in `extends` property (requires TS v3.2)

# 0.3.9

- TSLint: improved `early-exit` rule.
- TSLint: added `deprecation` warning.

# 0.3.8

- TSLint: exclude `node_modules`
- Prettier: HTML, MDX support

# 0.3.5

- TSConfig
  - Move `noEmit` from base config to templates.

# 0.3.4

- TSLint
  - Removed `no-unbound-method` rule.
  - Removed `no-inferred-empty-object-type` rule.

# 0.3.3

- TSLint
  - Removed `array-type` rule.

# 0.3.2

- TSConfig
  - Base config now contains only style related options.

# 0.3.1

- TSConfig

  - Removed `jsx` option.

- Monorepo:
  - Show report after type-check

# 0.3.0

- TSConfig:

  - Added base config

- TSLint:

  - Added `object-literal-shorthand` rule

- Monorepo:
  - Added `wsrun` and example scripts object

# 0.2.3

- TSConfig:
  - Added `"allowSyntheticDefaultImports": true`

# 0.2.2

- TSLint rules:
  - Removed `strict-type-predicates` rule.
  - Removed `ban-keywords` from `variable-name` rule.

# 0.2.1

- React support:

  - Added `jsx` to `tsconfig.json`.
  - Additional TSLint rules: `jsx-boolean-value`, `jsx-key`

- Removed deprecated TSLint rules:

  - `no-unused-variable`

# 0.2.0

- first release
