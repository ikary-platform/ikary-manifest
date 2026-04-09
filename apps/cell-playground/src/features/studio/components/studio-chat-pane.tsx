import { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, Sparkles, WandSparkles } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import type { DiscoveryArtifact, PlanArtifact, StudioMessageRecord, StudioPhase } from '../contracts';
import { PhaseBadge } from './phase-badge';

function roleLabel(role: StudioMessageRecord['role']): string {
  switch (role) {
    case 'assistant':
      return 'Studio';
    case 'system':
      return 'System';
    default:
      return 'You';
  }
}

function bubbleClass(role: StudioMessageRecord['role']): string {
  switch (role) {
    case 'assistant':
      return 'bg-blue-50 border-blue-200 text-blue-950 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-100';
    case 'system':
      return 'bg-amber-50 border-amber-200 text-amber-950 dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-100';
    default:
      return 'bg-muted border-border text-foreground';
  }
}

interface StudioChatPaneProps {
  phase: StudioPhase;
  messages: StudioMessageRecord[];
  discovery?: DiscoveryArtifact;
  plan?: PlanArtifact;
  isBusy: boolean;
  statusWord: string | null;
  latestError: string | null;
  onSend: (text: string) => Promise<void>;
  onGenerateInitial: () => Promise<void>;
}

export function StudioChatPane({
  phase,
  messages,
  discovery,
  plan,
  isBusy,
  statusWord,
  latestError,
  onSend,
  onGenerateInitial,
}: StudioChatPaneProps) {
  const [draft, setDraft] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) {
      return;
    }
    container.scrollTop = container.scrollHeight;
  }, [messages]);

  const assumptions = useMemo(() => discovery?.assumptions.slice(0, 3) ?? [], [discovery]);
  const canSend = draft.trim().length > 0 && !isBusy && !submitting;
  const canGenerate = phase === 'phase2_plan' && !isBusy && !generating;

  async function submitDraft() {
    const text = draft.trim();
    if (!text || !canSend) {
      return;
    }

    setSubmitting(true);
    try {
      await onSend(text);
      setDraft('');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGenerate() {
    if (!canGenerate) {
      return;
    }

    setGenerating(true);
    try {
      await onGenerateInitial();
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="flex w-full flex-col border-b border-border bg-background lg:w-[42%] lg:min-w-[360px] lg:border-b-0 lg:border-r">
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Studio Conversation</p>
            <p className="text-xs text-muted-foreground">Visible assistant text only. Artifacts stay hidden.</p>
          </div>
          <PhaseBadge phase={phase} />
        </div>
      </div>

      {(discovery || plan) && (
        <div className="border-b border-border px-4 py-3 space-y-2">
          {discovery && (
            <div className="rounded-md border border-border bg-muted/50 px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Current Cell</p>
              <p className="text-sm font-medium text-foreground">{discovery.cell_name}</p>
              <p className="text-xs text-muted-foreground">{discovery.domain}</p>
              {assumptions.length > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">Assumptions: {assumptions.join(' | ')}</p>
              )}
            </div>
          )}
          {plan && (
            <div className="rounded-md border border-border bg-muted/50 px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Plan Snapshot</p>
              <p className="text-xs text-muted-foreground line-clamp-3">{plan.explanation_summary}</p>
            </div>
          )}
          {phase === 'phase2_plan' && (
            <Button type="button" onClick={handleGenerate} disabled={!canGenerate} className="w-full">
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <WandSparkles className="h-4 w-4" />}
              Generate Cell
            </Button>
          )}
        </div>
      )}

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="rounded-md border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
            Describe the Cell you want to create. Studio will guide phases and keep artifacts hidden.
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {roleLabel(message.role)}
            </p>
            <div className={`rounded-md border px-3 py-2 text-sm whitespace-pre-wrap ${bubbleClass(message.role)}`}>
              {message.visible_text}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-border px-4 py-3 space-y-2">
        {isBusy && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{statusWord ?? 'Bambazoling'}</span>
          </div>
        )}
        {latestError && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-2 py-1 text-xs text-destructive">
            {latestError}
          </div>
        )}
        <div className="space-y-2">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                void submitDraft();
              }
            }}
            rows={3}
            placeholder="Describe what you want to build or tweak..."
            className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
            disabled={isBusy || submitting || generating}
          />
          <div className="flex justify-end">
            <Button type="button" onClick={() => void submitDraft()} disabled={!canSend}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
