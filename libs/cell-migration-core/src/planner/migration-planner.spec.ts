import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { MigrationPlanner } from './migration-planner.js';

function makeTmpDir(): string {
  const dir = join(tmpdir(), `planner-test-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`);
  mkdirSync(dir, { recursive: true });
  return dir;
}

function writeSql(dir: string, fileName: string, content = 'SELECT 1;'): void {
  writeFileSync(join(dir, fileName), content);
}

describe('MigrationPlanner', () => {
  let migrationsRoot: string;

  beforeEach(() => {
    migrationsRoot = makeTmpDir();
  });

  afterEach(() => {
    rmSync(migrationsRoot, { recursive: true, force: true });
  });

  it('returns empty plan when migrationsRoot does not exist', () => {
    const planner = new MigrationPlanner('/nonexistent/path', '@ikary/test');
    expect(planner.buildPlan(new Set())).toEqual([]);
  });

  it('returns empty plan when migrationsRoot has no version dirs', () => {
    const planner = new MigrationPlanner(migrationsRoot, '@ikary/test');
    expect(planner.buildPlan(new Set())).toEqual([]);
  });

  it('returns empty plan when version dir has no .sql files', () => {
    mkdirSync(join(migrationsRoot, 'v0.1.0'));
    const planner = new MigrationPlanner(migrationsRoot, '@ikary/test');
    expect(planner.buildPlan(new Set())).toHaveLength(0);
  });

  it('ignores non-semver directories', () => {
    mkdirSync(join(migrationsRoot, 'not-a-version'));
    mkdirSync(join(migrationsRoot, 'migrations'));
    const planner = new MigrationPlanner(migrationsRoot, '@ikary/test');
    expect(planner.buildPlan(new Set())).toHaveLength(0);
  });

  it('discovers a single version with a common .sql file', () => {
    const v = join(migrationsRoot, 'v0.1.0');
    mkdirSync(v);
    writeSql(v, '001-create-table.sql');
    const planner = new MigrationPlanner(migrationsRoot, '@ikary/test');
    const plan = planner.buildPlan(new Set());
    expect(plan).toHaveLength(1);
    expect(plan[0]?.version).toBe('0.1.0');
    expect(plan[0]?.files[0]?.fileName).toBe('001-create-table.sql');
  });

  it('sorts version directories in semver order', () => {
    for (const v of ['v2.0.0', 'v0.1.0', 'v1.0.0', 'v0.2.0']) {
      const dir = join(migrationsRoot, v);
      mkdirSync(dir);
      writeSql(dir, '001.sql');
    }
    const planner = new MigrationPlanner(migrationsRoot, '@ikary/test');
    const plan = planner.buildPlan(new Set());
    expect(plan.map((p) => p.version)).toEqual(['0.1.0', '0.2.0', '1.0.0', '2.0.0']);
  });

  it('sorts by patch when major and minor are equal', () => {
    for (const v of ['v0.1.2', 'v0.1.0', 'v0.1.1']) {
      const dir = join(migrationsRoot, v);
      mkdirSync(dir);
      writeSql(dir, '001.sql');
    }
    const planner = new MigrationPlanner(migrationsRoot, '@ikary/test');
    const plan = planner.buildPlan(new Set());
    expect(plan.map((p) => p.version)).toEqual(['0.1.0', '0.1.1', '0.1.2']);
  });

  it('skips already-applied versions when force=false', () => {
    for (const v of ['v0.1.0', 'v1.0.0']) {
      const dir = join(migrationsRoot, v);
      mkdirSync(dir);
      writeSql(dir, '001.sql');
    }
    const planner = new MigrationPlanner(migrationsRoot, '@ikary/test');
    const plan = planner.buildPlan(new Set(['0.1.0']));
    expect(plan).toHaveLength(1);
    expect(plan[0]?.version).toBe('1.0.0');
  });

  it('includes all versions when force=true even if applied', () => {
    for (const v of ['v0.1.0', 'v1.0.0']) {
      const dir = join(migrationsRoot, v);
      mkdirSync(dir);
      writeSql(dir, '001.sql');
    }
    const planner = new MigrationPlanner(migrationsRoot, '@ikary/test');
    const plan = planner.buildPlan(new Set(['0.1.0', '1.0.0']), true);
    expect(plan).toHaveLength(2);
  });

  it('prefers .pg.sql over common .sql', () => {
    const v = join(migrationsRoot, 'v0.1.0');
    mkdirSync(v);
    writeSql(v, '001-create.sql', 'SELECT 1; -- common');
    writeSql(v, '001-create.pg.sql', 'SELECT 2; -- pg');
    const planner = new MigrationPlanner(migrationsRoot, '@ikary/test');
    const plan = planner.buildPlan(new Set());
    expect(plan[0]?.files[0]?.fileName).toBe('001-create.pg.sql');
  });

  it('falls back to common .sql when no .pg.sql file exists', () => {
    const v = join(migrationsRoot, 'v0.1.0');
    mkdirSync(v);
    writeSql(v, '001-create.sql');
    const planner = new MigrationPlanner(migrationsRoot, '@ikary/test');
    const plan = planner.buildPlan(new Set());
    expect(plan[0]?.files[0]?.fileName).toBe('001-create.sql');
  });

  it('ignores .sqlite.sql files', () => {
    const v = join(migrationsRoot, 'v0.1.0');
    mkdirSync(v);
    writeSql(v, '001-create.sqlite.sql');
    const planner = new MigrationPlanner(migrationsRoot, '@ikary/test');
    const plan = planner.buildPlan(new Set());
    expect(plan).toHaveLength(0);
  });

  it('sorts files lexicographically within a version', () => {
    const v = join(migrationsRoot, 'v0.1.0');
    mkdirSync(v);
    writeSql(v, '003-c.sql');
    writeSql(v, '001-a.sql');
    writeSql(v, '002-b.sql');
    const planner = new MigrationPlanner(migrationsRoot, '@ikary/test');
    const plan = planner.buildPlan(new Set());
    expect(plan[0]?.files.map((f) => f.fileName)).toEqual(['001-a.sql', '002-b.sql', '003-c.sql']);
  });

  it('sets packageName correctly on each version', () => {
    const v = join(migrationsRoot, 'v0.1.0');
    mkdirSync(v);
    writeSql(v, '001.sql');
    const planner = new MigrationPlanner(migrationsRoot, '@ikary/cell-runtime-core');
    const plan = planner.buildPlan(new Set());
    expect(plan[0]?.packageName).toBe('@ikary/cell-runtime-core');
  });

  it('sets versionDir correctly', () => {
    const v = join(migrationsRoot, 'v1.2.3');
    mkdirSync(v);
    writeSql(v, '001.sql');
    const planner = new MigrationPlanner(migrationsRoot, '@ikary/test');
    const plan = planner.buildPlan(new Set());
    expect(plan[0]?.versionDir).toBe('v1.2.3');
  });
});
