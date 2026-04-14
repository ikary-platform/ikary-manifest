import type { EntityDefinition, RelationDefinition } from '@ikary/cell-contract';

// ── Internal types ──────────────────────────────────────────────────────────

export interface DiagramField {
  key: string;
  isFK: boolean;
  isPK: boolean;
  label: string;
}

export interface DiagramEntityDef {
  key: string;
  name: string;
  isStub: boolean;
  col: number;
  row: number;
  fields: DiagramField[];
}

export interface ConnectorDef {
  sourceEntityKey: string;
  sourceFieldKey: string;
  targetEntityKey: string;
  targetFieldKey: string;
  relationType: RelationDefinition['relation'];
}

export interface FieldRowRef {
  entityKey: string;
  fieldKey: string;
  el: HTMLDivElement | null;
}

export interface SvgConnector {
  d: string;
  color: string;
  dashed: boolean;
  relationType: RelationDefinition['relation'];
}

// ── Constants ───────────────────────────────────────────────────────────────

export const RELATION_COLORS: Record<RelationDefinition['relation'], string> = {
  belongs_to: '#3b82f6',
  has_many: '#8b5cf6',
  many_to_many: '#10b981',
  self: '#f59e0b',
  polymorphic: '#6b7280',
};

// ── Data builder ────────────────────────────────────────────────────────────

export function buildDiagramData(
  entity: EntityDefinition,
): { entities: DiagramEntityDef[]; connectors: ConnectorDef[] } {
  const relations = entity.relations ?? [];
  const entityMap = new Map<string, DiagramEntityDef>();
  const connectors: ConnectorDef[] = [];

  // Build virtual FK fields for belongs_to / self / polymorphic — rel.key (or
  // the relation's configured id/type field) acts as the DOM anchor so the SVG
  // path has something to attach to.
  const fkFields: DiagramField[] = [];
  for (const rel of relations) {
    if (rel.relation === 'belongs_to') {
      fkFields.push({
        key: rel.key,
        isFK: true,
        isPK: false,
        label: rel.foreignKey ?? `${rel.key}_id`,
      });
    } else if (rel.relation === 'self') {
      fkFields.push({ key: rel.key, isFK: true, isPK: false, label: rel.key });
    } else if (rel.relation === 'polymorphic') {
      // Use the relation's configured idField / typeField rather than hardcoded
      // 'target_id' / 'target_type' so the diagram is accurate for any column name.
      fkFields.push({ key: rel.idField, isFK: true, isPK: false, label: rel.idField });
      fkFields.push({ key: rel.typeField, isFK: false, isPK: false, label: rel.typeField });
    }
  }

  const visibleFields = (entity.fields ?? [])
    .filter((f) => f.list?.visible)
    .slice(0, 4)
    .map((f) => ({ key: f.key, isFK: false, isPK: false, label: f.key }));

  const primaryFields: DiagramField[] = [
    { key: 'id', isFK: false, isPK: true, label: 'id' },
    ...fkFields,
    ...visibleFields.filter((f) => !fkFields.some((fk) => fk.key === f.key)),
  ];

  entityMap.set(entity.key, {
    key: entity.key,
    name: entity.name,
    isStub: false,
    col: 0,
    row: 0,
    fields: primaryFields,
  });

  let rightRow = 0;
  let centerRow = 0;

  for (const rel of relations) {
    if (rel.relation === 'belongs_to') {
      const targetKey = rel.entity;
      if (!entityMap.has(targetKey)) {
        entityMap.set(targetKey, {
          key: targetKey,
          name: targetKey,
          isStub: true,
          col: 2,
          row: rightRow++,
          fields: [{ key: 'id', isFK: false, isPK: true, label: 'id' }],
        });
      }
      connectors.push({
        sourceEntityKey: entity.key,
        sourceFieldKey: rel.key,
        targetEntityKey: targetKey,
        targetFieldKey: 'id',
        relationType: 'belongs_to',
      });
    } else if (rel.relation === 'has_many') {
      const targetKey = rel.entity;
      if (!entityMap.has(targetKey)) {
        entityMap.set(targetKey, {
          key: targetKey,
          name: targetKey,
          isStub: true,
          col: 2,
          row: rightRow++,
          fields: [
            { key: 'id', isFK: false, isPK: true, label: 'id' },
            { key: rel.foreignKey, isFK: true, isPK: false, label: rel.foreignKey },
          ],
        });
      }
      connectors.push({
        sourceEntityKey: entity.key,
        sourceFieldKey: 'id',
        targetEntityKey: targetKey,
        targetFieldKey: rel.foreignKey,
        relationType: 'has_many',
      });
    } else if (rel.relation === 'many_to_many') {
      const throughKey = rel.through;
      if (!entityMap.has(throughKey)) {
        entityMap.set(throughKey, {
          key: throughKey,
          name: throughKey,
          isStub: true,
          col: 1,
          row: centerRow++,
          fields: [
            { key: 'id', isFK: false, isPK: true, label: 'id' },
            { key: rel.sourceKey, isFK: true, isPK: false, label: rel.sourceKey },
            { key: rel.targetKey, isFK: true, isPK: false, label: rel.targetKey },
          ],
        });
      }
      connectors.push({
        sourceEntityKey: entity.key,
        sourceFieldKey: 'id',
        targetEntityKey: throughKey,
        targetFieldKey: rel.sourceKey,
        relationType: 'many_to_many',
      });
    } else if (rel.relation === 'self') {
      connectors.push({
        sourceEntityKey: entity.key,
        sourceFieldKey: rel.key,
        targetEntityKey: entity.key,
        targetFieldKey: 'id',
        relationType: 'self',
      });
    } else if (rel.relation === 'polymorphic') {
      // Each polymorphic relation may target a different set of entities; use
      // the idField as part of the stub key so multiple polymorphic relations
      // on the same entity each get their own stub card.
      const stubKey = `__polymorphic_${rel.idField}__`;
      if (!entityMap.has(stubKey)) {
        entityMap.set(stubKey, {
          key: stubKey,
          name: 'Any Entity',
          isStub: true,
          col: 2,
          row: rightRow++,
          fields: [{ key: 'id', isFK: false, isPK: true, label: 'id' }],
        });
      }
      connectors.push({
        sourceEntityKey: entity.key,
        sourceFieldKey: rel.idField,
        targetEntityKey: stubKey,
        targetFieldKey: 'id',
        relationType: 'polymorphic',
      });
    }
  }

  return { entities: Array.from(entityMap.values()), connectors };
}
