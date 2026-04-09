import type { ReactNode } from 'react';
import { getPrimitive } from '../registry/primitiveRegistry';

interface PrimitiveRendererProps {
  primitive: string;
  version?: string;
  props?: unknown;
  runtime?: unknown;
  children?: ReactNode;
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

  const resolvedProps = definition.resolver ? definition.resolver(props, runtime) : props;

  const Component = definition.component;

  return <Component {...(resolvedProps as object)}>{children}</Component>;
}
