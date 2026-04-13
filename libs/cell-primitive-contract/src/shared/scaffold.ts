/**
 * Pure template generators for primitive scaffold files.
 * No file I/O — callers (CLI, MCP server) handle writing to disk.
 */

export interface PrimitiveScaffoldOptions {
  name: string;
  label: string;
  description: string;
  category: string;
  version?: string;
}

export interface ScaffoldedFiles {
  /** Relative path → file content */
  [relativePath: string]: string;
}

export function toPascalCase(name: string): string {
  return name
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

export function scaffoldPrimitiveFiles(opts: PrimitiveScaffoldOptions): ScaffoldedFiles {
  const { name, label, description, category, version = '1.0.0' } = opts;
  const PascalName = toPascalCase(name);
  const dir = `primitives/${name}`;

  return {
    [`${dir}/${PascalName}.tsx`]: generateComponent(PascalName),
    [`${dir}/${PascalName}PresentationSchema.ts`]: generatePresentationSchema(PascalName),
    [`${dir}/${name}.contract.yaml`]: generateContract(name, label, description, category, version),
    [`${dir}/${PascalName}.resolver.ts`]: generateResolver(PascalName),
    [`${dir}/${PascalName}.register.ts`]: generateRegister(name, PascalName, version, label, category),
    [`${dir}/${PascalName}.example.ts`]: generateExample(PascalName, label),
  };
}

function generateComponent(PascalName: string): string {
  return `import type { ${PascalName}Props } from './${PascalName}PresentationSchema';

export function ${PascalName}(props: ${PascalName}Props) {
  return (
    <div>
      {/* TODO: implement ${PascalName} */}
      <pre>{JSON.stringify(props, null, 2)}</pre>
    </div>
  );
}
`;
}

function generatePresentationSchema(PascalName: string): string {
  return `import { z } from 'zod';

export const ${PascalName}PresentationSchema = z.object({
  // TODO: add your props here
  label: z.string().optional(),
}).strict();

export type ${PascalName}Props = z.infer<typeof ${PascalName}PresentationSchema>;
`;
}

function generateContract(
  name: string,
  label: string,
  description: string,
  category: string,
  version: string,
): string {
  // Hand-rolled YAML to avoid requiring the yaml package in this shared lib
  return [
    `key: ${name}`,
    `version: "${version}"`,
    `label: ${label}`,
    `description: ${description || `A custom ${label} primitive`}`,
    `category: ${category}`,
    `breakingChanges: []`,
    `props:`,
    `  type: object`,
    `  properties:`,
    `    label:`,
    `      type: string`,
    `      description: Optional display label`,
    `  required: []`,
    '',
  ].join('\n');
}

function generateResolver(PascalName: string): string {
  return `import type { ${PascalName}Props } from './${PascalName}PresentationSchema';

export function resolve${PascalName}(props: ${PascalName}Props): ${PascalName}Props {
  return props;
}
`;
}

function generateRegister(name: string, PascalName: string, version: string, label: string, category: string): string {
  return `import { registerPrimitiveVersion } from '@ikary/cell-primitives';
import { ${PascalName} } from './${PascalName}';
import { resolve${PascalName} } from './${PascalName}.resolver';

registerPrimitiveVersion(
  '${name}',
  '${version}',
  { component: ${PascalName}, resolver: resolve${PascalName} },
  { source: 'custom', label: '${label}', category: '${category}' },
);
`;
}

function generateExample(PascalName: string, label: string): string {
  return `export const ${PascalName}Examples = [
  {
    label: 'Default',
    description: 'Basic example',
    props: {
      label: 'Hello from ${label}',
    },
  },
];
`;
}
