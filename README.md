# Opinionated

Opinionated tooling for TypeScript projects.

## Why?

Because you don't want to copy/paste config files for all your tools into each project.

## Includes

- TSLint rules for TypeScript & JavaScript.
- [Prettier config](https://prettier.io/).
- [Editor config](https://editorconfig.org/).
- Pre-commit hook to check & fix staged files.
- Recommended `tsconfig.json`.
- Additional items like `.gitignore`, readme file, etc.

## Usage

```
npx @deftomat/opinionated [TYPE] [APP-NAME]
```

**Example**

```
npx @deftomat/opinionated private-monorepo my-app
```

**Supported types**

- `private-monorepo`
