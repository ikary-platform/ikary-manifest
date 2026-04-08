import type { StudioMessageRecord, StudioMessageRole } from './contracts';
import { makeId, nowIso } from './ids';
import { StudioStore } from './studio-store';

export class StudioMessageService {
  constructor(private readonly store: StudioStore) {}

  list(sessionId: string): StudioMessageRecord[] {
    return this.store
      .snapshot()
      .studio_messages.filter((message) => message.session_id === sessionId)
      .sort((a, b) => a.created_at.localeCompare(b.created_at));
  }

  append(sessionId: string, role: StudioMessageRole, visibleText: string): StudioMessageRecord {
    const record: StudioMessageRecord = {
      id: makeId('studio_msg'),
      session_id: sessionId,
      role,
      visible_text: visibleText,
      created_at: nowIso(),
    };

    this.store.mutate((model) => ({
      ...model,
      studio_messages: [...model.studio_messages, record],
    }));

    return record;
  }

  appendUser(sessionId: string, visibleText: string): StudioMessageRecord {
    return this.append(sessionId, 'user', visibleText);
  }

  appendAssistant(sessionId: string, visibleText: string): StudioMessageRecord {
    return this.append(sessionId, 'assistant', visibleText);
  }

  appendSystem(sessionId: string, visibleText: string): StudioMessageRecord {
    return this.append(sessionId, 'system', visibleText);
  }
}
