import type { ChatEntry as Entry } from '../../hooks';
import { ChatLoadingRow } from './ChatLoadingRow';

interface Props {
  entry: Entry;
  isAwaitingFirstChunk: boolean;
  isLoading: boolean;
}

export function ChatEntry({ entry, isAwaitingFirstChunk, isLoading }: Props) {
  return (
    <div className="chat-entry">
      <div className="role">{entry.role === 'user' ? 'You' : 'Ikary'}</div>
      {isAwaitingFirstChunk ? (
        <ChatLoadingRow />
      ) : (
        <div className="content">{entry.content || (isLoading ? '…' : '')}</div>
      )}
    </div>
  );
}
