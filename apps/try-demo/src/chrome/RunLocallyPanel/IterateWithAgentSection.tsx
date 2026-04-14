import { EXTERNAL_LINKS } from '../../config/links';

interface Props {
  filename: string;
}

export function IterateWithAgentSection({ filename }: Props) {
  return (
    <section className="slide-section">
      <h3>3. Iterate with an AI agent</h3>
      <p>
        <strong>Claude Code: ready out of the box.</strong> When you run{' '}
        <code className="slide-inline-code">npx ikary init</code>, Ikary registers its MCP server with
        Claude Code automatically. Just open the project and ask in plain English:
      </p>
      <div className="slide-code">
        &quot;Open {filename} and add a status enum to the expense entity.&quot;
      </div>
      <p className="slide-section-note">
        Using a different agent (Codex CLI, Cursor, Continue, your own)? Plug into the public Ikary
        MCP endpoint to give it the same contract awareness:
      </p>
      <div className="slide-code">{EXTERNAL_LINKS.mcp}</div>
    </section>
  );
}
