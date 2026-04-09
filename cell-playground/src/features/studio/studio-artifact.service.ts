import type { StudioArtifactRecord, StudioArtifactType, StudioCurrentArtifactSet, StudioPhase } from './contracts';
import { makeId, nowIso } from './ids';
import { StudioStore } from './studio-store';

function toCurrentKey(type: StudioArtifactType): keyof StudioCurrentArtifactSet {
  switch (type) {
    case 'entity_schema':
      return 'entity_schema';
    case 'action':
      return 'action';
    case 'permission':
      return 'permission';
    default:
      return type;
  }
}

export class StudioArtifactService {
  constructor(private readonly store: StudioStore) {}

  list(sessionId: string): StudioArtifactRecord[] {
    return this.store
      .snapshot()
      .studio_artifacts.filter((artifact) => artifact.session_id === sessionId)
      .sort((a, b) => a.created_at.localeCompare(b.created_at));
  }

  getCurrentArtifact(sessionId: string, type: StudioArtifactType): StudioArtifactRecord | null {
    const artifacts = this.list(sessionId);
    const current = artifacts
      .filter((artifact) => artifact.artifact_type === type && artifact.is_current)
      .sort((a, b) => b.version - a.version);

    return current[0] ?? null;
  }

  getCurrentArtifactSet(sessionId: string): StudioCurrentArtifactSet {
    const result: StudioCurrentArtifactSet = {};

    const allTypes: StudioArtifactType[] = [
      'discovery',
      'plan',
      'manifest',
      'entity_schema',
      'layout',
      'action',
      'permission',
      'patch',
    ];

    for (const type of allTypes) {
      const current = this.getCurrentArtifact(sessionId, type);
      if (!current) {
        continue;
      }
      const key = toCurrentKey(type);
      result[key] = current.json_payload as never;
    }

    return result;
  }

  putCurrent(sessionId: string, type: StudioArtifactType, phase: StudioPhase, payload: unknown): StudioArtifactRecord {
    const now = nowIso();
    const existing = this.list(sessionId).filter((artifact) => artifact.artifact_type === type);
    const version = existing.length > 0 ? Math.max(...existing.map((artifact) => artifact.version)) + 1 : 1;

    const record: StudioArtifactRecord = {
      id: makeId('studio_artifact'),
      session_id: sessionId,
      artifact_type: type,
      phase,
      version,
      json_payload: payload,
      is_current: true,
      created_at: now,
    };

    this.store.mutate((model) => ({
      ...model,
      studio_artifacts: model.studio_artifacts
        .map((artifact) =>
          artifact.session_id === sessionId && artifact.artifact_type === type
            ? { ...artifact, is_current: false }
            : artifact,
        )
        .concat(record),
    }));

    return record;
  }

  putManyCurrent(
    sessionId: string,
    phase: StudioPhase,
    artifacts: Array<{ type: StudioArtifactType; payload: unknown }>,
  ): StudioArtifactRecord[] {
    return artifacts.map((entry) => this.putCurrent(sessionId, entry.type, phase, entry.payload));
  }
}
