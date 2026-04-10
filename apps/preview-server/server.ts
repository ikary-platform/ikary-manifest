/**
 * Production server for apps/preview-server.
 * Bundled via tsup — all @ikary/* workspace imports are inlined.
 * Serves the built Vite dist/ plus:
 *   GET /manifest.json    → compiled manifest JSON
 *   GET /manifest-events  → SSE stream for hot-reload
 *   GET /health           → { status: 'ok' }
 */
import express from 'express';
import rateLimit from 'express-rate-limit';
import { createServer } from 'node:http';
import { readFileSync, watch } from 'node:fs';
import { join } from 'node:path';
import { loadManifestFromFile } from '@ikary/loader';
import { compileCellApp, isValidationResult } from '@ikary/engine';

// __dirname is a CJS global provided by Node.js at runtime (tsup bundles to CJS)
declare const __dirname: string;

const manifestPath = process.env.IKARY_MANIFEST_PATH;
if (!manifestPath) {
  console.error('[preview-server] IKARY_MANIFEST_PATH is required');
  process.exit(1);
}

const app = express();
const port = process.env.PORT ?? 3000;

app.use(rateLimit({ windowMs: 60_000, max: 200, standardHeaders: true, legacyHeaders: false }));

// Serve static Vite build (index: false so / falls through to the SPA route
// which injects runtime config into the HTML).
// server.js lives in the same dist/ dir as the Vite output.
app.use(express.static(__dirname, { index: false }));

// Health check
app.get('/health', (_req: express.Request, res: express.Response) => res.json({ status: 'ok' }));

// Serve compiled manifest
app.get('/manifest.json', async (_req: express.Request, res: express.Response) => {
  try {
    const loaded = await loadManifestFromFile(manifestPath);
    if (!loaded.valid || !loaded.manifest) {
      res.status(422).json({ valid: false, errors: loaded.errors });
      return;
    }
    const compiled = compileCellApp(loaded.manifest as any);
    if (isValidationResult(compiled)) {
      res.status(422).json({ valid: false, errors: (compiled as any).errors });
      return;
    }
    res.json(compiled);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// SSE hot-reload endpoint
const sseClients = new Set<express.Response>();

app.get('/manifest-events', (req: express.Request, res: express.Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.write('data: {"type":"connected"}\n\n');
  sseClients.add(res);
  req.on('close', () => sseClients.delete(res));
});

// Watch manifest file for changes
watch(manifestPath, () => {
  for (const client of sseClients) {
    client.write('data: {"type":"manifest:changed"}\n\n');
  }
});

// ── Runtime config injection ─────────────────────────────────────────────────
// Vite replaces import.meta.env.VITE_* at build time, but in Docker the env
// var is only available at runtime.  We inject it into the HTML as a global so
// the client bundle can read it without a rebuild.
const runtimeConfig = JSON.stringify({
  dataApiUrl: process.env.VITE_DATA_API_URL ?? undefined,
});
const configScript = `<script>window.__IKARY_CONFIG__=${runtimeConfig}</script>`;

let indexHtml: string | null = null;
function getIndexHtml(): string {
  if (!indexHtml) {
    const htmlPath = join(__dirname, 'index.html');
    try {
      const raw = readFileSync(htmlPath, 'utf-8');
      indexHtml = raw.replace('</head>', `${configScript}\n</head>`);
    } catch {
      // Fallback when dist has not been built yet
      indexHtml = `<!doctype html><html><head>${configScript}</head><body><div id="root"></div></body></html>`;
    }
  }
  return indexHtml;
}

// SPA fallback (Express 5 requires named wildcards)
app.get('/{*splat}', (_req: express.Request, res: express.Response) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(getIndexHtml());
});

createServer(app).listen(port, () => {
  console.log(`[preview-server] Running on http://localhost:${port}`);
});
