/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_IKARY_PRODUCT_URL?: string;
  readonly VITE_IKARY_DOCS_URL?: string;
  readonly VITE_IKARY_GITHUB_URL?: string;
  readonly VITE_IKARY_MCP_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
