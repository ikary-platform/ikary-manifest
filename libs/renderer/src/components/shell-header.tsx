interface ShellHeaderProps {
  title: string;
}

export function ShellHeader({ title }: ShellHeaderProps) {
  return (
    <header className="h-12 border-b bg-background flex items-center px-4 shrink-0">
      <span className="text-sm font-semibold text-foreground">{title}</span>
    </header>
  );
}
