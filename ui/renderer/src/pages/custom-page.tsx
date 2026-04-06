import type { CellPageRendererProps } from '../registry/cell-component-registry';

export function CustomPage({ page }: CellPageRendererProps) {
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">{page.title}</h1>
      <div className="border border-border rounded p-8 text-center text-muted-foreground">
        <p className="text-sm font-medium">Custom page not yet implemented</p>
        <p className="text-xs mt-1 text-muted-foreground">
          Register a custom renderer for key "{page.key}" to display content here.
        </p>
      </div>
    </div>
  );
}
