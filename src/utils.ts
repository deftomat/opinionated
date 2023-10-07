import chalk from 'chalk';
import ora from 'ora';
import prettyMs from 'pretty-ms';
import stripAnsi from 'strip-ansi';
import { parentPort, Worker, workerData } from 'node:worker_threads';
import { MonorepoPackageContext } from './context.js';
import { ToolError, ToolWarning } from './errors.js';

const { bold, cyan, gray, green, red, yellow } = chalk;

export interface StepResult {
  readonly result?: any;
  readonly hasWarning: boolean;
}

export async function step<T>({
  description,
  run,
  success = description
}: {
  description: string;
  run: (() => Promise<T>) | (() => T);
  success?: ((result: T) => string) | string;
}): Promise<StepResult> {
  const spinner = ora({ text: cyan(description) }).start();
  await delay(700);

  try {
    const startAt = Date.now();
    const result = await run();
    const endAt = Date.now();

    const successText = typeof success === 'function' ? success(result) : success;
    spinner.stopAndPersist({
      symbol: green('✔'),
      text: green(successText) + gray(` (${prettyMs(endAt - startAt)})`)
    });

    return { result, hasWarning: false };
  } catch (error) {
    if (ToolError.is(error)) {
      const [first, ...rest] = error.messages;
      spinner.stopAndPersist({ symbol: red('❌ '), text: red(first) });
      rest.forEach(e => console.error(e));
      throw process.exit(1);
    } else if (ToolWarning.is(error)) {
      const [first, ...rest] = error.messages;
      spinner.stopAndPersist({ symbol: yellow('⚠️ '), text: yellow(first) });
      rest.forEach(e => console.error(e));
      return { hasWarning: true };
    } else {
      spinner.stopAndPersist({ symbol: red('❌ '), text: red(description) });
      console.error(error);
      throw process.exit(1);
    }
  }
}

export function delay(time: number) {
  return new Promise(resolve => setTimeout(resolve, time));
}

export function debug(...args: any[]) {
  if (process.env.DEBUG === 'true') {
    console.info(...args.map(arg => yellow(arg)));
  }
}

export function isNotNil<T>(value: T | null | undefined): value is T {
  return value != null;
}

export function populated(value: any): boolean {
  if (value == null) return false;
  if (Buffer.isBuffer(value)) return (value as Buffer).length > 0;
  return value !== '';
}

export function renderOnePackageWarning(context: MonorepoPackageContext) {
  const packageName: string =
    context.packageSpec.get().name || context.packageRoot.split('/').pop();

  const banner = asBanner([
    bold(`Running in "${packageName}" sub-package...\n`),
    `Please keep in mind that to check the whole project,`,
    `you need to run this command in project's root directory!`
  ]);

  console.warn('');
  console.warn(yellow.inverse(banner));
  console.warn('');
}

function asBanner(lines: string[]): string {
  const normalized = lines.flatMap(line => line.split('\n')).map(line => ` ${line.trim()} `);

  const maxLength = normalized
    .map(stripAnsi)
    .map(line => line.length)
    .reduce((max, length) => (max > length ? max : length), 0);

  const content = normalized
    .map(line => line + spacing(maxLength - stripAnsi(line).length))
    .join('\n');

  return `${spacing(maxLength)}\n${content}\n${spacing(maxLength)}`;
}

function spacing(length: number): string {
  return Array.from(Array(length)).fill(' ').join('');
}

export function asWorkerMaster<T extends Function>(workerFilename: string): AlwaysPromiseResult<T> {
  return ((...args) => {
    return new Promise((resolve, reject) => {
      const worker = new Worker(workerFilename, { workerData: args });
      worker.on('message', ({ value, error }) => {
        if (error) {
          reject(error);
        } else {
          resolve(value);
        }
      });
      worker.on('error', reject);
      worker.on('exit', code => {
        if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
      });
    });
  }) as any;
}

export async function runAsWorkerSlave(fn: Function) {
  if (parentPort == null) throw Error('Unexpected process state!');
  try {
    const value = await fn(...workerData);
    parentPort.postMessage({ value });
  } catch (error) {
    parentPort.postMessage({ error });
  }
}

type AlwaysPromiseResult<T> = T extends (...args: any[]) => Promise<any>
  ? T
  : T extends (...args: infer I) => infer O
  ? (...args: I) => Promise<O>
  : never;
