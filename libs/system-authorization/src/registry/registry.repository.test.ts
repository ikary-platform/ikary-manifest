import { describe, expect, it, vi } from 'vitest';
import { RegistryRepository } from './registry.repository';

function makeChain(rows: any[] = []) {
  const chain: any = {
    selectFrom: () => chain,
    select: () => chain,
    selectAll: () => chain,
    where: () => chain,
    orderBy: () => chain,
    limit: () => chain,
    offset: () => chain,
    insertInto: () => chain,
    values: () => chain,
    updateTable: () => chain,
    set: () => chain,
    deleteFrom: () => chain,
    returning: () => chain,
    returningAll: () => chain,
    onConflict: () => chain,
    execute: vi.fn().mockResolvedValue(rows),
    executeTakeFirst: vi.fn().mockResolvedValue(rows[0]),
    executeTakeFirstOrThrow: vi.fn().mockResolvedValue(rows[0]),
  };
  return chain;
}

function makeRepo(chain: ReturnType<typeof makeChain>) {
  return new RegistryRepository({ db: chain } as any);
}

const FEATURE_ROW = { id: 'f1', code: 'WORKSPACE_CREATE', description: 'Create workspace', created_at: new Date() };
const DOMAIN_ROW = { id: 'd1', code: 'BILLING', description: 'Billing domain', created_at: new Date() };

describe('RegistryRepository.upsertFeature', () => {
  it('inserts a feature and returns the record', async () => {
    const chain = makeChain([]);
    chain.executeTakeFirstOrThrow = vi.fn().mockResolvedValue(FEATURE_ROW);
    const repo = makeRepo(chain);

    const result = await repo.upsertFeature({ code: 'WORKSPACE_CREATE', description: 'Create workspace' });

    expect(result).toEqual(FEATURE_ROW);
    expect(chain.executeTakeFirstOrThrow).toHaveBeenCalled();
  });

  it('handles upsert with no description (defaults to null)', async () => {
    const chain = makeChain([]);
    const noDescRow = { ...FEATURE_ROW, description: null };
    chain.executeTakeFirstOrThrow = vi.fn().mockResolvedValue(noDescRow);
    const repo = makeRepo(chain);

    const result = await repo.upsertFeature({ code: 'WORKSPACE_CREATE' });

    expect(result.description).toBeNull();
  });

  it('accepts an optional client parameter', async () => {
    const chain = makeChain([]);
    chain.executeTakeFirstOrThrow = vi.fn().mockResolvedValue(FEATURE_ROW);
    // When a client is passed, it should use that client instead of this.db.db
    const clientChain = makeChain([]);
    clientChain.executeTakeFirstOrThrow = vi.fn().mockResolvedValue(FEATURE_ROW);
    const repo = makeRepo(chain);

    // Calling with explicit client - the repo's executor() will use the client
    const result = await repo.upsertFeature({ code: 'WORKSPACE_CREATE' }, clientChain as any);

    expect(clientChain.executeTakeFirstOrThrow).toHaveBeenCalled();
    expect(result).toEqual(FEATURE_ROW);
  });
});

describe('RegistryRepository.upsertDomain', () => {
  it('inserts a domain and returns the record', async () => {
    const chain = makeChain([]);
    chain.executeTakeFirstOrThrow = vi.fn().mockResolvedValue(DOMAIN_ROW);
    const repo = makeRepo(chain);

    const result = await repo.upsertDomain({ code: 'BILLING', description: 'Billing domain' });

    expect(result).toEqual(DOMAIN_ROW);
    expect(chain.executeTakeFirstOrThrow).toHaveBeenCalled();
  });

  it('handles upsert with no description', async () => {
    const chain = makeChain([]);
    const noDescRow = { ...DOMAIN_ROW, description: null };
    chain.executeTakeFirstOrThrow = vi.fn().mockResolvedValue(noDescRow);
    const repo = makeRepo(chain);

    const result = await repo.upsertDomain({ code: 'BILLING' });

    expect(result.description).toBeNull();
  });

  it('accepts an optional client parameter', async () => {
    const clientChain = makeChain([]);
    clientChain.executeTakeFirstOrThrow = vi.fn().mockResolvedValue(DOMAIN_ROW);
    const chain = makeChain([]);
    const repo = makeRepo(chain);

    const result = await repo.upsertDomain({ code: 'BILLING' }, clientChain as any);

    expect(clientChain.executeTakeFirstOrThrow).toHaveBeenCalled();
    expect(result).toEqual(DOMAIN_ROW);
  });
});

