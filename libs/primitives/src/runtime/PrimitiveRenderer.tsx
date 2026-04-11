import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import { getPrimitive } from '../registry/primitiveRegistry';

interface PrimitiveRendererProps {
  primitive: string;
  version?: string;
  props?: unknown;
  runtime?: unknown;
  children?: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

class PrimitiveErrorBoundary extends Component<{ primitiveKey: string; children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[cell-runtime] Primitive "${this.props.primitiveKey}" threw during render:`, error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            color: '#b91c1c',
            border: '1px solid #fca5a5',
            background: '#fef2f2',
            padding: '10px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontFamily: 'monospace',
          }}
        >
          <strong>[{this.props.primitiveKey}] Render error:</strong>
          <pre style={{ marginTop: '4px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {this.state.error.message}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export function PrimitiveRenderer({ primitive, version, props = {}, runtime, children }: PrimitiveRendererProps) {
  const definition = getPrimitive(primitive, version);

  if (!definition) {
    console.warn(`[cell-runtime] Unknown primitive: "${primitive}"`);
    return (
      <div
        style={{
          color: 'red',
          border: '1px solid red',
          padding: '8px',
          borderRadius: '4px',
          fontSize: '12px',
        }}
      >
        Unknown primitive: <strong>{primitive}</strong>
      </div>
    );
  }

  let resolvedProps: unknown;
  try {
    resolvedProps = definition.resolver ? definition.resolver(props, runtime) : props;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[cell-runtime] Primitive "${primitive}" resolver threw:`, err);
    return (
      <div
        style={{
          color: '#b91c1c',
          border: '1px solid #fca5a5',
          background: '#fef2f2',
          padding: '10px 12px',
          borderRadius: '6px',
          fontSize: '12px',
          fontFamily: 'monospace',
        }}
      >
        <strong>[{primitive}] Resolver error:</strong>
        <pre style={{ marginTop: '4px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{message}</pre>
      </div>
    );
  }

  const PrimitiveComponent = definition.component;

  return (
    <PrimitiveErrorBoundary primitiveKey={primitive}>
      <PrimitiveComponent {...(resolvedProps as object)}>{children}</PrimitiveComponent>
    </PrimitiveErrorBoundary>
  );
}
