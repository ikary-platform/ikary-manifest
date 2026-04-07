import { Fragment, type ReactNode } from 'react';
import { PrimitiveRenderer } from './PrimitiveRenderer';
import { getResolver } from '../registry/resolverRegistry';
import { getPrimitive } from '../registry/primitiveRegistry';
import { runAction } from '../registry/actionRegistry';
import type { RuntimeContext } from '../registry/resolverRegistry';
import type { RenderedAction, ActionDefinition } from '../types/ActionTypes';
import type { QueryDefinition } from '../query/queryEngine';
import { resolveBinding } from '../resolver/resolveValue';
import { RuntimeContextProvider } from '../context/RuntimeContextProvider';
import { useQuerySingle } from '../query/useQuerySingle';
import type { DataProviderDefinition } from '@ikary/contract';

export interface LayoutBlock {
  id?: string;
  primitive: string;
  props?: Record<string, unknown>;
  actions?: RenderedAction[];
  query?: QueryDefinition;
  dataProvider?: DataProviderDefinition;
  children?: LayoutBlock[];
}

export interface RenderLayoutOptions {
  blockWrapper?: (block: LayoutBlock, children: ReactNode | undefined) => ReactNode;
}

// ── Single-record query wrapper ───────────────────────────────────────────────

interface SingleQueryWrapperProps {
  block: LayoutBlock;
  context: RuntimeContext;
  baseProps: Record<string, unknown>;
  children: ReactNode | undefined;
}

function SingleQueryWrapper({ block, context, baseProps, children }: SingleQueryWrapperProps) {
  const { record, loading } = useQuerySingle(baseProps.query as QueryDefinition);

  let resolvedProps = baseProps;

  const queryContext = record ? { ...context, record: record as Record<string, unknown> } : context;
  const primitiveDef = getPrimitive(block.primitive);

  if (record) {
    const resolver = primitiveDef?.resolver ? undefined : getResolver(block.primitive);
    try {
      if (resolver) resolvedProps = resolver(queryContext, block.props ?? {});
    } catch (_e) {
      /* resolver errors are silently ignored */
    }
    // Re-inject actions that were attached before the query wrapper
    if (baseProps.actions) {
      resolvedProps = { ...resolvedProps, actions: baseProps.actions, onAction: baseProps.onAction };
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-48" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
          </div>
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-16" />
        </div>
      </div>
    );
  }

  return (
    <RuntimeContextProvider context={queryContext}>
      <PrimitiveRenderer primitive={block.primitive} props={resolvedProps} runtime={queryContext}>
        {children}
      </PrimitiveRenderer>
    </RuntimeContextProvider>
  );
}

// ── Block rendering ───────────────────────────────────────────────────────────

function renderBlocks(blocks: LayoutBlock[], context: RuntimeContext, options?: RenderLayoutOptions): ReactNode {
  return blocks.map((block, i) => {
    if (!block.primitive) {
      console.warn('[cell-runtime] Layout block missing primitive', block);
      return null;
    }

    const primitiveDef = getPrimitive(block.primitive);
    const resolver = primitiveDef?.resolver ? undefined : getResolver(block.primitive);

    let resolvedProps: Record<string, unknown> = block.props ?? {};

    try {
      if (resolver) {
        resolvedProps = resolver(context, block.props ?? {});
      }
    } catch (error) {
      console.error(`[cell-runtime] Resolver error for primitive "${block.primitive}"`, error);
    }

    if (block.actions && block.actions.length > 0) {
      const onAction = (action: ActionDefinition) => void runAction(context, action);
      resolvedProps = { ...resolvedProps, actions: block.actions, onAction };
    }

    if (block.query) {
      const resolvedFilter = block.query.filter
        ? Object.fromEntries(
            Object.entries(block.query.filter).map(([k, v]) => [k, resolveBinding(context.record ?? {}, v)]),
          )
        : undefined;
      resolvedProps = {
        ...resolvedProps,
        query: resolvedFilter !== undefined ? { ...block.query, filter: resolvedFilter } : block.query,
      };
    }

    // Resolve filter bindings in props-level query (e.g. set by a resolver)
    // Only when block.query is absent to avoid double-processing.
    if (!block.query && resolvedProps.query && typeof resolvedProps.query === 'object') {
      const q = resolvedProps.query as QueryDefinition;
      if (q.filter) {
        const resolvedFilter = Object.fromEntries(
          Object.entries(q.filter).map(([k, v]) => [k, resolveBinding(context.record ?? {}, v)]),
        );
        resolvedProps = { ...resolvedProps, query: { ...q, filter: resolvedFilter } };
      }
    }

    const key = block.id ?? `${block.primitive}-${i}`;

    // Build the rendered node (key added below)
    let node: ReactNode;

    // Controller primitives build their own RuntimeContext.
    // Pass raw LayoutBlock[] as `layout` so they can call renderLayout themselves.
    if (primitiveDef?.isController) {
      resolvedProps = { ...resolvedProps, layout: block.children ?? [] };
      node = <PrimitiveRenderer primitive={block.primitive} props={resolvedProps} runtime={context} />;
    } else {
      const renderedChildren = block.children ? renderBlocks(block.children, context, options) : undefined;

      if (block.query?.mode === 'single') {
        node = (
          <SingleQueryWrapper block={block} context={context} baseProps={resolvedProps} children={renderedChildren} />
        );
      } else {
        node = (
          <PrimitiveRenderer primitive={block.primitive} props={resolvedProps} runtime={context}>
            {renderedChildren}
          </PrimitiveRenderer>
        );
      }
    }

    if (options?.blockWrapper && block.dataProvider) {
      return <Fragment key={key}>{options.blockWrapper(block, node)}</Fragment>;
    }

    // Attach key directly via cloneElement-equivalent by wrapping in Fragment
    // (avoids mutating the node element)
    return <Fragment key={key}>{node}</Fragment>;
  });
}

export interface RenderLayoutProps {
  layout: LayoutBlock | LayoutBlock[];
  context: RuntimeContext;
  options?: RenderLayoutOptions;
}

export function renderLayout({ layout, context, options }: RenderLayoutProps): ReactNode {
  const blocks = Array.isArray(layout) ? layout : [layout];
  return <RuntimeContextProvider context={context}>{renderBlocks(blocks, context, options)}</RuntimeContextProvider>;
}
