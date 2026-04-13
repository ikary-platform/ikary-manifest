import type { StudioStorageModel } from './contracts';
import { loadStudioStorage, saveStudioStorage } from './persistence';

export class StudioStore {
  private model: StudioStorageModel;

  constructor(initial?: StudioStorageModel) {
    this.model = initial ?? loadStudioStorage();
  }

  snapshot(): StudioStorageModel {
    return {
      studio_session: this.model.studio_session,
      studio_messages: [...this.model.studio_messages],
      studio_artifacts: [...this.model.studio_artifacts],
    };
  }

  commit(next: StudioStorageModel): StudioStorageModel {
    this.model = next;
    saveStudioStorage(this.model);
    return this.snapshot();
  }

  mutate(mutator: (model: StudioStorageModel) => StudioStorageModel): StudioStorageModel {
    const next = mutator(this.snapshot());
    this.model = next;
    saveStudioStorage(this.model);
    return this.snapshot();
  }
}
