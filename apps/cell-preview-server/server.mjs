/**
 * Production server for apps/cell-preview-server.
 * Serves the built Vite dist/ plus:
 *   GET /manifest.json    → compiled manifest JSON
 *   GET /manifest-events  → SSE stream for hot-reload
 *   GET /health           → { status: 'ok' }
 */
import express from 'express';
import rateLimit from 'express-rate-limit';
import { createServer } from 'node:http';
import { readFileSync, watch } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const manifestPath = process.env.IKARY_MANIFEST_PATH;
if (!manifestPath) {
  console.error('[preview-server] IKARY_MANIFEST_PATH is required');
  process.exit(1);
}

// Dynamically load loader + engine from the bundled node_modules
const { loadManifestFromFile } = await import('@ikary/cell-loader');
const { compileCellApp, isValidationResult } = await import('@ikary/cell-engine');

const app = express();
const port = process.env.PORT ?? 3000;

app.use(rateLimit({ windowMs: 60_000, max: 200, standardHeaders: true, legacyHeaders: false }));

// Serve static Vite build (index: false so / falls through to the SPA route
// which injects runtime config into the HTML)
app.use(express.static(join(__dirname, 'dist'), { index: false }));

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Serve compiled manifest
app.get('/manifest.json', async (_req, res) => {
  try {
    const loaded = await loadManifestFromFile(manifestPath);
    if (!loaded.valid || !loaded.manifest) {
      res.status(422).json({ valid: false, errors: loaded.errors });
      return;
    }
    const compiled = compileCellApp(loaded.manifest);
    if (isValidationResult(compiled)) {
      res.status(422).json({ valid: false, errors: compiled.errors });
      return;
    }
    res.json(compiled);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SSE hot-reload endpoint
const sseClients = new Set();

app.get('/manifest-events', (req, res) => {
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
const runtimeConfig = JSON.stringify({
  dataApiUrl: process.env.VITE_DATA_API_URL ?? undefined,
});
const configScript = `<script>window.__IKARY_CONFIG__=${runtimeConfig}</script>`;

let indexHtml = null;
function getIndexHtml() {
  if (!indexHtml) {
    const htmlPath = join(__dirname, 'dist', 'index.html');
    try {
      const raw = readFileSync(htmlPath, 'utf-8');
      indexHtml = raw.replace('</head>', `${configScript}\n</head>`);
    } catch {
      // dist/ may not exist during development or E2E tests — return a minimal shell
      indexHtml = `<!doctype html><html><head>${configScript}</head><body><div id="root"></div></body></html>`;
    }
  }
  return indexHtml;
}

// SPA fallback (Express 5 requires named wildcards)
app.get('/{*splat}', (_req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(getIndexHtml());
});

createServer(app).listen(port, () => {
  console.log(`[preview-server] Running on http://localhost:${port}`);
});
