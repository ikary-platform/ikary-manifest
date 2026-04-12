import { defineConfig } from 'vitepress';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const CLI_VERSION: string = (require('../../../apps/cli/package.json') as { version: string }).version;

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

export default defineConfig({
  title: 'IKARY Manifest',
  description:
    'Open-source declarative cell contracts — AI should generate manifests, not code.',
  base: '/',

  // localhost URLs in the CLI docs are intentional — suppress dead-link CI failures
  ignoreDeadLinks: [/^http:\/\/localhost/],

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/brand/original-symbol.svg' }],
    ['meta', { name: 'theme-color', content: '#0a1329' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'IKARY Manifest' }],
    [
      'meta',
      {
        property: 'og:description',
        content:
          'Open-source declarative cell contracts — AI should generate manifests, not code.',
      },
    ],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:site', content: '@ikary_platform' }],
  ],

  markdown: {
    config: (md) => {
      // Wrap ```mermaid code blocks in a <div class="mermaid"> for client-side rendering
      const defaultFence =
        md.renderer.rules.fence ||
        function (tokens, idx, options, _env, self) {
          return self.renderToken(tokens, idx, options);
        };

      md.renderer.rules.fence = (tokens, idx, options, env, self) => {
        const token = tokens[idx];
        if (token.info.trim() === 'mermaid') {
          return `<pre class="mermaid">${token.content}</pre>`;
        }
        return defaultFence(tokens, idx, options, env, self);
      };
    },
  },

  vite: {
    plugins: [
      {
        name: 'serve-repo-root',
        enforce: 'pre',
        configureServer(server) {
          const repoRoot = path.resolve(__dirname, '../../..');
          server.middlewares.use('/repo', (req, res, next) => {
            const rel = decodeURIComponent((req.url ?? '/').replace(/^\//, ''));
            const filePath = path.join(repoRoot, rel);
            if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
              const ext = path.extname(filePath);
              res.setHeader(
                'Content-Type',
                MIME[ext] ?? 'text/plain; charset=utf-8',
              );
              res.end(fs.readFileSync(filePath));
            } else {
              next();
            }
          });
        },
      },
      {
        name: 'serve-playground',
        enforce: 'pre',
        configureServer(server) {
          const playgroundDir = path.join(__dirname, '../public/playground');
          server.middlewares.use('/playground', (req, res, next) => {
            const url = req.url ?? '/';
            const rel = url === '' ? 'index.html' : url.replace(/^\//, '');
            const filePath = path.join(playgroundDir, rel || 'index.html');

            if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
              const ext = path.extname(filePath);
              res.setHeader('Content-Type', MIME[ext] ?? 'application/octet-stream');
              res.end(fs.readFileSync(filePath));
            } else {
              // SPA fallback — let the React app handle the route
              const indexPath = path.join(playgroundDir, 'index.html');
              if (fs.existsSync(indexPath)) {
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                res.end(fs.readFileSync(indexPath));
              } else {
                next();
              }
            }
          });
        },
      },
    ],
  },

  themeConfig: {
    logo: {
      light: '/brand/original-full.svg',
      dark: '/brand/white-full.svg',
    },
    siteTitle: false,

    nav: [
      { text: 'Tutorials', link: '/tutorials/start-here-10-minutes' },
      { text: 'How-to', link: '/how-to/troubleshoot-local-stack' },
      { text: 'CLI', link: '/cli/' },
      { text: 'API', link: '/api/' },
      { text: 'Reference', link: '/reference/entity-definition' },
      { text: 'Explanation', link: '/guide/why-ikary-manifest' },
      { text: 'SDKs', link: '/sdks/' },
      { text: 'Deployment', link: '/deployment' },
      { text: 'Releases', link: '/release-notes' },
      { text: 'Packages', link: '/packages/overview' },
      { text: 'Playground', link: '/playground' },
      {
        text: `v${CLI_VERSION}`,
        link: 'https://www.npmjs.com/package/@ikary/cli',
        target: '_blank',
      },
      {
        text: 'ikary.co',
        link: 'https://ikary.co',
        target: '_blank',
      },
    ],

    sidebar: {
      '/tutorials/': [
        {
          text: 'Tutorials',
          items: [
            { text: 'Start Here In 10 Minutes', link: '/tutorials/start-here-10-minutes' },
            { text: 'Build A Mini CRM', link: '/tutorials/mini-crm' },
          ],
        },
      ],

      '/how-to/': [
        {
          text: 'How-to Guides',
          items: [
            { text: 'Troubleshoot Local Stack', link: '/how-to/troubleshoot-local-stack' },
            { text: 'Deploy MCP Server', link: '/deployment' },
          ],
        },
      ],

      '/cli/': [
        {
          text: 'CLI Reference',
          items: [
            { text: 'Overview', link: '/cli/' },
            { text: 'Manifest', link: '/cli/manifest' },
            { text: 'Local stack', link: '/cli/local' },
            { text: 'Primitives', link: '/cli/primitives' },
            { text: 'Setup', link: '/cli/setup' },
          ],
        },
      ],

      '/guide/': [
        {
          text: 'Explanation',
          items: [
            {
              text: 'Why IKARY Manifest',
              link: '/guide/why-ikary-manifest',
            },
            { text: 'Getting Started', link: '/guide/cli' },
          ],
        },
        {
          text: 'System Concepts',
          items: [
            { text: 'Schema', link: '/guide/schema' },
            { text: 'Contract', link: '/guide/contract' },
            { text: 'Manifest Format', link: '/guide/manifest-format' },
            { text: 'Architecture', link: '/guide/architecture' },
            { text: 'Runtime API', link: '/guide/runtime-api' },
            { text: 'Runtime UI', link: '/guide/runtime-ui' },
            { text: 'Custom Primitives', link: '/guide/primitives' },
          ],
        },
      ],

      '/reference/': [
        {
          text: 'Specifications',
          items: [
            {
              text: 'Entity Definition',
              link: '/reference/entity-definition',
            },
            { text: 'API Conventions', link: '/reference/api-conventions' },
            { text: 'YAML Schemas', link: '/reference/schemas' },
          ],
        },
        {
          text: 'Entity Concepts',
          items: [
            { text: 'Validation Rules', link: '/reference/entity-validation' },
            { text: 'Computed Fields', link: '/reference/entity-computed' },
            { text: 'Lifecycle & State Machine', link: '/reference/entity-lifecycle' },
            { text: 'Relationships', link: '/reference/entity-relations' },
            { text: 'Policies & Permissions', link: '/reference/entity-policies' },
          ],
        },
        {
          text: 'Adoption',
          items: [
            { text: 'Capability Matrix', link: '/reference/capability-matrix' },
            { text: 'Compatibility Matrix', link: '/reference/compatibility-matrix' },
            { text: 'Release Notes', link: '/release-notes' },
          ],
        },
      ],

      '/api/': [
        {
          text: 'Contract Intelligence API',
          items: [
            { text: 'Overview', link: '/api/' },
            { text: 'Schema Discovery', link: '/api/schemas' },
            { text: 'UI Primitives', link: '/api/primitives' },
            { text: 'Example Manifests', link: '/api/examples' },
            { text: 'Guidance', link: '/api/guidance' },
            { text: 'Validation', link: '/api/validation' },
            { text: 'MCP Endpoint', link: '/api/mcp' },
            { text: 'Error Handling', link: '/api/errors' },
          ],
        },
      ],

      '/packages/': [
        {
          text: 'Packages',
          items: [
            { text: 'Overview', link: '/packages/overview' },
            { text: 'Loading & Validation', link: '/packages/loading' },
            { text: 'Compilation', link: '/packages/engine' },
            { text: 'API Generation', link: '/packages/api-generation' },
            { text: 'UI Rendering', link: '/packages/ui-rendering' },
          ],
        },
      ],

      '/sdks/': [
        {
          text: 'SDKs',
          items: [
            { text: 'Overview', link: '/sdks/' },
            { text: 'Node SDK', link: '/sdks/node' },
          ],
        },
      ],

      '/advanced/': [
        {
          text: 'Advanced',
          items: [
            { text: 'Overview', link: '/advanced/' },
            { text: 'Internal Contracts', link: '/advanced/internal-contracts' },
            { text: 'Entity Governance Spec', link: '/reference/entity-governance' },
            { text: 'Entity Contract Spec', link: '/reference/entity-contract' },
          ],
        },
      ],

      '/deployment': [
        {
          text: 'Operations',
          items: [{ text: 'Deploy MCP Server', link: '/deployment' }],
        },
      ],

      '/release-notes': [
        {
          text: 'Releases',
          items: [{ text: 'Release Notes', link: '/release-notes' }],
        },
      ],
    },

    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/ikary-platform/ikary-manifest',
      },
    ],

    editLink: {
      pattern:
        'https://github.com/ikary-platform/ikary-manifest/edit/main/apps/docs/:path',
      text: 'Edit this page on GitHub',
    },

    search: {
      provider: 'local',
    },
  },
});
