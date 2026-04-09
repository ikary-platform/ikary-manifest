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
import { watch } from 'node:fs';
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

// Serve static Vite build (server.js lives in the same dist/ dir as the Vite output)
app.use(express.static(__dirname));

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

// SPA fallback (Express 5 requires named wildcards)
app.get('/{*splat}', (_req: express.Request, res: express.Response) => {
  res.sendFile(join(__dirname, 'index.html'));
});

createServer(app).listen(port, () => {
  console.log(`[preview-server] Running on http://localhost:${port}`);
});
