import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[playground] uncaught render error', error, info.componentStack);
  }

  reset = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    if (this.props.fallback) return this.props.fallback(error, this.reset);

    return (
      <div
        role="alert"
        className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))] p-6"
      >
        <div className="max-w-xl flex flex-col gap-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 text-[hsl(var(--card-foreground))]">
          <h1 className="text-lg font-semibold">Something broke in the playground</h1>
          <p className="text-sm opacity-80">{error.message}</p>
          <details className="text-xs opacity-70">
            <summary className="cursor-pointer">Stack</summary>
            <pre className="mt-2 overflow-auto whitespace-pre-wrap">{error.stack}</pre>
          </details>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={this.reset}
              className="h-9 rounded border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 text-sm"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="h-9 rounded bg-[hsl(var(--primary))] px-3 text-sm text-[hsl(var(--primary-foreground))]"
            >
              Reload page
            </button>
          </div>
        </div>
      </div>
    );
  }
}
