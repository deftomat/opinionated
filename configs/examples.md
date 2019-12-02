**.gitignore:**

```
.idea
.vscode/*
!.vscode/extensions.json
!.vscode/launch.json
!.vscode/tasks.json
.serverless
node_modules
coverage
build
yarn-error.log
__diff_output__
```

**tsconfig.json:**

```
{
  "extends": "@deftomat/opinionated/configs/tsconfig.json",
  "compilerOptions": {
    "baseUrl": "./",
    "isolatedModules": false,
    "lib": ["es2017", "esnext.asynciterable", "es2018.promise"],
    "jsx":"preserve",
    "module": "esnext",
    "moduleResolution": "node",
    "noEmit": true,
    "skipLibCheck": true,
    "sourceMap": true,
    "target": "esnext"
  },
  "exclude": [
    "**/node_modules/",
    "**/build/",
    "**/coverage/",
    "**/.serverless/"
  ],
}
```

**package.json:**

```
{
  "name": "<NAME>",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "checkup": "opinionated checkup"
  },
  "husky": {
    "hooks": {
      "pre-commit": "opinionated pre-commit"
    }
  },
  "dependencies": {},
  "devDependencies": {
    "@deftomat/opinionated": "<PKG_VERSION>",
    "husky": "^3.0.0"
  },
  "workspaces": [
    "packages/*"
  ]
}
```
