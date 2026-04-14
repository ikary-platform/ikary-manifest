// ── Semantic colors for lifecycle / status fields ─────────────────────────────

export const STATUS_COLORS: Record<string, string> = {
  // Green — completed / positive end-states
  active: '#22c55e',    approved: '#22c55e',   hired: '#22c55e',      paid: '#22c55e',
  completed: '#22c55e', done: '#22c55e',        resolved: '#22c55e',   closed: '#22c55e',
  won: '#22c55e',       success: '#22c55e',     customer: '#22c55e',   published: '#22c55e',
  // Amber — waiting / soft-blocked
  pending: '#f59e0b',   sent: '#f59e0b',        on_hold: '#f59e0b',    review: '#f59e0b',
  waiting: '#f59e0b',   triaged: '#f59e0b',     scheduled: '#f59e0b',  hold: '#f59e0b',
  // Blue — actively in-flight
  in_progress: '#3b82f6', interview: '#3b82f6', screening: '#3b82f6',
  assigned:    '#3b82f6', processing: '#3b82f6', contacted: '#3b82f6',
  // Slate — early / entry states
  draft: '#64748b', new: '#64748b', open: '#64748b', todo: '#64748b',
  created: '#64748b', lead: '#64748b', applied: '#64748b', initial: '#64748b',
  // Red — negative / terminal
  cancelled: '#ef4444', rejected: '#ef4444', churned: '#ef4444',
  lost:       '#ef4444', terminated: '#ef4444', failed: '#ef4444',
  inactive:   '#ef4444', wont_fix: '#ef4444',
  // Gray — archived / neutral terminal
  archived: '#6b7280', deprecated: '#6b7280', closed_lost: '#6b7280',
  // Purple — qualified / progressing
  qualified: '#8b5cf6', prospect: '#8b5cf6', proposal: '#8b5cf6', negotiation: '#8b5cf6',
  offer: '#8b5cf6',
  // Orange — leave / paused
  on_leave: '#f97316', paused: '#f97316',
};

export const CHART_PALETTE = [
  '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e',
  '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4',
];

export function resolveColor(value: string, index: number, isStatusField: boolean): string {
  if (isStatusField) {
    const v = value.toLowerCase();
    if (STATUS_COLORS[v]) return STATUS_COLORS[v]!;
    for (const [key, color] of Object.entries(STATUS_COLORS)) {
      if (v.includes(key)) return color;
    }
  }
  return CHART_PALETTE[index % CHART_PALETTE.length]!;
}

export function kpiAccent(stateValue: string): 'default' | 'blue' | 'green' | 'amber' | 'red' {
  const v = stateValue.toLowerCase();
  if (/done|paid|complet|active|approv|hired|resolv|won|success|customer/.test(v)) return 'green';
  if (/hold|pending|sent|wait|review|triaged/.test(v)) return 'amber';
  if (/cancel|reject|lost|terminat|churn|inactive/.test(v)) return 'red';
  return 'blue';
}
