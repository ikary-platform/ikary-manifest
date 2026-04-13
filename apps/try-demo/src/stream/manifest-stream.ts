import type { ManifestStreamEvent } from '@ikary/cell-ai';

export type StreamEvent =
  | { type: 'meta'; correlationId: string }
  | ManifestStreamEvent;

export interface StreamOptions {
  userPrompt: string;
  userContext?: { role?: string; companySize?: string };
  signal?: AbortSignal;
  onEvent: (event: StreamEvent) => void;
}

export async function streamManifest(opts: StreamOptions): Promise<void> {
  const response = await fetch('/api/chat/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
    body: JSON.stringify({ userPrompt: opts.userPrompt, userContext: opts.userContext }),
    signal: opts.signal,
  });
  if (!response.ok || !response.body) {
    throw new Error(`HTTP ${response.status}`);
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx = buffer.indexOf('\n\n');
    while (idx !== -1) {
      const rawFrame = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      const dataLines = rawFrame
        .split('\n')
        .filter((line) => line.startsWith('data:'))
        .map((line) => line.slice(5).trim());
      if (dataLines.length > 0) {
        const payload = dataLines.join('\n');
        try {
          const parsed = JSON.parse(payload) as StreamEvent;
          opts.onEvent(parsed);
        } catch {
          // ignore malformed frames
        }
      }
      idx = buffer.indexOf('\n\n');
    }
  }
}
