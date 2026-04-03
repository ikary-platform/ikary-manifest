import { registerAction } from '../registry/actionRegistry';

registerAction('navigate', (context, params) => {
  context.actions.navigate(String(params?.path ?? '/'));
});

registerAction('notify', (context, params) => {
  context.ui.notify(String(params?.message ?? ''));
});

registerAction('delete_entity', async (context, params) => {
  const id = String(params?.id ?? context.record?.id ?? '');
  if (!id) return;
  const confirmed = await context.ui.confirm(`Delete this ${context.entity.name}?`);
  if (confirmed) {
    await context.actions.delete(context.entity.key, id);
    context.ui.notify(`${context.entity.name} deleted`);
  }
});

registerAction('create_entity', async (context, params) => {
  await context.actions.mutate(context.entity.key, params?.payload ?? {});
});

registerAction('update_entity', async (context, params) => {
  const payload = { ...(context.record ?? {}), ...(params?.payload ?? {}) };
  await context.actions.mutate(context.entity.key, payload);
});
