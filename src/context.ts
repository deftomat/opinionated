import { bold, red } from 'chalk';
import findUp from 'find-up';
import fs from 'fs';
import path from 'path';
import { ToolError } from './errors';
import { createGitWorkflow, GitWorkflow } from './git';

export type Context = MonorepoContext | MonorepoPackageContext | PackageContext;

export interface MonorepoContext {
  readonly type: 'monorepo';
  readonly projectRoot: string;
  readonly projectSpec: SpecConnector;
  readonly packagesPath: string;
  readonly packageRoot: null;
  readonly packageSpec: null;
  readonly cachePath: string;
  readonly git: GitWorkflow;
}

export interface MonorepoPackageContext {
  readonly type: 'monorepo-package';
  readonly projectRoot: string;
  readonly projectSpec: SpecConnector;
  readonly packagesPath: string;
  readonly packageRoot: string;
  readonly packageSpec: SpecConnector;
  readonly cachePath: string;
  readonly git: GitWorkflow;
}

export interface PackageContext {
  readonly type: 'package';
  readonly projectRoot: string;
  readonly projectSpec: SpecConnector;
  readonly packagesPath: null;
  readonly packageRoot: string;
  readonly packageSpec: SpecConnector;
  readonly cachePath: string;
  readonly git: GitWorkflow;
}

export function isMonorepoContext(context: Context): context is MonorepoContext {
  return context.type === 'monorepo';
}

export function isMonorepoPackageContext(context: Context): context is MonorepoPackageContext {
  return context.type === 'monorepo-package';
}

export function isPackageContext(context: Context): context is PackageContext {
  return context.type === 'package';
}

export function describeContext(cwd: string): Context {
  try {
    const specConnector = toSpecConnector(`${cwd}/package.json`);
    const spec = specConnector.get();
    const packageContext: PackageContext = {
      type: 'package',
      projectRoot: cwd,
      projectSpec: specConnector,
      packagesPath: null,
      packageRoot: cwd,
      packageSpec: specConnector,
      cachePath: toCachePath(cwd),
      git: createGitWorkflow(cwd)
    };

    if (spec.workspaces) {
      const context: MonorepoContext = {
        type: 'monorepo',
        projectRoot: cwd,
        projectSpec: specConnector,
        packagesPath: `${cwd}/packages`,
        packageRoot: null,
        packageSpec: null,
        cachePath: toCachePath(cwd),
        git: createGitWorkflow(cwd)
      };
      return context;
    }

    const parent = findUp.sync('package.json', { cwd: `${cwd}/../` });
    if (parent == null) return packageContext;

    const parentSpecConnector = toSpecConnector(parent);
    const parentSpec = parentSpecConnector.get();
    if (parentSpec.workspaces) {
      const parentRoot = path.dirname(parent);
      const context: MonorepoPackageContext = {
        type: 'monorepo-package',
        projectRoot: parentRoot,
        projectSpec: parentSpecConnector,
        packagesPath: `${parentRoot}/packages`,
        packageRoot: cwd,
        packageSpec: specConnector,
        cachePath: toCachePath(parentRoot),
        git: createGitWorkflow(parentRoot)
      };
      return context;
    }

    return packageContext;
  } catch (e) {
    if (e.code === 'ENOENT') {
      throw new ToolError(
        red(
          `No ${bold(
            'package.json'
          )} found! Please make sure that you run this command in the root of JS/TS project.`
        )
      );
    }

    throw Error(`Unexpected error:\n${e}`);
  }
}

interface SpecConnector {
  readonly path: string;
  get(): any;
  set(content: string): void;
}

function toSpecConnector(path: string): SpecConnector {
  return {
    path,
    get() {
      return JSON.parse(fs.readFileSync(path).toString());
    },
    set(content: string) {
      fs.writeFileSync(path, JSON.stringify(content, null, 2));
    }
  };
}

function toCachePath(projectRoot: string): string {
  return `${projectRoot}/node_modules/.cache/opinionated`;
}