describe('RegistryRepository.featureExists', () => {
  it('returns true when a feature with the given code exists', async () => {
    const chain = makeChain([]);
    chain.executeTakeFirst = vi.fn().mockResolvedValue({ code: 'WORKSPACE_CREATE' });
    const repo = makeRepo(chain);

    expect(await repo.featureExists('WORKSPACE_CREATE')).toBe(true);
  });

  it('returns false when no feature with the given code exists', async () => {
    const chain = makeChain([]);
    chain.executeTakeFirst = vi.fn().mockResolvedValue(undefined);
    const repo = makeRepo(chain);

    expect(await repo.featureExists('UNKNOWN')).toBe(false);
  });
});

describe('RegistryRepository.domainExists', () => {
  it('returns true when a domain with the given code exists', async () => {
    const chain = makeChain([]);
    chain.executeTakeFirst = vi.fn().mockResolvedValue({ code: 'BILLING' });
    const repo = makeRepo(chain);

    expect(await repo.domainExists('BILLING')).toBe(true);
  });

  it('returns false when no domain with the given code exists', async () => {
    const chain = makeChain([]);
    chain.executeTakeFirst = vi.fn().mockResolvedValue(undefined);
    const repo = makeRepo(chain);

    expect(await repo.domainExists('UNKNOWN')).toBe(false);
  });
});

describe('RegistryRepository.listFeatures', () => {
  it('returns all features ordered by code', async () => {
    const rows = [FEATURE_ROW, { ...FEATURE_ROW, id: 'f2', code: 'OTHER_FEATURE' }];
    const chain = makeChain(rows);
    const repo = makeRepo(chain);

    const result = await repo.listFeatures();

    expect(result).toHaveLength(2);
    expect(result[0]?.id).toBe('f1');
    expect(chain.execute).toHaveBeenCalled();
  });

  it('returns empty array when no features exist', async () => {
    const chain = makeChain([]);
    const repo = makeRepo(chain);

    const result = await repo.listFeatures();

    expect(result).toEqual([]);
  });

  it('accepts an optional client parameter', async () => {
    const clientChain = makeChain([FEATURE_ROW]);
    const chain = makeChain([]);
    const repo = makeRepo(chain);

    const result = await repo.listFeatures(clientChain as any);

    expect(clientChain.execute).toHaveBeenCalled();
    expect(result).toEqual([FEATURE_ROW]);
  });
});

describe('RegistryRepository.listDomains', () => {
  it('returns all domains ordered by code', async () => {
    const rows = [DOMAIN_ROW, { ...DOMAIN_ROW, id: 'd2', code: 'USERS' }];
    const chain = makeChain(rows);
    const repo = makeRepo(chain);

    const result = await repo.listDomains();

    expect(result).toHaveLength(2);
    expect(result[0]?.id).toBe('d1');
  });

  it('returns empty array when no domains exist', async () => {
    const chain = makeChain([]);
    const repo = makeRepo(chain);

    const result = await repo.listDomains();

    expect(result).toEqual([]);
  });

  it('accepts an optional client parameter', async () => {
    const clientChain = makeChain([DOMAIN_ROW]);
    const chain = makeChain([]);
    const repo = makeRepo(chain);

    const result = await repo.listDomains(clientChain as any);

    expect(clientChain.execute).toHaveBeenCalled();
    expect(result).toEqual([DOMAIN_ROW]);
  });
});
