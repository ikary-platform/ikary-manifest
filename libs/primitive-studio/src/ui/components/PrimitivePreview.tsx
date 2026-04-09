import { PrimitiveRenderer } from '@ikary/primitives';

interface PrimitivePreviewProps {
  primitiveKey: string | null;
  version?: string;
  props: unknown;
  runtime: unknown;
}

export function PrimitivePreview({ primitiveKey, version, props, runtime }: PrimitivePreviewProps) {
  if (!primitiveKey) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#94a3b8',
          fontSize: '13px',
        }}
      >
        Select a primitive to preview
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        overflow: 'auto',
        padding: '16px',
        backgroundColor: '#ffffff',
      }}
    >
      <PrimitiveRenderer
        primitive={primitiveKey}
        version={version}
        props={props}
        runtime={runtime}
      />
    </div>
  );
}
