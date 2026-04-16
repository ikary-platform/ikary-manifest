import type { KnowledgeProvider } from '@ikary/cell-ai/server';
import type { KnowledgeItem, ManifestTaskInput } from '@ikary/cell-ai';

export class NoopKnowledgeProvider implements KnowledgeProvider {
  readonly name = 'noop-knowledge-provider';

  async retrieve(_input: ManifestTaskInput): Promise<KnowledgeItem[]> {
    return [];
  }
}
