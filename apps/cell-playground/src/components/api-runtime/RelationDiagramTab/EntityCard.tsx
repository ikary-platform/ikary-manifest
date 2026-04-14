import type { DiagramEntityDef, FieldRowRef } from './relationDiagramModel';

export function EntityCard({
  def,
  fieldRefs,
}: {
  def: DiagramEntityDef;
  fieldRefs: React.MutableRefObject<FieldRowRef[]>;
}) {
  return (
    <div
      style={{
        minWidth: 140,
        borderRadius: 8,
        border: def.isStub ? '1.5px dashed #cbd5e1' : '1px solid #e2e8f0',
        background: def.isStub ? '#f8fafc' : '#ffffff',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        fontSize: 12,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 10px',
          borderBottom: def.isStub ? '1px dashed #e2e8f0' : '1px solid #f1f5f9',
          background: def.isStub ? '#f1f5f9' : '#f8fafc',
        }}
      >
        <span style={{ fontSize: 9, color: '#94a3b8' }}>▦</span>
        <span
          style={{
            fontWeight: 600,
            color: def.isStub ? '#94a3b8' : '#374151',
            fontStyle: def.isStub ? 'italic' : 'normal',
            fontSize: 11,
          }}
        >
          {def.name}
        </span>
        {def.isStub && (
          <span style={{ marginLeft: 'auto', fontSize: 8, color: '#94a3b8' }}>stub</span>
        )}
      </div>
      {/* Fields */}
      {def.fields.map((f) => (
        <div
          key={f.key}
          ref={(el) => {
            const existing = fieldRefs.current.find(
              (r) => r.entityKey === def.key && r.fieldKey === f.key,
            );
            if (existing) {
              existing.el = el;
            } else {
              fieldRefs.current.push({ entityKey: def.key, fieldKey: f.key, el });
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            borderBottom: '1px solid #f8fafc',
            background: f.isFK ? 'rgba(59,130,246,0.04)' : 'transparent',
          }}
        >
          {f.isPK && (
            <span style={{ fontSize: 9 }} title="primary key">
              🔑
            </span>
          )}
          {f.isFK && !f.isPK && (
            <span style={{ fontSize: 9 }} title="foreign key">
              🔗
            </span>
          )}
          {!f.isPK && !f.isFK && <span style={{ width: 13 }} />}
          <code
            style={{
              fontSize: 10,
              fontFamily: 'monospace',
              lineHeight: 1.3,
              color: f.isPK ? '#94a3b8' : f.isFK ? '#2563eb' : '#64748b',
            }}
          >
            {f.label}
          </code>
        </div>
      ))}
    </div>
  );
}
