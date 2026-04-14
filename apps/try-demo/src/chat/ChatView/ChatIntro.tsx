import { EXTERNAL_LINKS } from '../../config/links';

/**
 * Greeting copy shown in the chat rail before the first user turn.
 * The inline link deep-links into the CellManifestV1 schema explorer so
 * curious developers can inspect the contract they're about to generate.
 */
export function ChatIntro() {
  return (
    <div className="chat-intro">
      <p>
        <strong>Describe an app.</strong> Watch it build itself as a{' '}
        <a href={EXTERNAL_LINKS.cellManifestSchema} target="_blank" rel="noreferrer">
          Cell manifest
        </a>
        , rendered live.
      </p>
    </div>
  );
}
