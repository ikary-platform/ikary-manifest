const SUGGESTIONS = [
  'Expense tracker for a small team',
  'Reading list with tags and status',
  'Client CRM with deals and contacts',
  'Job board for a recruiting startup',
] as const;

interface Props {
  onPick: (prompt: string) => void;
  disabled: boolean;
}

export function ChatSuggestions({ onPick, disabled }: Props) {
  return (
    <div className="suggestion-row">
      {SUGGESTIONS.map((s) => (
        <button
          key={s}
          type="button"
          className="suggestion-chip"
          onClick={() => onPick(s)}
          disabled={disabled}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
