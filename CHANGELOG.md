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
