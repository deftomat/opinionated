import { cyan, gray, green, red, yellow } from 'chalk';
import ora from 'ora';
import prettyMs from 'pretty-ms';
import { parentPort, Worker, workerData } from 'worker_threads';
import { MonorepoPackageContext } from './context';

export interface StepResult {
  readonly result?: any;
  readonly hasWarning: boolean;
}

export async function step<T>({
  description,
  run,
  success = description,
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
      text: green(successText) + gray(` (${prettyMs(endAt - startAt)})`),
    });

    return { result, hasWarning: false };
  } catch (error) {
    if (error.isToolError) {
      const [first, ...rest] = error.messages;
      spinner.stopAndPersist({ symbol: red('❌ '), text: red(first) });
      rest.forEach(e => console.error(e));
      throw process.exit(1);
    } else if (error.isToolWarning) {
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

  const padding = new Array(32 - packageName.length).fill(' ').join('');

  console.warn('');
  console.warn(yellow.inverse('                                                               '));
  console.warn(yellow.inverse('                                                               '));
  console.warn(yellow.inverse.bold(`   Running in "${packageName}" sub-package...${padding}`));
  console.warn(yellow.inverse('                                                               '));
  console.warn(yellow.inverse(`   Please keep in mind that to check the whole project,        `));
  console.warn(yellow.inverse(`   you need to run this command in project's root directory!   `));
  console.warn(yellow.inverse('                                                               '));
  console.warn(yellow.inverse('                                                               '));
  console.warn('');
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
