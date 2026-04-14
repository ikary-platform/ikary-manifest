import type { ChatEntry as Entry } from '../../hooks';
import { ChatEntry } from './ChatEntry';

interface Props {
  entries: Entry[];
  loading: boolean;
}

export function ChatTranscript({ entries, loading }: Props) {
  const lastId = entries[entries.length - 1]?.id;
  return (
    <div className="chat-transcript">
      {entries.map((entry) => {
        const isLast = entry.id === lastId;
        const isAwaitingFirstChunk =
          loading && entry.role === 'assistant' && isLast && !entry.content;
        return (
          <ChatEntry
            key={entry.id}
            entry={entry}
            isAwaitingFirstChunk={isAwaitingFirstChunk}
            isLoading={loading}
          />
        );
      })}
    </div>
  );
}
