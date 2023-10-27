import fs from 'node:fs';
import { Context } from './context.js';

/**
 * Ensures that project has the necessary configs in place.
 */
export function ensureConfigs(
  context: Context,
  { autoStage = false }: { autoStage?: boolean } = {}
): Promise<string[]> {
  return Promise.all([
    ensureEditorConfig(context, autoStage),
    ensurePrettierConfig(context, autoStage)
    // ensureEslintConfig(context, autoStage),
  ]).then(results => results.filter(isString));
}

function isString(value: string | undefined): value is string {
  return typeof value === 'string';
}

async function ensureEditorConfig(
  context: Context,
  autoStage: boolean
): Promise<string | undefined> {
  const { projectRoot, git } = context;
  const configPath = `${projectRoot}/.editorconfig`;

  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, defaultEditorConfig);
    if (autoStage) await git.stageFile(configPath);
    return 'EditorConfig';
  }
}

async function ensurePrettierConfig(
  context: Context,
  autoStage: boolean
): Promise<string | undefined> {
  const { projectRoot, projectSpec, git } = context;
  const possibleConfigFiles = [
    '.prettierrc',
    '.prettierrc.yaml',
    '.prettierrc.yml',
    '.prettierrc.json',
    '.prettierrc.toml',
    '.prettierrc.js',
    'prettier.config.mjs'
  ];

  const spec = projectSpec.get();

  const hasConfig =
    spec.prettier != null ||
    possibleConfigFiles.some(filename => fs.existsSync(`${projectRoot}/${filename}`));

  if (!hasConfig) {
    projectSpec.set({ ...spec, prettier: '@deftomat/opinionated/configs/prettier.config.mjs' });
    if (autoStage) await git.stageFile(projectSpec.path);
    return 'Prettier';
  }
}

// NOT ENABLED YET
// async function ensureEslintConfig(
//   context: Context,
//   autoStage: boolean
// ): Promise<string | undefined> {
//   const { projectRoot, projectSpec, git } = context;
//   const possibleConfigFiles = [
//     '.eslintrc',
//     '.eslintrc.yaml',
//     '.eslintrc.yml',
//     '.eslintrc.json',
//     '.eslintrc.toml',
//     '.eslintrc.js',
//     'eslintrc.config.js'
//   ];

//   const spec = projectSpec.get();

//   const hasConfig =
//     spec.eslintConfig != null ||
//     possibleConfigFiles.some(filename => fs.existsSync(`${projectRoot}/${filename}`));

//   if (!hasConfig) {
//     projectSpec.set({
//       ...spec,
//       eslintConfig: { extends: ['./node_modules/@deftomat/opinionated/configs/eslint'] }
//     });
//     if (autoStage) await git.stageFile(projectSpec.path);
//     return 'ESLint';
//   }
// }

const defaultEditorConfig = `# http://EditorConfig.org

[*]
charset = utf-8
end_of_line = lf
indent_size = 2
indent_style = space
insert_final_newline = true
trim_trailing_whitespace = true
`;
