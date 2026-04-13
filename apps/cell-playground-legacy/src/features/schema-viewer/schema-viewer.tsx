import { useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import {
  SCHEMA_VIEWER_INDEX,
  getSchemaHumanContractMarkdown,
  getSchemaHumanContractPath,
  getSchemaViewerDetail,
} from './schema-viewer-model';
import { SchemaDependencyGraphWorkspace } from './schema-dependency-graph';

export function SchemaViewer() {
  const [workspace, setWorkspace] = useState<'details' | 'dependencies'>('details');

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Core Schema Explorer</CardTitle>
          <CardDescription>Browse schema details, or open dependency graph diagnostics.</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="inline-flex rounded-md border border-border overflow-hidden">
            <button
              type="button"
              onClick={() => setWorkspace('details')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                workspace === 'details'
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-background text-muted-foreground hover:bg-accent/60'
              }`}
            >
              Details
            </button>
            <button
              type="button"
              onClick={() => setWorkspace('dependencies')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors border-l border-border ${
                workspace === 'dependencies'
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-background text-muted-foreground hover:bg-accent/60'
              }`}
            >
              Dependencies
            </button>
          </div>
        </CardContent>
      </Card>

      {workspace === 'details' ? <SchemaDetailsWorkspace /> : <SchemaDependencyGraphWorkspace />}
    </div>
  );
}

