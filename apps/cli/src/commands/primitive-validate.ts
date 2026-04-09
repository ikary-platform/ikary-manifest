import { resolve, join, dirname } from 'node:path';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import yaml from 'yaml';
import * as fmt from '../output/format.js';
import { theme } from '../output/theme.js';
import { IkaryPrimitivesConfigSchema, PrimitiveContractSchema } from '@ikary/primitive-contract';

export async function primitiveValidateCommand(): Promise<void> {
  const cwd = process.cwd();
  const configPath = join(cwd, 'ikary-primitives.yaml');

  fmt.section('Validate primitives');
  fmt.muted(configPath);
  fmt.newline();

  if (!existsSync(configPath)) {
    fmt.error(`No ${theme.accent('ikary-primitives.yaml')} found in ${theme.muted(cwd)}`);
    fmt.muted(`Run ${theme.accent('ikary primitive add <name>')} to create your first primitive.`);
    fmt.newline();
    process.exitCode = 1;
    return;
  }

  let config: ReturnType<typeof IkaryPrimitivesConfigSchema.parse>;
  try {
    const raw = await readFile(configPath, 'utf-8');
    const parsed = yaml.parse(raw);
    const result = IkaryPrimitivesConfigSchema.safeParse(parsed);
    if (!result.success) {
      fmt.error('Invalid ikary-primitives.yaml structure:');
      for (const issue of result.error.issues) {
        fmt.error(`  ${theme.muted(issue.path.join('.'))} ${issue.message}`);
      }
      fmt.newline();
      process.exitCode = 1;
      return;
    }
    config = result.data;
  } catch (err) {
    fmt.error(`Failed to parse ikary-primitives.yaml: ${err instanceof Error ? err.message : String(err)}`);
    fmt.newline();
    process.exitCode = 1;
    return;
  }

  if (config.primitives.length === 0) {
    fmt.body(`  ${theme.muted('No primitives registered.')}`);
    fmt.newline();
    return;
  }

  let allPassed = true;
  const configDir = dirname(configPath);

  for (const entry of config.primitives) {
    fmt.body(`  ${theme.accent(entry.key)}  ${theme.muted(`v${entry.version}`)}`);

    // Check source file exists
    const sourcePath = resolve(configDir, entry.source);
    if (existsSync(sourcePath)) {
      fmt.body(`    ${theme.success('✓')} source   ${theme.muted(entry.source)}`);
    } else {
      fmt.body(`    ${theme.error('✗')} source   ${theme.error(`not found: ${entry.source}`)}`);
      allPassed = false;
    }

    // Parse and validate contract
    const contractPath = resolve(configDir, entry.contract);
    if (!existsSync(contractPath)) {
      fmt.body(`    ${theme.error('✗')} contract ${theme.error(`not found: ${entry.contract}`)}`);
      allPassed = false;
    } else {
      try {
        const contractRaw = await readFile(contractPath, 'utf-8');
        const contractParsed = yaml.parse(contractRaw);
        const contractResult = PrimitiveContractSchema.safeParse(contractParsed);
        if (contractResult.success) {
          fmt.body(`    ${theme.success('✓')} contract ${theme.muted(entry.contract)}`);
        } else {
          fmt.body(`    ${theme.error('✗')} contract ${theme.error(entry.contract)}`);
          for (const issue of contractResult.error.issues) {
            fmt.body(`        ${theme.muted(issue.path.join('.'))} ${theme.error(issue.message)}`);
          }
          allPassed = false;
        }
      } catch (err) {
        fmt.body(`    ${theme.error('✗')} contract ${theme.error(`parse error: ${err instanceof Error ? err.message : String(err)}`)}`);
        allPassed = false;
      }
    }

    // Check examples file if declared
    if (entry.examples) {
      const examplesPath = resolve(configDir, entry.examples);
      if (existsSync(examplesPath)) {
        fmt.body(`    ${theme.success('✓')} examples ${theme.muted(entry.examples)}`);
      } else {
        fmt.body(`    ${theme.error('✗')} examples ${theme.error(`not found: ${entry.examples}`)}`);
        allPassed = false;
      }
    }

    fmt.newline();
  }

  if (allPassed) {
    fmt.body(`${theme.success('✓')} All ${config.primitives.length} primitive(s) valid`);
  } else {
    fmt.error('One or more primitives have errors. Fix them before using the Studio.');
    process.exitCode = 1;
  }

  fmt.newline();
}
