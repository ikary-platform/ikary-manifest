export const CELL_AI_TASKS = {
  MANIFEST_CREATE: 'manifest.create',
  MANIFEST_FIX: 'manifest.fix',
  MANIFEST_UPDATE: 'manifest.update',
  MANIFEST_GENERATE: 'manifest.create',
  MANIFEST_CLARIFY: 'manifest.clarify',
  CHAT_CONVERSE: 'chat.converse',
} as const;

export type CellAiTask = (typeof CELL_AI_TASKS)[keyof typeof CELL_AI_TASKS];
