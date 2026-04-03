import type { CellPageRendererProps } from '../registry/cell-component-registry';

export function DashboardPage({ page }: CellPageRendererProps) {
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">{page.title}</h1>
      <div className="border border-border rounded p-8 text-center text-muted-foreground">
        <p className="text-sm">Dashboard content placeholder</p>
        <p className="text-xs mt-1 text-muted-foreground">Connect a real data source to populate this dashboard.</p>
      </div>
    </div>
  );
}
