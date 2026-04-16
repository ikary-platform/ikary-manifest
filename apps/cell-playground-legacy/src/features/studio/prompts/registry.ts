import { PromptRegistry } from '@ikary/system-prompt';

const files = import.meta.glob('../../../../../../prompts/cell-playground/*.prompt.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

export const studioPromptRegistry = new PromptRegistry(files);
