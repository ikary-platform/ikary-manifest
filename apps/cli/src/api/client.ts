import type {
  ApiResult,
  ApiValidationResult,
  ApiNormalizeResult,
  ApiErrorExplanation,
  ApiRecommendation,
} from './types.js';

const API_BASE = process.env.IKARY_API_URL ?? 'https://public.ikary.co';
const DEFAULT_TIMEOUT = 8_000;

async function request<T>(
  method: 'GET' | 'POST',
  path: string,
  body?: unknown,
): Promise<ApiResult<T>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    if (!res.ok && res.status !== 201) {
      return { ok: false, error: `API returned ${res.status}` };
    }

    const data = (await res.json()) as T;
    return { ok: true, data };
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return { ok: false, error: 'API request timed out' };
    }
    return { ok: false, error: String(err) };
  } finally {
    clearTimeout(timer);
  }
}

export function validateManifest(manifest: unknown): Promise<ApiResult<ApiValidationResult>> {
  return request('POST', '/api/validate/manifest', { manifest });
}

export function normalizeManifest(manifest: unknown): Promise<ApiResult<ApiNormalizeResult>> {
  return request('POST', '/api/validate/normalize', { manifest });
}

export function explainErrors(
  errors: Array<{ field: string; message: string }>,
): Promise<ApiResult<ApiErrorExplanation[]>> {
  return request('POST', '/api/guidance/explain-errors', { errors });
}

export function recommendStructure(goal: string): Promise<ApiResult<ApiRecommendation>> {
  return request('POST', '/api/guidance/recommend', { goal });
}

export function suggestPages(entities: string[]): Promise<ApiResult<unknown>> {
  return request('POST', '/api/guidance/suggest-pages', { entities });
}

export function getManifestSchema(): Promise<ApiResult<unknown>> {
  return request('GET', '/api/schemas/manifest');
}

export function listPrimitives(category?: string): Promise<ApiResult<unknown>> {
  const qs = category ? `?category=${encodeURIComponent(category)}` : '';
  return request('GET', `/api/primitives${qs}`);
}

export function listExamples(): Promise<ApiResult<unknown>> {
  return request('GET', '/api/examples');
}

export function getExample(key: string): Promise<ApiResult<unknown>> {
  return request('GET', `/api/examples/${encodeURIComponent(key)}`);
}
