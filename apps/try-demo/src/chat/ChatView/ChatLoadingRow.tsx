/**
 * Three-dot "Thinking..." indicator rendered in the assistant slot while
 * we're waiting for the first stream chunk.
 */
export function ChatLoadingRow() {
  return (
    <div className="chat-loading">
      <span className="chat-loading-dots" aria-hidden="true">
        <span /> <span /> <span />
      </span>
      <span>Thinking…</span>
    </div>
  );
}
