/**
 * Partially copied from `lint-staged` project.
 */
import { spawnSync } from 'child_process';
import del from 'del';
import execa from 'execa';
import { resolve } from 'path';
import { debug } from './utils';

export type GitWorkflow = ReturnType<typeof createGitWorkflow>;

export function createGitWorkflow(cwd: string) {
  let workingCopyTree: any = null;
  let indexTree: any = null;
  let formattedIndexTree: any = null;
  let _gitDir: Promise<string | undefined>;

  function gitDir() {
    if (_gitDir === undefined) {
      // git cli uses GIT_DIR to fast track its response however it might be set to a different path
      // depending on where the caller initiated this from, hence clear GIT_DIR
      delete process.env.GIT_DIR;

      _gitDir = execGit(['rev-parse', '--show-toplevel'], { cwd }).then(
        path => path,
        () => undefined
      );
    }
    return _gitDir;
  }

  async function execGit(args, options?) {
    debug('Running git command', args);
    try {
      const { stdout } = await execa('git', args, options);
      return stdout;
    } catch (err) {
      throw new Error(err);
    }
  }

  async function getStagedFiles() {
    const cwd = await gitDir();
    const result = await execGit(
      ['diff', '--staged', '--diff-filter=ACM', '--name-only', '--relative'],
      { cwd }
    );

    return result
      .split('\n')
      .map(path => path.trim())
      .filter(path => path !== '')
      .map(path => resolve(`${cwd}/${path}`));
  }

  async function writeTree() {
    return execGit(['write-tree'], { cwd: await gitDir() });
  }

  async function getDiffForTrees(tree1, tree2) {
    debug(`Generating diff between trees ${tree1} and ${tree2}...`);
    return execGit(
      [
        'diff-tree',
        '--ignore-submodules',
        '--binary',
        '--no-color',
        '--no-ext-diff',
        '--unified=0',
        tree1,
        tree2
      ],
      { cwd: await gitDir() }
    );
  }

  async function hasPartiallyStagedFiles() {
    const stdout = await execGit(['status', '--porcelain'], { cwd: await gitDir() });
    if (!stdout) return false;

    const changedFiles = stdout.split('\n');
    const partiallyStaged = changedFiles.filter(line => {
      /**
       * See https://git-scm.com/docs/git-status#_short_format
       * The first letter of the line represents current index status,
       * and second the working tree
       */
      const [index, workingTree] = line;
      return index !== ' ' && workingTree !== ' ' && index !== '?' && workingTree !== '?';
    });

    return partiallyStaged.length > 0;
  }

  // eslint-disable-next-line
  async function stashSave() {
    debug('Stashing files...');
    // Save ref to the current index
    indexTree = await writeTree();
    // Add working copy changes to index
    await execGit(['add', '.'], { cwd: await gitDir() });
    // Save ref to the working copy index
    workingCopyTree = await writeTree();
    // Restore the current index
    await execGit(['read-tree', indexTree], { cwd: await gitDir() });
    // Remove all modifications
    await execGit(['checkout-index', '-af'], { cwd: await gitDir() });
    // await execGit(['clean', '-dfx'], options)
    debug('Done stashing files!');
    return [workingCopyTree, indexTree];
  }

  async function updateStash() {
    formattedIndexTree = await writeTree();
    return formattedIndexTree;
  }

  async function applyPatchFor(tree1, tree2) {
    const diff = await getDiffForTrees(tree1, tree2);
    /**
     * This is crucial for patch to work
     * For some reason, git-apply requires that the patch ends with the newline symbol
     * See http://git.661346.n2.nabble.com/Bug-in-Git-Gui-Creates-corrupt-patch-td2384251.html
     * and https://stackoverflow.com/questions/13223868/how-to-stage-line-by-line-in-git-gui-although-no-newline-at-end-of-file-warnin
     */
    if (diff) {
      try {
        /**
         * Apply patch to index. We will apply it with --reject so it it will try apply hunk by hunk
         * We're not interested in failied hunks since this mean that formatting conflicts with user changes
         * and we prioritize user changes over formatter's
         */
        await execGit(
          ['apply', '-v', '--whitespace=nowarn', '--reject', '--recount', '--unidiff-zero'],
          {
            input: `${diff}\n`,
            cwd: await gitDir()
          }
        );
      } catch (err) {
        debug('Could not apply patch to the stashed files cleanly');
        debug(err);
        debug('Patch content:');
        debug(diff);
        throw new Error('Could not apply patch to the stashed files cleanly.' + err);
      }
    }
  }

  async function stashPop() {
    if (workingCopyTree === null) {
      throw new Error('Trying to restore from stash but could not find working copy stash.');
    }

    debug('Restoring working copy');
    // Restore the stashed files in the index
    await execGit(['read-tree', workingCopyTree], { cwd: await gitDir() });
    // and sync it to the working copy (i.e. update files on fs)
    await execGit(['checkout-index', '-af'], { cwd: await gitDir() });

    // Then, restore the index after working copy is restored
    if (indexTree !== null && formattedIndexTree === null) {
      // Restore changes that were in index if there are no formatting changes
      debug('Restoring index');
      await execGit(['read-tree', indexTree], { cwd: await gitDir() });
    } else {
      /**
       * There are formatting changes we want to restore in the index
       * and in the working copy. So we start by restoring the index
       * and after that we'll try to carry as many as possible changes
       * to the working copy by applying the patch with --reject option.
       */
      debug('Restoring index with formatting changes');
      await execGit(['read-tree', formattedIndexTree], { cwd: await gitDir() });
      try {
        await applyPatchFor(indexTree, formattedIndexTree);
      } catch (err) {
        debug(
          'Found conflicts between formatters and local changes. Formatters changes will be ignored for conflicted hunks.'
        );
        /**
         * Clean up working directory from *.rej files that contain conflicted hanks.
         * These hunks are coming from formatters so we'll just delete them since they are irrelevant.
         */
        try {
          const rejFiles = await del(['*.rej']);
          debug('Deleted files and folders:\n', rejFiles.join('\n'));
        } catch (delErr) {
          debug('Error deleting *.rej files', delErr);
        }
      }
    }
    // Clean up references
    workingCopyTree = null;
    indexTree = null;
    formattedIndexTree = null;

    return null;
  }

  async function stageFile(path: string) {
    return execGit(['add', path], { cwd: await gitDir() });
  }

  async function isGitRepository() {
    try {
      await execGit(['rev-parse', '--git-dir']);
      return true;
    } catch (error) {
      return false;
    }
  }

  async function hasChanges(): Promise<boolean> {
    const changed = spawnSync('git', ['status', '--porcelain', '-uall']);
    if (changed.status !== 0) throw Error(changed.stderr.toString());
    return changed.stdout.toString().trim() !== '';
  }

  return {
    stageFile,
    isGitRepository,
    stashSave,
    stashPop,
    hasPartiallyStagedFiles,
    updateStash,
    exec: execGit,
    getStagedFiles,
    hasChanges
  };
}
