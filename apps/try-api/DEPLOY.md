# try.ikary.co deployment

Both surfaces deploy automatically on merge to `main` via
`.github/workflows/deploy-try.yml`. The workflow has two parallel jobs:

- `deploy-demo` builds `apps/try-demo` and publishes to Cloudflare Pages.
- `deploy-api` builds `apps/try-api` into a container and rolls Cloud Run.

The workflow is also registered for `workflow_dispatch` so a deploy can be
kicked off manually from the Actions tab without a code change.

Path filter: the workflow fires when anything under `apps/try-demo`,
`apps/try-api`, the libs those two depend on, or `manifests/` changes. A
docs-only or unrelated PR will not trigger a deploy.

## One-time setup

### Repository variables
*Settings -> Secrets and variables -> Actions -> Variables*

Reused from the existing `deploy-api.yml`:

- `GCP_PROJECT_ID`
- `GCP_REGION` (optional, default `us-central1`)
- `GCP_WORKLOAD_IDENTITY_PROVIDER`
- `GCP_SERVICE_ACCOUNT`

New for this workflow:

- `CLOUDFLARE_PAGES_PROJECT` (optional, default `try-ikary-co`)
- `VITE_IKARY_PRODUCT_URL` / `VITE_IKARY_DOCS_URL` /
  `VITE_IKARY_GITHUB_URL` / `VITE_IKARY_MCP_URL` (optional - the SPA
  falls back to production defaults baked into `src/config/links.ts`)
- `AI_MODEL_MANIFEST_GENERATE` (optional - default is the free-first
  chain baked into the Zod config)
- `AI_BUDGET_PER_TURN_OUTPUT_TOKENS` (optional, default `2000`)
- `FEATURE_AI_ENABLED` (optional, default `true`; flip to `false` to
  force the blueprint fallback without a redeploy)

### Repository secrets
*Settings -> Secrets and variables -> Actions -> Secrets*

- `CLOUDFLARE_API_TOKEN` - Pages:Edit scope, no account-wide access.
- `CLOUDFLARE_ACCOUNT_ID` - numeric account id visible in the Cloudflare
  dashboard sidebar.

### Google Cloud

1. Create an Artifact Registry repository named `ikary` in the chosen
   region (reused between `mcp-server` and `try-api`).
2. Create a Secret Manager secret named `openrouter-key` holding the
   OpenRouter API key.
3. Grant the existing workload-identity service account the role
   `roles/secretmanager.secretAccessor` on that secret:

   ```bash
   gcloud secrets add-iam-policy-binding openrouter-key \
     --member="serviceAccount:<GCP_SERVICE_ACCOUNT value>" \
     --role="roles/secretmanager.secretAccessor"
   ```
4. The Cloud Run service named `try-api` will be created automatically
   on the first deploy. Map `api.try.ikary.co` to it via
   `gcloud run domain-mappings create`.

### Cloudflare Pages

1. Create a Pages project named `try-ikary-co` (or whatever
   `CLOUDFLARE_PAGES_PROJECT` is set to). **Do not** connect it to a git
   repo - the workflow uploads the prebuilt `dist/` directly.
2. Add the custom domain `try.ikary.co`; Cloudflare issues the cert.
3. The checked-in `apps/try-demo/public/_redirects` file proxies
   `/api/*` to `https://api.try.ikary.co/:splat`. If your API lives at a
   different host, edit that file (or generate it in the workflow from a
   repo variable).

## Deploy flow

1. PR merges to `main`.
2. GitHub Actions triggers `deploy-try`:
   - `deploy-demo`: `pnpm install --frozen-lockfile` -> `pnpm --filter
     @ikary/try-demo build` -> `wrangler pages deploy apps/try-demo/dist`.
   - `deploy-api`: `docker build` -> `docker push` -> `gcloud run deploy`.
3. Both jobs run in parallel. Concurrency group keeps at most one
   `main` deploy in flight; subsequent triggers queue.
4. After the API deploy, the log prints the service URL so the first
   `main` push shows where to map `api.try.ikary.co`.

## Verification

Once both jobs are green:

```bash
# SPA
curl -sSf https://try.ikary.co/ -o /dev/null -w "%{http_code}\n"
# -> 200

# SPA -> API proxy via _redirects
curl -sS https://try.ikary.co/api/demo/status
# -> {"aiAvailable":true}

# API direct
curl -sS https://api.try.ikary.co/health
# -> {"status":"ok","service":"try-api"}

# End-to-end stream
curl -sS -N -X POST https://try.ikary.co/api/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"userPrompt":"simple reading list"}'
# -> SSE: meta -> model-selected -> chunks -> final-manifest -> done

# Fallback override, no redeploy needed
curl -sS "https://try.ikary.co/?demo=off" -o /dev/null -w "%{http_code}\n"

# Server-side kill switch: bump FEATURE_AI_ENABLED=false in repo vars
# then workflow_dispatch the deploy job; /demo/status flips immediately.
```

## Rolling back

Cloud Run keeps the previous revisions. To roll back the API:

```bash
gcloud run services update-traffic try-api \
  --to-revisions=<previous-revision>=100 \
  --region=$GCP_REGION
```

To roll back the SPA: in the Cloudflare Pages dashboard, click the
previous deployment and choose "Rollback to this deployment."
