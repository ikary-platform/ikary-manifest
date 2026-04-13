// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const MCP_API_URL = ((import.meta as any).env?.VITE_MCP_API_URL as string | undefined) ?? 'http://localhost:4502';
