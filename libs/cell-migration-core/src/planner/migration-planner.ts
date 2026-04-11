import { readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import type { MigrationFile, MigrationVersion } from '../shared/migration-version.schema.js';

function isValidVersionDir(name: string): boolean {
  return /^v\d+\.\d+\.\d+/.test(name);
}

function compareVersionDirs(a: string, b: string): number {
  const [aMaj, aMin, aPatch] = a.slice(1).split('.').map(Number) as [number, number, number];
  const [bMaj, bMin, bPatch] = b.slice(1).split('.').map(Number) as [number, number, number];
  return aMaj - bMaj || aMin - bMin || aPatch - bPatch;
}

export class MigrationPlanner {
  constructor(
    private readonly migrationsRoot: string,
    private readonly packageName: string,
  ) {}

  buildPlan(appliedVersions: Set<string>, force = false): MigrationVersion[] {
    if (!existsSync(this.migrationsRoot)) return [];

    const versionDirs = readdirSync(this.migrationsRoot, { withFileTypes: true })
      .filter((e) => e.isDirectory() && isValidVersionDir(e.name))
      .map((e) => e.name)
      .sort(compareVersionDirs);

    const plan: MigrationVersion[] = [];

    for (const versionDir of versionDirs) {
      const version = versionDir.slice(1);
      if (!force && appliedVersions.has(version)) continue;

      const versionRoot = path.join(this.migrationsRoot, versionDir);
      const files = this.selectFiles(versionRoot);
      if (files.length === 0) continue;

      plan.push({ packageName: this.packageName, version, versionDir, files });
    }

    return plan;
  }

  private selectFiles(versionRoot: string): MigrationFile[] {
    const allFiles = readdirSync(versionRoot, { withFileTypes: true })
      .filter((e) => e.isFile() && e.name.endsWith('.sql'))
      .map((e) => e.name)
      .sort((a, b) => a.localeCompare(b));

    const byBase = new Map<string, { common?: string; dialectFile?: string }>();

    for (const fileName of allFiles) {
      if (fileName.endsWith('.sqlite.sql')) continue;
      const isPgFile = fileName.endsWith('.pg.sql');

      const base = isPgFile
        ? fileName.replace(/\.pg\.sql$/, '.sql')
        : fileName;

      const entry = byBase.get(base) ?? {};
      if (isPgFile) entry.dialectFile = fileName;
      else entry.common = fileName;
      byBase.set(base, entry);
    }

    const selected: MigrationFile[] = [];
    for (const { common, dialectFile } of byBase.values()) {
      const fileName = dialectFile ?? common;
      /* v8 ignore next */
      if (!fileName) continue;
      selected.push({ fileName, absolutePath: path.join(versionRoot, fileName) });
    }

    return selected.sort((a, b) => a.fileName.localeCompare(b.fileName));
  }
}
