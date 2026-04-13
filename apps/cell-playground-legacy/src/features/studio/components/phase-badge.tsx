import { Badge } from '../../../components/ui/badge';
import { cn } from '../../../lib/utils';
import type { StudioPhase } from '../contracts';

const PHASE_LABELS: Record<StudioPhase, string> = {
  phase1_define: 'Phase 1 - Define',
  phase2_plan: 'Phase 2 - Plan',
  phase3_generate: 'Phase 3 - Generate',
  phase4_tweak: 'Phase 4 - Tweak',
};

const PHASE_STYLE: Record<StudioPhase, string> = {
  phase1_define: 'border-slate-300 text-slate-700 dark:border-slate-600 dark:text-slate-200',
  phase2_plan: 'border-blue-300 text-blue-700 dark:border-blue-600 dark:text-blue-300',
  phase3_generate: 'border-emerald-300 text-emerald-700 dark:border-emerald-600 dark:text-emerald-300',
  phase4_tweak: 'border-amber-300 text-amber-700 dark:border-amber-600 dark:text-amber-300',
};

export function phaseLabel(phase: StudioPhase): string {
  return PHASE_LABELS[phase];
}

interface PhaseBadgeProps {
  phase: StudioPhase;
  className?: string;
}

export function PhaseBadge({ phase, className }: PhaseBadgeProps) {
  return (
    <Badge variant="outline" className={cn('font-medium tracking-wide', PHASE_STYLE[phase], className)}>
      {phaseLabel(phase)}
    </Badge>
  );
}
