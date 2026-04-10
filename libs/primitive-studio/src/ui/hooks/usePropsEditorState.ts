import { useState } from 'react';

export interface ParseState<T> {
  text: string;
  live: T;
  error: string | null;
}

export function usePropsEditorState<T>(initial: T): [ParseState<T>, (value: string) => void, (next: T) => void] {
  const [state, setState] = useState<ParseState<T>>({
    text: JSON.stringify(initial, null, 2),
    live: initial,
    error: null,
  });

  function handleTextChange(value: string) {
    try {
      const parsed = JSON.parse(value) as T;
      setState({ text: value, live: parsed, error: null });
    } catch (err) {
      setState((current) => ({
        ...current,
        text: value,
        error: err instanceof Error ? err.message : 'Invalid JSON',
      }));
    }
  }

  function handleValueChange(next: T) {
    setState({ text: JSON.stringify(next, null, 2), live: next, error: null });
  }

  return [state, handleTextChange, handleValueChange];
}
