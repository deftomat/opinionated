**.gitignore:**

```
.idea
.vscode/*
!.vscode/extensions.json
!.vscode/launch.json
!.vscode/tasks.json

node_modules
yarn-error.log
__diff_output__
coverage
.serverless
dist
build
*.tsbuildinfo

.DS_Store
```

**tsconfig.json:**

```
{
  "extends": "@deftomat/opinionated/configs/tsconfig.json",
  "compilerOptions": {
    "baseUrl": "./",
    "isolatedModules": true,
    "lib": ["ES2020"],
    "jsx":"preserve",
    "module": "ESNext",
    "moduleResolution": "node",
    "noEmit": true,
    "skipLibCheck": true,
    "sourceMap": true,
    "target": "ES2020"
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
  "engines": {
    "node": ">=18.0.0"
  },
  "scripts": {
    "checkup": "opinionated checkup",
    "prepare": "husky install"
  },
  "dependencies": {},
  "devDependencies": {
    "@deftomat/opinionated": "<PKG_VERSION>",
    "husky": "^8.0.0"
  },
  "workspaces": [
    "packages/*"
  ]
}

```
