/**
 * Centralized outbound URLs. Every external link the SPA renders MUST
 * resolve through this module so the product can rebrand, move a domain,
 * or point to a staging variant without grepping the component tree.
 *
 * Each URL is:
 *  - overridable at build time via a Vite env var (`VITE_IKARY_*`)
 *  - falling back to the production default if the env var is unset
 *
 * See `.env.example` for the full list of variables.
 *
 * When adding a new external link:
 *  1. Add a DEFAULT entry and a matching env var read below.
 *  2. Import `EXTERNAL_LINKS` and reference by key in the component.
 *  3. Do NOT inline `https://...` literals in JSX or copy.
 */

const DEFAULTS = {
  /** Real product, commercial surface. */
  product: 'https://ikary.co',
  /** Open-source source-of-truth for the manifest engine. */
  docs: 'https://documentation.ikary.co',
  /** Public GitHub repository (monorepo for libs + apps). */
  github: 'https://github.com/ikary-platform/ikary-manifest',
  /** Public MCP endpoint for third-party AI agents. */
  mcp: 'https://mcp.ikary.co/v1',
} as const;

const ENV = import.meta.env;

function pick(raw: string | undefined, fallback: string): string {
  if (typeof raw !== 'string') return fallback;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

const ROOT = {
  product: pick(ENV.VITE_IKARY_PRODUCT_URL, DEFAULTS.product),
  docs: pick(ENV.VITE_IKARY_DOCS_URL, DEFAULTS.docs),
  github: pick(ENV.VITE_IKARY_GITHUB_URL, DEFAULTS.github),
  mcp: pick(ENV.VITE_IKARY_MCP_URL, DEFAULTS.mcp),
} as const;

export const EXTERNAL_LINKS = {
  ...ROOT,

  /** Schema explorer deep-linked to the CellManifestV1 root schema. */
  cellManifestSchema: `${ROOT.docs}/playground/contracts?schema=CellManifestV1Schema`,
} as const;

export type ExternalLinkKey = keyof typeof EXTERNAL_LINKS;
