import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LIBS = '../../libs';

/**
 * Resolves the project directory from the manifest path env var,
 * falling back to cwd when running without a manifest.
 */
function projectDir(): string {
  const manifestPath = process.env['IKARY_MANIFEST_PATH'];
  return manifestPath ? path.dirname(path.resolve(manifestPath)) : process.cwd();
}

/**
 * Vite plugin — resolves `virtual:custom-primitives`.
 *
 * Reads `ikary-primitives.yaml` from the project directory and generates
 * one side-effect import per registered `source` entry, so custom primitives
 * are registered into the in-memory registry before the app boots.
 *
 * Watches `ikary-primitives.yaml` for changes and triggers a full page reload
 * so newly added primitives appear immediately in the Primitive Studio.
 */
function primitivePlugin(): any {
  const VIRTUAL_ID = 'virtual:custom-primitives';
  const RESOLVED_ID = '\0' + VIRTUAL_ID;

  return {
    name: 'ikary-primitives',
    resolveId(id: string) {
      if (id === VIRTUAL_ID) return RESOLVED_ID;
    },
    load(id: string) {
      if (id !== RESOLVED_ID) return;

      const configPath = path.join(projectDir(), 'ikary-primitives.yaml');
      this.addWatchFile(configPath);
      if (!fs.existsSync(configPath)) return 'export default {};';

      try {
        // Inline YAML parsing to avoid a runtime dep at config time.
        // ikary-primitives.yaml is simple enough for a regex-based parser.
        const raw = fs.readFileSync(configPath, 'utf-8');
        const sourceMatches = [...raw.matchAll(/^\s+source:\s+['"]?(.+?)['"]?\s*$/gm)];
        const imports = sourceMatches
          .map((m) => m[1].trim())
          .filter(Boolean)
          .map((src) => {
            const abs = path.resolve(path.dirname(configPath), src);
            // /@fs/ prefix tells Vite this is an absolute filesystem path,
            // not a root-relative URL. Required for files outside the project root.
            return `import ${JSON.stringify('/@fs' + abs)};`;
          })
          .join('\n');
        return imports || 'export default {};';
      } catch {
        return 'export default {};';
      }
    },
    handleHotUpdate({ file, server }: { file: string; server: any }) {
      if (file.endsWith('ikary-primitives.yaml')) {
        server.ws.send({ type: 'full-reload' });
      }
    },
  };
}

/**
 * Vite plugin — serves manifest JSON and SSE hot-reload stream.
 */
function manifestPlugin(): any {
  return {
    name: 'ikary-manifest',
    configureServer(server: any) {
      server.middlewares.use('/health', (_req: any, res: any) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ status: 'ok' }));
      });

      const manifestPath = process.env['IKARY_MANIFEST_PATH'];

      server.middlewares.use('/manifest.json', async (_req: any, res: any) => {
        if (!manifestPath) {
          res.statusCode = 503;
          res.end(JSON.stringify({ error: 'IKARY_MANIFEST_PATH not set' }));
          return;
        }
        try {
          const { loadManifestFromFile } = await import('@ikary/loader');
          const { compileCellApp } = await import('@ikary/engine');
          const loaded = await loadManifestFromFile(manifestPath);
          if (!loaded.valid || !loaded.manifest) {
            res.statusCode = 422;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ valid: false, errors: loaded.errors }));
            return;
          }
          const compiled = compileCellApp(loaded.manifest);
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(compiled));
        } catch (err: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err.message }));
        }
      });

      const sseClients = new Set<any>();

      server.middlewares.use('/manifest-events', (_req: any, res: any) => {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.write('data: {"type":"connected"}\n\n');
        sseClients.add(res);
        _req.on('close', () => sseClients.delete(res));
      });

      if (manifestPath) {
        fs.watch(manifestPath, () => {
          for (const client of sseClients) {
            client.write('data: {"type":"manifest:changed"}\n\n');
          }
        });
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), manifestPlugin(), primitivePlugin()],
  server: {
    port: 3000,
    host: true,
    fs: {
      // '../..' resolves to the workspace root (needed for aliased libs)
      // projectDir() is the directory containing the user's manifest and
      // primitives/ folder — could be /manifest in Docker or any local path
      allow: ['../..', projectDir()],
    },
  },
  resolve: {
    alias: {
      '@ikary/contract': path.resolve(__dirname, `${LIBS}/contract/src/index.ts`),
      '@ikary/engine': path.resolve(__dirname, `${LIBS}/engine/src/index.ts`),
      '@ikary/presentation': path.resolve(__dirname, `${LIBS}/presentation/src/index.ts`),
      '@ikary/primitives/registry': path.resolve(__dirname, `${LIBS}/primitives/src/registry.ts`),
      '@ikary/primitives': path.resolve(__dirname, `${LIBS}/primitives/src/index.ts`),
      '@ikary/renderer': path.resolve(__dirname, `${LIBS}/renderer/src/index.ts`),
      '@ikary/primitive-contract': path.resolve(__dirname, `${LIBS}/primitive-contract/src/index.ts`),
      '@ikary/primitive-studio/ui': path.resolve(__dirname, `${LIBS}/primitive-studio/src/ui/index.ts`),
      '@ikary/primitive-studio': path.resolve(__dirname, `${LIBS}/primitive-studio/src/index.ts`),
    },
  },
  build: { outDir: 'dist' },
  optimizeDeps: {
    include: ['react', 'react-dom', '@tanstack/react-query'],
  },
});
