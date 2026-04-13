import type { RelationDefinition } from '@ikary/cell-contract';

const RELATION_COLORS: Record<string, string> = {
  belongs_to: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  has_many: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  many_to_many: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  self: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  polymorphic: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

function relationTarget(r: RelationDefinition): string | null {
  if ('entity' in r) return r.entity;
  return null;
}

function relationForeignKey(r: RelationDefinition): string | null {
  if ('foreignKey' in r && r.foreignKey) return r.foreignKey;
  return null;
}

function isRequired(r: RelationDefinition): boolean {
  return r.relation === 'belongs_to' && r.required === true;
}

export function RelationsSection({ relations }: { relations: RelationDefinition[] }) {
  if (!relations || relations.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Relations</h3>
      <div className="flex flex-wrap gap-3">
        {relations.map((rel) => (
          <div
            key={rel.key}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-800 min-w-[200px] max-w-[300px]"
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${RELATION_COLORS[rel.relation] ?? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
              >
                {rel.relation}
              </span>
              {isRequired(rel) && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200">
                  Required
                </span>
              )}
            </div>

            <p className="text-xs font-mono text-gray-900 dark:text-gray-100 mb-1">{rel.key}</p>

            {relationTarget(rel) && (
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                <span className="font-medium text-gray-600 dark:text-gray-300">Target:</span>{' '}
                {relationTarget(rel)}
              </p>
            )}

            {relationForeignKey(rel) && (
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                <span className="font-medium text-gray-600 dark:text-gray-300">FK:</span>{' '}
                <code className="text-[10px] bg-gray-100 dark:bg-gray-700 px-1 rounded">
                  {relationForeignKey(rel)}
                </code>
              </p>
            )}

            {rel.relation === 'many_to_many' && (
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                <span className="font-medium text-gray-600 dark:text-gray-300">Through:</span>{' '}
                {rel.through}
              </p>
            )}

            {rel.relation === 'self' && (
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                <span className="font-medium text-gray-600 dark:text-gray-300">Kind:</span>{' '}
                {rel.kind}
              </p>
            )}

            {rel.relation === 'polymorphic' && (
              <>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  <span className="font-medium text-gray-600 dark:text-gray-300">Type field:</span>{' '}
                  <code className="text-[10px] bg-gray-100 dark:bg-gray-700 px-1 rounded">
                    {rel.typeField}
                  </code>
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  <span className="font-medium text-gray-600 dark:text-gray-300">ID field:</span>{' '}
                  <code className="text-[10px] bg-gray-100 dark:bg-gray-700 px-1 rounded">
                    {rel.idField}
                  </code>
                </p>
                {rel.allowedEntities && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {rel.allowedEntities.map((e) => (
                      <span
                        key={e}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                      >
                        {e}
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}

            {rel.label && (
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 italic">
                {rel.label}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
