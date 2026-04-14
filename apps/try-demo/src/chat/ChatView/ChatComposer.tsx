import { useState } from 'react';

interface Props {
  onSubmit: (prompt: string) => void;
  disabled: boolean;
  placeholder: string;
}

/**
 * Controlled textarea + submit button. Owns only its own input value; all
 * other concerns (loading, AI-available flag, validation) come via props.
 * Pressing Enter without Shift submits.
 */
export function ChatComposer({ onSubmit, disabled, placeholder }: Props) {
  const [value, setValue] = useState('');

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    setValue('');
    onSubmit(trimmed);
  };

  return (
    <form
      className="chat-composer"
      onSubmit={(ev) => {
        ev.preventDefault();
        submit();
      }}
    >
      <textarea
        className="ob-textarea"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
      />
      <button type="submit" className="ob-btn-continue" disabled={disabled || !value.trim()}>
        Build
      </button>
    </form>
  );
}
