import { resolveBinding } from '../../resolver/resolveValue';
import type { RuntimeContext } from '../../registry/resolverRegistry';

export function entityHeaderResolver(context: RuntimeContext, props: Record<string, unknown>) {
  const record = context.record ?? {};
  return {
    title: String(resolveBinding(record, props.title) ?? ''),
    subtitle: String(resolveBinding(record, props.subtitle) ?? ''),
    status: { label: String(resolveBinding(record, props.status) ?? '') },
  };
}
