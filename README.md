# Opinionated

Opinionated tooling for TypeScript projects.

## Why?

Because you don't want to copy/paste config files for all your tools into each project.

## Description

Provides a fully featured pre-commit command which will run the following checks:

- check yarn.lock integrity
- check all TypeScript packages for TS errors
- lint and format all staged files

## Included configs

- TSLint rules for TypeScript & JavaScript
- [prettier config](https://prettier.io/)
- [editor config](https://editorconfig.org/)
- recommended `tsconfig.json`
- additional items like `.gitignore`, readme file, etc
