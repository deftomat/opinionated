<h1 align="center">Opinionated 🙏</h1>

<h3 align="center">Opinionated tooling for JavaScript & TypeScript projects.</h3>

## Why?

Because orchestrating all the tools, linters, formatters, etc. in each project can took a long time
and their configuration will differ more and more as you will copy it between multiple projects.

**Opinionated** provides everything in one place and upgrading your tool chain is as easy as upgrading the dependency version.

## Installation

```
$ yarn add @deftomat/opinionated --dev
```

## Usage

Tool provides the following commands:

### > Pre-commit

```
$ opinionated pre-commit
```

Pre-commit command will try to run simple, auto-fixable operations on staged files.
Operations includes common ESLint rules, Prettier, etc.

Command is designed to be opaque and hassle free, so theoretically, pre-commit check should pass for 99% of commits without any error or warning.

### > Checkup

```
$ opinionated checkup
```

Checkup command allows you to keep your project in top shape.

Command includes:

- **Engine check** - Ensures that you are using the right NodeJS version.
- **Integrity** - (yarn only) Ensures that dependencies are installed properly.
- **Dependency duplicates check** - (yarn only) Ensures no unnecessary dependency duplicates. Especially useful for monorepos.
- **Linter** - Strict ESLint rules.
- **TypeScript check** - Detects type errors and unused code.
- **Formatting** - Runs Prettier.

Command is aware of _yarn workspaces_ and is able to run checks on whole monorepo or just in one package.
To run checks in all packages, just run it in project's root. To run checks in one package, you need to run it in package's directory.

> 💡 We recommend to run this command before pull requests and deployments.

### > Ensure configs

```
$ opinionated ensure-configs
```

Command will add the following configs if necessary:

- [EditorConfig](https://editorconfig.org/) - Makes sure that every developer use the same indentation, charset, EOF, etc.
- [Prettier](https://prettier.io/) - Makes sure that every supported editor use the same auto-formatting rules.
- [.nvmrc](https://github.com/nvm-sh/nvm) - Allows to automatically switch to the correct NodeJS version by running `nvm use` command in project's directory.

> 💡 This command is usually not necessary as every other command runs it by default.

## Integration into project

To integrate the tool into your project, we recommend the following `packages.json`:

```
{
  ...
  "scripts": {
    "checkup": "opinionated checkup"
  },
  "husky": {
    "hooks": {
      "pre-commit": "opinionated pre-commit"
    }
  },
  "devDependencies": {
    "@deftomat/opinionated": "^0.5.0",
    "husky": "^3.0.0"
  }
  ...
}
```

This configuration allows you to automatically run _pre-commit_ check before each commit (via [Husky](https://github.com/typicode/husky) git hook) and provides `yarn checkup` to easily run _checkup_ command.

## Custom ESLint rules

If you need to alter the predefined ESLint rules, just follow the [ESLint configuration guide](https://eslint.org/docs/user-guide/configuring).

Any rule specified in your configuration file will be merged over build-in configuration. This allows you to add/edit/remove any rule you want.

## Ignoring files and directories

As tool is using ESLint and Prettier, you can follow their guidelines to ignore any file or directory.

However, when tool detects, that there are no _.ignore_ file for these tools, then it tries to use `.opinionatedignore`
file which will be applied to both ESLint and Prettier. If there is no `.opinionatedignore`, then `.gitignore` will be used.

**Resolution order for ESLint:**

- `.eslintignore`
- `eslintIgnore` property in `package.json`
- `.opinionatedignore`
- `.gitignore`

**Resolution order for Prettier:**

- `.prettierignore`
- `.opinionatedignore`
- `.gitignore`
