import type { StudioStorageModel } from './contracts';

const STORAGE_KEY = 'ikary.studio.v1';

const EMPTY_STORAGE: StudioStorageModel = {
  studio_session: null,
  studio_messages: [],
  studio_artifacts: [],
};

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && !!window.localStorage;
}

export function loadStudioStorage(): StudioStorageModel {
  if (!canUseStorage()) {
    return EMPTY_STORAGE;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return EMPTY_STORAGE;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<StudioStorageModel>;
    return {
      studio_session: parsed.studio_session ?? null,
      studio_messages: Array.isArray(parsed.studio_messages) ? parsed.studio_messages : [],
      studio_artifacts: Array.isArray(parsed.studio_artifacts) ? parsed.studio_artifacts : [],
    };
  } catch {
    return EMPTY_STORAGE;
  }
}

export function saveStudioStorage(model: StudioStorageModel): void {
  if (!canUseStorage()) {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(model));
}

export function clearStudioStorage(): void {
  if (!canUseStorage()) {
    return;
  }
  window.localStorage.removeItem(STORAGE_KEY);
}

export function studioStorageKey(): string {
  return STORAGE_KEY;
}
