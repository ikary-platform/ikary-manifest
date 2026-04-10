import type { CellManifestV1, EntityDefinition } from '@ikary/cell-contract-core';

export type StudioPhase = 'phase1_define' | 'phase2_plan' | 'phase3_generate' | 'phase4_tweak';

export type StudioSessionStatus = 'active' | 'archived';

export type StudioMessageRole = 'user' | 'assistant' | 'system';

export type StudioArtifactType =
  | 'discovery'
  | 'plan'
  | 'manifest'
  | 'entity_schema'
  | 'layout'
  | 'action'
  | 'permission'
  | 'patch';

export interface StudioSessionRecord {
  id: string;
  tenant_id: string;
  workspace_id: string;
  created_by: string;
  current_phase: StudioPhase;
  status: StudioSessionStatus;
  created_at: string;
  updated_at: string;
}

export interface StudioMessageRecord {
  id: string;
  session_id: string;
  role: StudioMessageRole;
  visible_text: string;
  created_at: string;
}

export interface StudioArtifactRecord {
  id: string;
  session_id: string;
  artifact_type: StudioArtifactType;
  phase: StudioPhase;
  version: number;
  json_payload: unknown;
  is_current: boolean;
  created_at: string;
}

export interface DiscoveryArtifact {
  cell_name: string;
  domain: string;
  summary: string;
  key_entities: string[];
  assumptions: string[];
  unknowns: string[];
}

export interface PlanArtifact {
  proposed_cell_name: string;
  proposed_domain: string;
  entities_to_generate: string[];
  pages_to_generate: string[];
  actions_to_generate: string[];
  permissions_to_generate: string[];
  explanation_summary: string;
  generation_ready: boolean;
}

export interface StudioLayoutDefinition {
  key: string;
  type: 'entity-list' | 'entity-detail' | 'entity-create' | 'entity-edit' | 'dashboard' | 'custom';
  title: string;
  path: string;
  entity?: string;
  blocks?: unknown[];
}

export interface StudioActionDefinition {
  key: string;
  label: string;
  intent: 'create' | 'update' | 'delete' | 'submit' | 'confirm' | 'cancel' | 'open' | 'close' | 'toggle' | 'custom';
  target_entity?: string;
  target_page?: string;
  required_permission?: string;
  description?: string;
}

export interface StudioPermissionDefinition {
  key: string;
  entity_key: string;
  action: 'read' | 'create' | 'update' | 'delete' | 'admin';
  scope: string;
  description?: string;
}

export interface InitialGenerationArtifactSet {
  cell_manifest: CellManifestV1;
  entity_schemas: EntityDefinition[];
  layouts: StudioLayoutDefinition[];
  actions: StudioActionDefinition[];
  permissions: StudioPermissionDefinition[];
}

export interface PatchOperation {
  op: 'add' | 'remove' | 'replace' | 'move';
  path: string;
  from?: string;
  value?: unknown;
}

export interface PatchArtifact {
  patch_operations: PatchOperation[];
}

export interface ReplacementArtifacts {
  cell_manifest?: CellManifestV1;
  entity_schemas?: EntityDefinition[];
  layouts?: StudioLayoutDefinition[];
  actions?: StudioActionDefinition[];
  permissions?: StudioPermissionDefinition[];
}

export interface Phase1Output {
  assistant_visible_text: string;
  discovery: DiscoveryArtifact;
}

export interface Phase2Output {
  assistant_visible_text: string;
  plan: PlanArtifact;
}

export interface Phase3Output {
  assistant_visible_text: string;
  initial_generation: InitialGenerationArtifactSet;
}

export interface Phase4Output {
  assistant_visible_text: string;
  mode: 'patch' | 'replacement';
  patch?: PatchArtifact;
  replacement_artifacts?: ReplacementArtifacts;
}

export interface StudioCurrentArtifactSet {
  discovery?: DiscoveryArtifact;
  plan?: PlanArtifact;
  manifest?: CellManifestV1;
  entity_schema?: EntityDefinition[];
  layout?: StudioLayoutDefinition[];
  action?: StudioActionDefinition[];
  permission?: StudioPermissionDefinition[];
  patch?: PatchArtifact;
}

export interface StudioStorageModel {
  studio_session: StudioSessionRecord | null;
  studio_messages: StudioMessageRecord[];
  studio_artifacts: StudioArtifactRecord[];
}

export interface StudioPhaseContext {
  phase: StudioPhase;
  session: StudioSessionRecord;
  messages: StudioMessageRecord[];
  currentArtifacts: StudioCurrentArtifactSet;
}

export interface StudioOrchestrationResult {
  phase: StudioPhase;
  assistantText: string;
  validationError: string | null;
  retriesUsed: number;
  statusWord: string;
}

export interface StudioPreviewModel {
  compiledManifest: CellManifestV1 | null;
  compileErrors: string[];
  entitySummary: Array<{
    key: string;
    name: string;
    fieldCount: number;
  }>;
  manifestSummary: {
    cellKey: string;
    cellName: string;
    pageCount: number;
    entityCount: number;
  } | null;
}

export type StudioDebugTraceSource =
  | 'llm'
  | 'studio-orchestrator'
  | 'studio-validation'
  | 'studio-patch'
  | 'studio-preview'
  | 'storage'
  | 'ui';

export type StudioDebugTraceLevel = 'info' | 'warn' | 'error';

export interface StudioDebugTraceEvent {
  at: string;
  source: StudioDebugTraceSource;
  component: string;
  stage: string;
  level: StudioDebugTraceLevel;
  message: string;
  details?: unknown;
}

export type StudioTraceLogger = (event: StudioDebugTraceEvent) => void;

export interface StudioLlmExchangeRecord {
  at: string;
  phase: StudioPhase;
  attempt: number;
  max_retries: number;
  model: string;
  system_prompt: string;
  user_prompt: string;
  request_body?: unknown;
  response_payload?: unknown;
  response_raw?: unknown;
  error_message?: string;
  error_response?: unknown;
}

export type StudioLlmExchangeLogger = (exchange: StudioLlmExchangeRecord) => void;
