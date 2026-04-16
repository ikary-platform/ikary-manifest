import { Inject, Injectable } from '@nestjs/common';
import type { KnowledgeProvider } from './interfaces';
import type { KnowledgeItem, ManifestTaskInput } from '../../shared/pipeline.schema';
import { BlueprintLoaderService } from '../blueprint-loader.service';
import { CELL_SCHEMA_CATALOG } from '@ikary/cell-contract';

@Injectable()
export class DefaultKnowledgeProvider implements KnowledgeProvider {
  readonly name = 'default-knowledge-provider';

  constructor(
    @Inject(BlueprintLoaderService) private readonly blueprints: BlueprintLoaderService,
  ) {}

  async retrieve(input: ManifestTaskInput): Promise<KnowledgeItem[]> {
    const promptTokens = tokenize(input.prompt);
    const blueprintMatches = (await this.blueprints.list())
      .map((blueprint) => ({
        id: blueprint.id,
        type: 'blueprint' as const,
        title: blueprint.title,
        summary: blueprint.description ?? `Blueprint in category ${blueprint.category}`,
        source: blueprint.source,
        score: scoreText([blueprint.title, blueprint.description, blueprint.category].filter(Boolean).join(' '), promptTokens),
      }))
      .filter((item) => item.score > 0)
      .sort((left, right) => right.score - left.score)
      .slice(0, 3);

    const schemaMatches = CELL_SCHEMA_CATALOG
      .map((entry) => ({
        id: entry.name,
        type: 'schema' as const,
        title: entry.name,
        summary: entry.summary,
        source: 'cell-contract',
        score: scoreText(`${entry.name} ${entry.summary} ${entry.purpose}`, promptTokens),
      }))
      .filter((item) => item.score > 0)
      .sort((left, right) => right.score - left.score)
      .slice(0, 2);

    return [...blueprintMatches, ...schemaMatches];
  }
}

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[^a-z0-9_]+/)
    .filter((token) => token.length > 2);
}

function scoreText(target: string, tokens: string[]): number {
  if (tokens.length === 0) return 0;
  const haystack = target.toLowerCase();
  const hits = tokens.filter((token) => haystack.includes(token)).length;
  return hits === 0 ? 0 : Math.min(1, hits / tokens.length);
}
