import type { StreamState } from '../stream/stream-state';

/**
 * Canonical zero state for the streaming UI. Any code that needs a blank
 * `StreamState` (component bootstrap, reset after blueprint load, etc.)
 * MUST reuse this constant instead of hand-rolling a literal.
 */
export const INITIAL_STREAM_STATE: StreamState = {
  manifest: null,
  stage: 'idle',
  provider: null,
  model: null,
  attempt: 0,
  chainLength: 0,
  fallbacks: [],
  inputTokens: 0,
  outputTokens: 0,
};
