---
"@ikary/mcp-server": minor
"@ikary/cell-playground": minor
"@ikary/cell-primitive-studio": minor
---

Expose JSON Schema (Draft-07) via public MCP REST API and wire Monaco Editor
IntelliSense into all playground JSON panels.

**`@ikary/mcp-server`**: new `GET /api/json-schema/manifest`, `GET /api/json-schema/entity`, and `GET /api/json-schema/primitive/:key` endpoints. Schemas are generated from the existing Zod schemas via `zod-to-json-schema` and memoised per process. Any VS Code / Cursor user can point `json.schemas` at the public URL for zero-config IntelliSense in manifest and entity files.

**`@ikary/cell-playground`**: replaced plain textareas with Monaco Editor (`@monaco-editor/react`) in the App Runtime, API Runtime, and UI Runtime JSON panels. Each editor fetches its schema from the MCP API on mount and registers it with Monaco's JSON language service. Dark-mode is synced automatically. IntelliSense degrades gracefully to a plain JSON editor when the API is unreachable.

**`@ikary/cell-primitive-studio`**: added `renderContractEditor` render-prop to `PrimitiveStudio` and `PropsEditor`, allowing host apps to inject a custom editor (e.g. Monaco) for the Contract Props panel without adding Monaco as a library dependency.
