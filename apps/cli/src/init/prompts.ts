import prompts from 'prompts';

export interface InitOptions {
  name: string;
  description: string;
  appType: string;
  aiTool: string;
}

const APP_TYPES = [
  { title: 'CRM / Customer Management', value: 'crm' },
  { title: 'Internal Operations', value: 'internal-ops' },
  { title: 'Customer Portal', value: 'customer-portal' },
  { title: 'Inventory / Asset Management', value: 'inventory' },
  { title: 'Project Management', value: 'project' },
  { title: 'Blank (start from scratch)', value: 'blank' },
];

const AI_TOOLS = [
  { title: 'Claude Code (Recommended)', value: 'claude-code' },
  { title: 'Codex CLI', value: 'codex' },
  { title: 'Gemini CLI', value: 'gemini' },
  { title: 'None (manual editing)', value: 'none' },
];

export async function runInitPrompts(projectName?: string): Promise<InitOptions | null> {
  const result = await prompts([
    {
      type: projectName ? null : 'text',
      name: 'name',
      message: 'Project name',
      initial: 'my-cell',
      validate: (v: string) => v.trim().length > 0 || 'Required',
    },
    {
      type: 'text',
      name: 'description',
      message: 'What does this application do?',
      initial: 'A cell manifest for managing business data',
    },
    {
      type: 'select',
      name: 'appType',
      message: 'Application type',
      choices: APP_TYPES,
    },
    {
      type: 'select',
      name: 'aiTool',
      message: 'Which AI CLI tool will you use?',
      choices: AI_TOOLS,
    },
  ], { onCancel: () => process.exit(0) });

  if (!result.name && !projectName) return null;

  return {
    name: projectName || result.name,
    description: result.description || '',
    appType: result.appType || 'blank',
    aiTool: result.aiTool || 'none',
  };
}
