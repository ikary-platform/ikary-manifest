import type { StudioPhase } from './contracts';
import { responseTextFormatForPhase } from './phase-schemas';

interface OpenAiResponsesClientOptions {
  apiKey?: string;
  model?: string;
  baseUrl?: string;
}

interface GenerateStructuredInput {
  phase: StudioPhase;
  systemPrompt: string;
  userPrompt: string;
}

interface GenerateStructuredResult {
  payload: unknown;
  rawResponse: unknown;
  requestBody: unknown;
}

const STUDIO_MODEL_STORAGE_KEY = 'ikary.studio.model.v1';
const STUDIO_MODEL_CATALOG_STORAGE_KEY = 'ikary.studio.model-catalog.v1';
const STUDIO_MODEL_CATALOG_TTL_MS = 5 * 60 * 1000;

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && !!window.localStorage;
}

function readStoredModel(): string | null {
  if (!canUseStorage()) {
    return null;
  }

  const value = window.localStorage.getItem(STUDIO_MODEL_STORAGE_KEY);
  return value && value.trim() ? value.trim() : null;
}

function storeModel(model: string): void {
  if (!canUseStorage()) {
    return;
  }
  window.localStorage.setItem(STUDIO_MODEL_STORAGE_KEY, model);
}

interface ModelCatalogCacheRecord {
  ts: number;
  models: string[];
}

function readCachedModelCatalog(): string[] | null {
  if (!canUseStorage()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STUDIO_MODEL_CATALOG_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as ModelCatalogCacheRecord;
    if (!parsed || !Array.isArray(parsed.models) || typeof parsed.ts !== 'number') {
      return null;
    }
    if (Date.now() - parsed.ts > STUDIO_MODEL_CATALOG_TTL_MS) {
      return null;
    }
    return parsed.models.filter((value): value is string => typeof value === 'string' && value.trim().length > 0);
  } catch {
    return null;
  }
}

function writeCachedModelCatalog(models: string[]): void {
  if (!canUseStorage()) {
    return;
  }

  const payload: ModelCatalogCacheRecord = {
    ts: Date.now(),
    models,
  };
  window.localStorage.setItem(STUDIO_MODEL_CATALOG_STORAGE_KEY, JSON.stringify(payload));
}

function extractErrorMessage(payload: unknown): string {
  if (!payload || typeof payload !== 'object') {
    return 'OpenAI request failed.';
  }

  const error = (payload as { error?: { message?: string } }).error;
  if (error?.message) {
    return error.message;
  }

  return 'OpenAI request failed.';
}

function extractOutputText(responseJson: unknown): string {
  if (!responseJson || typeof responseJson !== 'object') {
    throw new Error('OpenAI response is not an object.');
  }

  const responseObj = responseJson as {
    output_parsed?: unknown;
    output_text?: unknown;
    output?: Array<{ content?: Array<{ type?: string; text?: unknown; value?: unknown; json?: unknown }> }>;
  };

  if (responseObj.output_parsed !== undefined) {
    return JSON.stringify(responseObj.output_parsed);
  }

  if (typeof responseObj.output_text === 'string' && responseObj.output_text.trim().length > 0) {
    return responseObj.output_text;
  }

  if (Array.isArray(responseObj.output)) {
    for (const item of responseObj.output) {
      const content = item.content;
      if (!Array.isArray(content)) {
        continue;
      }

      for (const part of content) {
        if (part.json !== undefined) {
          return JSON.stringify(part.json);
        }
        if (typeof part.text === 'string' && part.text.trim().length > 0) {
          return part.text;
        }
        if (typeof part.value === 'string' && part.value.trim().length > 0) {
          return part.value;
        }
      }
    }
  }

  throw new Error('No text output found in OpenAI response.');
}

export class OpenAiResponsesRequestError extends Error {
  readonly requestBody: unknown;
  readonly responseBody: unknown;

  constructor(message: string, requestBody: unknown, responseBody: unknown) {
    super(message);
    this.name = 'OpenAiResponsesRequestError';
    this.requestBody = requestBody;
    this.responseBody = responseBody;
  }
}

export class OpenAiResponsesClient {
  private readonly apiKey: string;
  private model: string;
  private readonly baseUrl: string;

  constructor(options: OpenAiResponsesClientOptions = {}) {
    const envApiKey =
      typeof import.meta !== 'undefined' ? (import.meta.env.VITE_OPENAI_API_KEY as string | undefined) : undefined;
    const envModel =
      typeof import.meta !== 'undefined' ? (import.meta.env.VITE_STUDIO_MODEL as string | undefined) : undefined;
    const storedModel = readStoredModel();

    this.apiKey = options.apiKey ?? envApiKey ?? '';
    this.model = options.model ?? storedModel ?? envModel ?? 'gpt-4o-mini';
    this.baseUrl = options.baseUrl ?? 'https://api.openai.com/v1';

    if (this.model.trim()) {
      storeModel(this.model);
    }
  }

  assertConfigured(): void {
    if (!this.apiKey) {
      throw new Error('Missing VITE_OPENAI_API_KEY. Add it to your environment for Studio generation.');
    }
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  getModel(): string {
    return this.model;
  }

  setModel(model: string): void {
    const nextModel = model.trim();
    if (!nextModel) {
      return;
    }
    this.model = nextModel;
    storeModel(nextModel);
  }

  async listModels(options: { forceRefresh?: boolean } = {}): Promise<string[]> {
    if (!options.forceRefresh) {
      const cached = readCachedModelCatalog();
      if (cached && cached.length > 0) {
        return cached;
      }
    }

    this.assertConfigured();

    const response = await fetch(`${this.baseUrl}/models`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    const responseJson = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(extractErrorMessage(responseJson));
    }

    const models = Array.isArray((responseJson as { data?: unknown[] })?.data)
      ? (responseJson as { data: Array<{ id?: unknown }> }).data
          .map((item) => (typeof item.id === 'string' ? item.id : null))
          .filter((value): value is string => Boolean(value && value.trim()))
      : [];

    const unique = [...new Set(models)].sort((a, b) => a.localeCompare(b));
    writeCachedModelCatalog(unique);
    return unique;
  }

  async generateStructured(input: GenerateStructuredInput): Promise<GenerateStructuredResult> {
    this.assertConfigured();

    const requestBody = {
      model: this.model,
      input: [
        {
          role: 'system',
          content: [
            {
              type: 'input_text',
              text: input.systemPrompt,
            },
          ],
        },
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: input.userPrompt,
            },
          ],
        },
      ],
      text: {
        format: responseTextFormatForPhase(input.phase),
      },
    };

    const response = await fetch(`${this.baseUrl}/responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    const responseJson = await response.json().catch(() => null);

    if (!response.ok) {
      throw new OpenAiResponsesRequestError(extractErrorMessage(responseJson), requestBody, responseJson);
    }

    const outputText = extractOutputText(responseJson);

    let payload: unknown;
    try {
      payload = JSON.parse(outputText);
    } catch (error) {
      throw new Error(
        `OpenAI structured output was not valid JSON: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
    }

    return {
      payload,
      rawResponse: responseJson,
      requestBody,
    };
  }
}
