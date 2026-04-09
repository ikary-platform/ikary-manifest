import type { StudioPhase, StudioSessionRecord } from './contracts';
import { makeId, nowIso } from './ids';
import { StudioStore } from './studio-store';

export const STUDIO_LOCAL_TENANT_ID = 'studio-tenant-local';
export const STUDIO_LOCAL_WORKSPACE_ID = 'studio-workspace-local';
export const STUDIO_LOCAL_USER_ID = 'studio-user-local';

export class StudioSessionService {
  constructor(private readonly store: StudioStore) {}

  ensureSession(): StudioSessionRecord {
    const snapshot = this.store.snapshot();
    if (snapshot.studio_session) {
      return snapshot.studio_session;
    }

    const now = nowIso();
    const session: StudioSessionRecord = {
      id: makeId('studio_session'),
      tenant_id: STUDIO_LOCAL_TENANT_ID,
      workspace_id: STUDIO_LOCAL_WORKSPACE_ID,
      created_by: STUDIO_LOCAL_USER_ID,
      current_phase: 'phase1_define',
      status: 'active',
      created_at: now,
      updated_at: now,
    };

    this.store.mutate((model) => ({ ...model, studio_session: session }));
    return session;
  }

  getSession(): StudioSessionRecord | null {
    return this.store.snapshot().studio_session;
  }

  setPhase(phase: StudioPhase): StudioSessionRecord {
    const current = this.ensureSession();
    const updated: StudioSessionRecord = {
      ...current,
      current_phase: phase,
      updated_at: nowIso(),
    };

    this.store.mutate((model) => ({ ...model, studio_session: updated }));
    return updated;
  }

  touch(): StudioSessionRecord {
    const current = this.ensureSession();
    const updated: StudioSessionRecord = {
      ...current,
      updated_at: nowIso(),
    };

    this.store.mutate((model) => ({ ...model, studio_session: updated }));
    return updated;
  }
}
