---
'ikary-manifest': patch
---

Centralize the Node.js version and move to Node 24 LTS (Active, Krypton).

`.nvmrc` is now the single source of truth. Every CI step reads it via
`actions/setup-node@v4`'s `node-version-file` input, Dockerfiles accept it as
an `ARG NODE_VERSION`, and root `package.json` engines.node minimum tracks the
same major. Per-app `engines.node` declarations are removed to prevent drift.

A new `scripts/check-node-version.mjs` drift guard runs in CI and fails if any
Dockerfile ARG default or root engines.node major disagrees with `.nvmrc`.
