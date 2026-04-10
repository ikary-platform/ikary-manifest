import { resolve, join } from 'node:path';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import prompts from 'prompts';
import yaml from 'yaml';
import * as fmt from '../output/format.js';
import { theme } from '../output/theme.js';
import { scaffoldPrimitiveFiles, toPascalCase } from '@ikary/primitive-contract';
import type { IkaryPrimitivesConfig } from '@ikary/primitive-contract';

const CATEGORIES = ['data', 'form', 'layout', 'feedback', 'navigation', 'custom'] as const;
type Category = (typeof CATEGORIES)[number];

function toLabel(name: string): string {
  return name
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

async function readOrCreateConfig(configPath: string): Promise<IkaryPrimitivesConfig> {
  if (existsSync(configPath)) {
    const raw = await readFile(configPath, 'utf-8');
    return yaml.parse(raw) as IkaryPrimitivesConfig;
  }
  return {
    apiVersion: 'ikary.co/v1alpha1',
    kind: 'PrimitiveConfig',
    primitives: [],
  };
}

export async function primitiveAddCommand(
  name: string,
  options: { category?: string; label?: string; description?: string },
): Promise<void> {
  fmt.section('Add primitive');
  fmt.newline();

  const cwd = process.cwd();
  const primitivesDir = join(cwd, 'primitives', name);
  const configPath = join(cwd, 'ikary-primitives.yaml');

  if (existsSync(primitivesDir)) {
    fmt.error(`Primitive ${theme.accent(name)} already exists at ${theme.muted(primitivesDir)}`);
    process.exitCode = 1;
    return;
  }

  if (!/^[a-z][a-z0-9-]*$/.test(name)) {
    fmt.error(`Primitive name must be lowercase letters, numbers, and hyphens (e.g. my-widget)`);
    process.exitCode = 1;
    return;
  }

  const answers = await prompts(
    [
      {
        type: options.label ? null : 'text',
        name: 'label',
        message: 'Display label',
        initial: toLabel(name),
        validate: (v: string) => v.trim().length > 0 || 'Required',
      },
      {
        type: options.description ? null : 'text',
        name: 'description',
        message: 'Short description',
        initial: `A custom ${toLabel(name)} primitive`,
      },
      {
        type: options.category ? null : 'select',
        name: 'category',
        message: 'Category',
        choices: CATEGORIES.map((c) => ({ title: c, value: c })),
        initial: CATEGORIES.indexOf('custom'),
      },
    ],
    { onCancel: () => process.exit(0) },
  );

  const label = options.label ?? answers.label ?? toLabel(name);
  const description = options.description ?? answers.description ?? '';
  const category = (options.category ?? answers.category ?? 'custom') as Category;

  if (!CATEGORIES.includes(category as Category)) {
    fmt.error(`Invalid category ${theme.accent(category)}. Must be one of: ${CATEGORIES.join(', ')}`);
    process.exitCode = 1;
    return;
  }

  const PascalName = toPascalCase(name);
  const spinner = fmt.createSpinner('Scaffolding files...');
  spinner.start();

  try {
    await mkdir(primitivesDir, { recursive: true });

    const files = scaffoldPrimitiveFiles({ name, label, description, category });
    for (const [relativePath, content] of Object.entries(files)) {
      await writeFile(resolve(cwd, relativePath), content, 'utf-8');
    }

    // Update ikary-primitives.yaml
    const config = await readOrCreateConfig(configPath);
    config.primitives.push({
      key: name,
      version: '1.0.0',
      source: `./primitives/${name}/${PascalName}.register.ts`,
      contract: `./primitives/${name}/${name}.contract.yaml`,
      examples: `./primitives/${name}/${PascalName}.example.ts`,
    });
    await writeFile(configPath, yaml.stringify(config), 'utf-8');

    spinner.succeed(theme.success(`Created ${theme.accent(name)} primitive`));
    fmt.newline();

    fmt.body(`  ${theme.accent(`primitives/${name}/${PascalName}.tsx`)}              React component`);
    fmt.body(`  ${theme.accent(`primitives/${name}/${PascalName}PresentationSchema.ts`)}  Zod props schema`);
    fmt.body(`  ${theme.accent(`primitives/${name}/${name}.contract.yaml`)}        Human-readable contract`);
    fmt.body(`  ${theme.accent(`primitives/${name}/${PascalName}.resolver.ts`)}         Props resolver`);
    fmt.body(`  ${theme.accent(`primitives/${name}/${PascalName}.register.ts`)}          Registration`);
    fmt.body(`  ${theme.accent(`primitives/${name}/${PascalName}.example.ts`)}            Example scenarios`);
    fmt.body(`  ${theme.accent('ikary-primitives.yaml')}                       Updated`);
    fmt.newline();
    fmt.body(theme.bold('Build with Claude Code (recommended):'));
    fmt.newline();
    fmt.body(`  1. Open Claude Code in this directory: ${theme.accent('claude')}`);
    fmt.body(`  2. Tell Claude what the primitive should do:`);
    fmt.body(`     ${theme.muted(`/ikary-create-primitive`)}`);
    fmt.body(`     ${theme.muted(`> build the ${label} primitive — it should...`)}`);
    fmt.body(`     Claude will implement the component, update the schema and contract,`);
    fmt.body(`     validate it, and open the live preview for you.`);
    fmt.newline();
    fmt.body(theme.bold('Or build manually:'));
    fmt.newline();
    fmt.body(`  1. Edit ${theme.accent(`primitives/${name}/${PascalName}PresentationSchema.ts`)} to define your props`);
    fmt.body(`  2. Edit ${theme.accent(`primitives/${name}/${PascalName}.tsx`)} to implement the component`);
    fmt.body(`  3. Run ${theme.accent('ikary primitive validate')} to check your contract`);
    fmt.body(`  4. Run ${theme.accent('ikary local start manifest.json')} then open`);
    fmt.body(`     ${theme.accent('http://localhost:3000/__primitive-studio')} to preview live`);
    fmt.newline();
    fmt.muted(`  To update the primitive later, run /ikary-update-primitive in Claude Code.`);
    fmt.newline();
  } catch (err) {
    spinner.fail(theme.error('Scaffold failed'));
    fmt.newline();
    fmt.error(err instanceof Error ? err.message : String(err));
    process.exitCode = 1;
  }
}
