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
    "isolatedModules": false,
    "lib": ["ES2019"],
    "jsx":"preserve",
    "module": "ESNext",
    "moduleResolution": "node",
    "noEmit": true,
    "skipLibCheck": true,
    "sourceMap": true,
    "target": "ES2019"
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
    "node": ">=12.0.0"
  },
  "scripts": {
    "checkup": "opinionated checkup"
  },
  "dependencies": {},
  "devDependencies": {
    "@deftomat/opinionated": "<PKG_VERSION>",
    "husky": "^4.0.0"
  },
  "husky": {
    "hooks": {
      "pre-commit": "opinionated pre-commit"
    }
  },
  "workspaces": [
    "packages/*"
  ]
}

```