function SchemaDetailsWorkspace() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSchemaName, setSelectedSchemaName] = useState<string>(() => SCHEMA_VIEWER_INDEX[0]?.name ?? '');
  const [humanContractMarkdown, setHumanContractMarkdown] = useState<string | null>(null);
  const [humanContractState, setHumanContractState] = useState<'idle' | 'loading' | 'loaded' | 'missing'>('idle');

  const sortedEntries = useMemo(() => SCHEMA_VIEWER_INDEX.slice().sort((a, b) => a.name.localeCompare(b.name)), []);

  const categoryOptions = useMemo(() => {
    const categories = new Set(sortedEntries.map((entry) => entry.category));
    const orderedCategories = Array.from(categories).sort((a, b) => a.localeCompare(b));
    return ['all', ...orderedCategories];
  }, [sortedEntries]);

  const filteredEntries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const hasSearch = query.length > 0;

    return sortedEntries.filter(
      (entry) =>
        (selectedCategory === 'all' || entry.category === selectedCategory) &&
        (!hasSearch ||
          [entry.name, entry.category, entry.sourcePath, entry.summary, entry.purpose].some((value) =>
            value.toLowerCase().includes(query),
          )),
    );
  }, [searchQuery, selectedCategory, sortedEntries]);

  useEffect(() => {
    if (!filteredEntries.some((entry) => entry.name === selectedSchemaName)) {
      setSelectedSchemaName(filteredEntries[0]?.name ?? '');
    }
  }, [filteredEntries, selectedSchemaName]);

  const selectedDetail = useMemo(
    () => (selectedSchemaName ? getSchemaViewerDetail(selectedSchemaName) : null),
    [selectedSchemaName],
  );

  useEffect(() => {
    let isCancelled = false;

    if (!selectedDetail) {
      setHumanContractMarkdown(null);
      setHumanContractState('idle');
      return () => {
        isCancelled = true;
      };
    }

    const humanContractPath = getSchemaHumanContractPath(selectedDetail.sourcePath);
    if (!humanContractPath) {
      setHumanContractMarkdown(null);
      setHumanContractState('missing');
      return () => {
        isCancelled = true;
      };
    }

    setHumanContractState('loading');
    setHumanContractMarkdown(null);

    void getSchemaHumanContractMarkdown(selectedDetail.sourcePath).then((markdown) => {
      if (isCancelled) {
        return;
      }

      if (markdown) {
        setHumanContractMarkdown(markdown);
        setHumanContractState('loaded');
        return;
      }

      setHumanContractMarkdown(null);
      setHumanContractState('missing');
    });

    return () => {
      isCancelled = true;
    };
  }, [selectedDetail]);

  const jsonSchemaText = useMemo(
    () => (selectedDetail ? JSON.stringify(selectedDetail.jsonSchema, null, 2) : '{}'),
    [selectedDetail],
  );

  const exampleText = useMemo(
    () => (selectedDetail ? JSON.stringify(selectedDetail.exampleJson, null, 2) : '{}'),
    [selectedDetail],
  );

  return (
    <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
      <Card className="h-fit">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Schemas</CardTitle>
          <CardDescription>
            Public exports from <code className="font-mono text-[11px]">@ikary/cell-contract-core</code>.
          </CardDescription>
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Filter by name, category, or purpose…"
            className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
          <select
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
            className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {categoryOptions.map((category) => (
              <option key={category} value={category}>
                {toCategoryLabel(category)}
              </option>
            ))}
          </select>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="rounded-md border border-border overflow-hidden">
            {filteredEntries.map((entry) => (
              <button
                type="button"
                key={entry.name}
                onClick={() => setSelectedSchemaName(entry.name)}
                className={`w-full text-left px-3 py-2 border-b border-border last:border-b-0 transition-colors ${
                  selectedSchemaName === entry.name
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-background hover:bg-accent/70'
                }`}
              >
                <p className="font-mono text-xs font-semibold truncate">{entry.name}</p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {entry.category} · {entry.zodTypeName}
                </p>
              </button>
            ))}
            {filteredEntries.length === 0 && (
              <div className="px-3 py-3 text-xs text-muted-foreground">No schemas match this filter.</div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 min-w-0">
        {selectedDetail ? (
          <>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <CardTitle className="text-xl font-semibold truncate">{selectedDetail.name}</CardTitle>
                    <CardDescription className="mt-1">{selectedDetail.summary}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => void copyToClipboard(selectedDetail.name)}
                    >
                      Copy Symbol
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        void copyToClipboard(`import { ${selectedDetail.name} } from '@ikary/cell-contract-core'`)
                      }
                    >
                      Copy Import
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 grid gap-3 text-sm">
                <p className="text-muted-foreground">{selectedDetail.purpose}</p>
                <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                  <MetaRow label="Category" value={selectedDetail.category} />
                  <MetaRow label="Zod Type" value={selectedDetail.zodTypeName} />
                  <MetaRow label="Source" value={selectedDetail.sourcePath} mono />
                  <MetaRow label="Exported" value={selectedDetail.isAvailable ? 'yes' : 'no'} />
                </div>
              </CardContent>
            </Card>

            <Card className="min-w-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Human Contract (Markdown)</CardTitle>
                <CardDescription>Canonical human-readable contract from the core contract folder.</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {humanContractState === 'loading' && (
                  <p className="text-xs text-muted-foreground">Loading contract markdown…</p>
                )}
                {humanContractState === 'missing' && (
                  <p className="text-xs text-muted-foreground">
                    No human contract markdown file found for this schema.
                  </p>
                )}
                {humanContractState === 'loaded' && humanContractMarkdown && (
                  <div className="rounded-md border border-border bg-muted/20 p-4 overflow-auto max-h-[28rem]">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({ children }) => (
                          <h1 className="text-base font-semibold text-foreground mt-0 mb-3">{children}</h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-sm font-semibold text-foreground mt-5 mb-2">{children}</h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-xs font-semibold text-foreground mt-4 mb-2">{children}</h3>
                        ),
                        p: ({ children }) => <p className="text-xs leading-6 text-foreground/95 mb-3">{children}</p>,
                        ul: ({ children }) => (
                          <ul className="list-disc pl-5 space-y-1 text-xs text-foreground/95 mb-3">{children}</ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal pl-5 space-y-1 text-xs text-foreground/95 mb-3">{children}</ol>
                        ),
                        li: ({ children }) => <li className="leading-6">{children}</li>,
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-2 border-border pl-3 italic text-xs text-muted-foreground mb-3">
                            {children}
                          </blockquote>
                        ),
                        a: ({ children, href }) => (
                          <a
                            href={href}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 dark:text-blue-400 underline underline-offset-2 break-all"
                          >
                            {children}
                          </a>
                        ),
                        code: ({ children, className }) => (
                          <code
                            className={
                              className
                                ? `font-mono text-[11px] text-foreground ${className}`
                                : 'rounded bg-muted px-1 py-0.5 font-mono text-[11px] text-foreground'
                            }
                          >
                            {children}
                          </code>
                        ),
                        pre: ({ children }) => (
                          <pre className="rounded-md border border-border bg-background px-3 py-2 overflow-x-auto text-[11px] mb-3">
                            {children}
                          </pre>
                        ),
                        hr: () => <hr className="border-border my-4" />,
                        table: ({ children }) => (
                          <div className="overflow-x-auto mb-3">
                            <table className="w-full text-xs border border-border">{children}</table>
                          </div>
                        ),
                        th: ({ children }) => (
                          <th className="border border-border bg-muted px-2 py-1.5 text-left font-semibold">
                            {children}
                          </th>
                        ),
                        td: ({ children }) => (
                          <td className="border border-border px-2 py-1.5 align-top">{children}</td>
                        ),
                      }}
                    >
                      {humanContractMarkdown}
                    </ReactMarkdown>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid gap-4 xl:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">References</CardTitle>
                  <CardDescription>Schemas directly used by this contract.</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <SchemaReferenceList
                    references={selectedDetail.references}
                    onSelect={(name) => setSelectedSchemaName(name)}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Used By</CardTitle>
                  <CardDescription>Schemas that reference this one.</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <SchemaReferenceList
                    references={selectedDetail.referencedBy}
                    onSelect={(name) => setSelectedSchemaName(name)}
                  />
                </CardContent>
              </Card>
            </div>

            {selectedDetail.topLevelFields.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Top-Level Shape</CardTitle>
                  <CardDescription>First-level properties resolved from the Zod schema.</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="rounded-md border border-border overflow-hidden">
                    {selectedDetail.topLevelFields.map((field) => (
                      <div
                        key={field.key}
                        className="grid grid-cols-[1.5fr_1fr_auto] items-center gap-2 px-3 py-2 border-b border-border last:border-b-0"
                      >
                        <span className="font-mono text-xs truncate">{field.key}</span>
                        <span className="text-xs text-muted-foreground truncate">{field.type}</span>
                        <span
                          className={`text-[11px] font-medium ${
                            field.required ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'
                          }`}
                        >
                          {field.required ? 'required' : 'optional'}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4 xl:grid-cols-2">
              <Card className="min-w-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Zod-Derived JSON Schema</CardTitle>
                  <CardDescription>
                    Generated from the exported Zod object with strict pointer references.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <pre className="rounded-md border border-border bg-muted/30 p-3 text-[11px] leading-relaxed font-mono overflow-auto max-h-[34rem]">
                    {jsonSchemaText}
                  </pre>
                </CardContent>
              </Card>

              <Card className="min-w-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Detailed Example JSON</CardTitle>
                  <CardDescription>
                    Auto-generated sample payload including optional branches for developer guidance.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <pre className="rounded-md border border-border bg-muted/30 p-3 text-[11px] leading-relaxed font-mono overflow-auto max-h-[34rem]">
                    {exampleText}
                  </pre>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Schema Detail Unavailable</CardTitle>
              <CardDescription>This schema export could not be resolved at runtime.</CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}

function SchemaReferenceList({
  references,
  onSelect,
}: {
  references: readonly string[];
  onSelect: (name: string) => void;
}) {
  if (references.length === 0) {
    return <p className="text-xs text-muted-foreground">No linked schemas.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {references.map((name) => (
        <button
          type="button"
          key={name}
          onClick={() => onSelect(name)}
          className="rounded-md border border-border bg-background px-2 py-1 text-[11px] font-mono hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          {name}
        </button>
      ))}
    </div>
  );
}

function MetaRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="font-medium shrink-0">{label}:</span>
      <span className={`${mono ? 'font-mono' : ''} truncate`}>{value}</span>
    </div>
  );
}

async function copyToClipboard(text: string): Promise<void> {
  if (typeof navigator === 'undefined' || !navigator.clipboard) {
    return;
  }

  await navigator.clipboard.writeText(text);
}

function toCategoryLabel(category: string): string {
  if (category === 'all') {
    return 'All categories';
  }

  return category
    .split('_')
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}
