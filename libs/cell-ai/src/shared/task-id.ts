export const CELL_AI_TASKS = {
  MANIFEST_GENERATE: 'manifest.generate',
  MANIFEST_CLARIFY: 'manifest.clarify',
  CHAT_CONVERSE: 'chat.converse',
} as const;

export type CellAiTask = (typeof CELL_AI_TASKS)[keyof typeof CELL_AI_TASKS];
