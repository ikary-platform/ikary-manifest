export interface ToolResult {
  [key: string]: unknown;
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
}

export function mcpResult(summary: string, data?: unknown): ToolResult {
  const content: Array<{ type: 'text'; text: string }> = [
    { type: 'text', text: summary },
  ];
  if (data !== undefined) {
    content.push({ type: 'text', text: JSON.stringify(data, null, 2) });
  }
  return { content };
}

export function mcpError(message: string): ToolResult {
  return {
    content: [{ type: 'text', text: `Error: ${message}` }],
    isError: true,
  };
}
