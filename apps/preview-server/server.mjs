/**
 * Production server for apps/preview-server.
 * Serves the built Vite dist/ plus:
 *   GET /manifest.json    → compiled manifest JSON
 *   GET /manifest-events  → SSE stream for hot-reload
 *   GET /health           → { status: 'ok' }
 */
import express from 'express';
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
const { loadManifestFromFile } = await import('@ikary/loader');
const { compileCellApp, isValidationResult } = await import('@ikary/engine');

const app = express();
const port = process.env.PORT ?? 3000;

// Serve static Vite build
app.use(express.static(join(__dirname, 'dist')));

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

// SPA fallback
app.get('*', (_req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

createServer(app).listen(port, () => {
  console.log(`[preview-server] Running on http://localhost:${port}`);
});
