import chalk from 'chalk';
import { findUpSync } from 'find-up';
import { globSync } from 'glob';
import fs from 'node:fs';
import path from 'node:path';
import { ToolError } from './errors.js';
import { GitWorkflow, createGitWorkflow } from './git.js';

const { bold, red } = chalk;

export type Context = MonorepoContext | MonorepoPackageContext | PackageContext;

export interface MonorepoContext {
  readonly type: 'monorepo';
  readonly projectRoot: string;
  readonly projectSpec: SpecConnector;

  /**
   * List of packages in the monorepo (absolute path).
   */
  readonly packages: string[];

  readonly packageRoot: undefined;
  readonly packageSpec: undefined;
  readonly cachePath: string;
  readonly git: GitWorkflow;
}

export interface MonorepoPackageContext {
  readonly type: 'monorepo-package';
  readonly projectRoot: string;
  readonly projectSpec: SpecConnector;
  readonly packageRoot: string;
  readonly packageSpec: SpecConnector;
  readonly cachePath: string;
  readonly git: GitWorkflow;
}

export interface PackageContext {
  readonly type: 'package';
  readonly projectRoot: string;
  readonly projectSpec: SpecConnector;
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

/**
 * Returns the tool context for the given working directory.
 */
export function describeContext(cwd: string): Context {
  try {
    const specConnector = toSpecConnector(`${cwd}/package.json`);
    const spec = specConnector.get();
    const packageContext: PackageContext = {
      type: 'package',
      projectRoot: cwd,
      projectSpec: specConnector,
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
        packages: listProjectPackages(cwd),
        packageRoot: undefined,
        packageSpec: undefined,
        cachePath: toCachePath(cwd),
        git: createGitWorkflow(cwd)
      };
      return context;
    }

    const parent = findUpSync('package.json', { cwd: `${cwd}/../` });
    if (parent == null) return packageContext;

    const parentSpecConnector = toSpecConnector(parent);
    const parentSpec = parentSpecConnector.get();
    if (parentSpec.workspaces) {
      const parentRoot = path.dirname(parent);
      const context: MonorepoPackageContext = {
        type: 'monorepo-package',
        projectRoot: parentRoot,
        projectSpec: parentSpecConnector,
        packageRoot: cwd,
        packageSpec: specConnector,
        cachePath: toCachePath(parentRoot),
        git: createGitWorkflow(parentRoot)
      };
      return context;
    }

    return packageContext;
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new ToolError(
        red(
          `No ${bold(
            'package.json'
          )} found! Please make sure that you run this command in the root of JS/TS project.`
        )
      );
    }

    throw Error(`Unexpected error:\n${error}`);
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

/**
 * Returns a list of packages and their absolute paths in the project.
 *
 * If the project is a part of the monorepo, then it returns all packages.
 * Otherwise, it returns the project itself as a package.
 */
function listProjectPackages(projectRoot: string): string[] {
  const manifest = JSON.parse(fs.readFileSync(`${projectRoot}/package.json`).toString());

  if (manifest.workspaces == null) return [projectRoot];

  return (manifest.workspaces as string[])
    .flatMap(pattern => globSync(pattern, { cwd: projectRoot, absolute: true }))
    .filter(root => fs.lstatSync(root).isDirectory())
    .filter(root => fs.existsSync(`${root}/package.json`));
}
