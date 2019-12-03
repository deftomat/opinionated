import { bold, gray, magenta, red, yellow } from 'chalk';
import program from 'commander';
import inquirer from 'inquirer';
import { registerExitHandlers } from './src/cleanup';
import { ensureConfigs } from './src/configs';
import { Context, describeContext, isMonorepoPackageContext } from './src/context';
import { lint } from './src/eslint';
import { format } from './src/format';
import { checkNodeVersion } from './src/nodeVersion';
import { preCommit } from './src/preCommit';
import { getIncompleteChecks, updateIncompleteChecks } from './src/store';
import { containsTypeScript, runTypeCheck } from './src/typeCheck';
import { renderOnePackageWarning, step, StepResult } from './src/utils';
import { checkLockDuplicates, checkLockIntegrity, fixLockDuplicates, usesYarn } from './src/yarn';

const { version, description } = require('../package.json');

registerExitHandlers();

program.version(version, '-v, --vers', 'output the current version').description(description);

program
  .command('pre-commit')
  .description('Run pre-commit checks.')
  .action(handlePreCommit);

program
  .command('checkup')
  .description('Check up the project.')
  .action(handleCheckup);

program
  .command('ensure-configs')
  .description(
    'Ensure that all necessary configs are in place.\n\n' +
      'In a normal conditions, running this command is not necessary as \neach check ensures that all configs are in place.'
  )
  .action(handleEnsureConfigs);

program.on('command:*', () => {
  console.error(
    red('Invalid command: %s\nSee --help for a list of available commands.'),
    program.args.join(' ')
  );
});

program.parse(process.argv);
if (!process.argv.slice(2).length) {
  program.outputHelp(red);
}

async function handlePreCommit(cmd) {
  const context = await prepareContext({ autoStage: true });

  await step({
    description: 'Running pre-commit checks',
    run: () => preCommit(context)
  });
}

async function handleCheckup(cmd) {
  const context = await prepareContext({ autoStage: false });
  if (isMonorepoPackageContext(context)) renderOnePackageWarning(context);

  const incompleteChecks = getIncompleteChecks(context);

  const { requiredChecks, autoFix } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'requiredChecks',
      message: 'Select checkup operations:',
      choices: [
        {
          checked: incompleteChecks.size > 0 ? incompleteChecks.has('engine') : true,
          name: `${bold('Engine check')} - ensures that you are using the right NodeJS version`,
          short: 'Engine check',
          value: 'engine'
        },
        usesYarn(context) && {
          checked: incompleteChecks.size > 0 ? incompleteChecks.has('integrity') : true,
          name: `${bold('Integrity')} - ensures that dependencies are installed properly`,
          short: 'Integrity check',
          value: 'integrity'
        },
        usesYarn(context) && {
          checked: incompleteChecks.size > 0 ? incompleteChecks.has('duplicates') : true,
          name: `${bold(
            'Dependency duplicates check'
          )} - ensures no unnecessary dependency duplicates`,
          short: 'Duplicates',
          value: 'duplicates'
        },
        {
          checked: incompleteChecks.size > 0 ? incompleteChecks.has('eslint') : true,
          name: `${bold('Linter')} - runs ESLint`,
          short: 'Linter',
          value: 'eslint'
        },
        containsTypeScript(context) && {
          checked: incompleteChecks.size > 0 ? incompleteChecks.has('typescript') : true,
          name: `${bold('TypeScript check')} - detects type errors and unused code`,
          short: 'TypeScript',
          value: 'typescript'
        },
        {
          checked: incompleteChecks.size > 0 ? incompleteChecks.has('prettier') : false,
          name: `${bold('Formatting')} - runs Prettier`,
          short: 'Prettier',
          value: 'prettier'
        }
      ].filter(Boolean)
    },
    {
      type: 'confirm',
      name: 'autoFix',
      message: 'Do you want to auto-fix any issues if possible?',
      default: false,
      when: ({ requiredChecks }) =>
        requiredChecks.includes('eslint') || requiredChecks.includes('duplicates')
    }
  ]);

  if ((await context.git.hasChanges()) && (autoFix || requiredChecks.includes('prettier'))) {
    const { shouldRun } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'shouldRun',
        message: yellow(
          'Selected operations may affect your uncommitted files! Do you want to continue?'
        ),
        default: false
      }
    ]);
    if (!shouldRun) process.exit();
  }

  updateIncompleteChecks(context, requiredChecks);

  const checks: Check[] = [];

  checks.push({
    name: 'engine',
    enabled: requiredChecks.includes('engine'),
    description: 'Checking NodeJS version',
    run: () => checkNodeVersion(context)
  });

  checks.push({
    name: 'integrity',
    enabled: requiredChecks.includes('integrity'),
    description: 'Checking yarn.lock integrity',
    run: () => checkLockIntegrity(context)
  });

  checks.push({
    name: 'duplicates',
    enabled: requiredChecks.includes('duplicates') && autoFix,
    description: 'Removing dependency duplicates',
    run: () => fixLockDuplicates(context)
  });

  checks.push({
    name: 'duplicates',
    enabled: requiredChecks.includes('duplicates') && !autoFix,
    description: 'Detecting dependency duplicates',
    run: () => checkLockDuplicates(context)
  });

  checks.push({
    name: 'eslint',
    enabled: requiredChecks.includes('eslint') && autoFix,
    description: 'Linting & auto-fixing via ESLint',
    run: () => lint({ context, autoFix: true })
  });

  checks.push({
    name: 'eslint',
    enabled: requiredChecks.includes('eslint') && !autoFix,
    description: 'Linting via ESLint',
    run: () => lint({ context, autoFix: false })
  });

  checks.push({
    name: 'typescript',
    enabled: requiredChecks.includes('typescript'),
    description: 'Running TypeScript checks',
    run: () => runTypeCheck(context)
  });

  checks.push({
    name: 'prettier',
    enabled: requiredChecks.includes('prettier'),
    description: 'Formatting with Prettier',
    run: () => format(context)
  });

  const missingChecks = new Set<string>(requiredChecks);

  for (const check of checks) {
    if (!check.enabled) continue;

    check.result = await step({
      description: check.description,
      run: check.run
    });

    missingChecks.delete(check.name);
    updateIncompleteChecks(context, missingChecks);
  }

  // If any of the checks ends with warning
  if (checks.some(check => check.result !== undefined && check.result.hasWarning)) return;

  if (!isMonorepoPackageContext(context) && requiredChecks.size > 0) {
    console.info(magenta(`🎉  All good!`));
  }
}

interface Check {
  readonly name: string;
  readonly enabled: boolean;
  readonly description: string;
  result?: StepResult;
  run(): void;
}

async function handleEnsureConfigs(cmd) {
  const context = describeContext(process.cwd());

  await step({
    description: 'Checking necessary configs',
    run: () => ensureConfigs({ context }),
    success: (addedConfigs: string[]) => {
      if (addedConfigs.length > 0) {
        return `The following configs have been added into project: ${addedConfigs.join(', ')}`;
      } else {
        return 'All configs are in place';
      }
    }
  });
}

async function prepareContext({ autoStage }: { autoStage: boolean }): Promise<Context> {
  try {
    const context = describeContext(process.cwd());

    if (!(await context.git.isGitRepository())) {
      throw Error('Failed to run! Project must be the GIT repository.');
    }

    const addedConfigs = await ensureConfigs({ context, autoStage });
    if (addedConfigs.length > 0)
      console.info(
        gray(`[The following configs have been added into project: ${addedConfigs.join(', ')}]`)
      );

    return context;
  } catch (e) {
    console.error(red(e.message));
    throw process.exit(1);
  }
}
