# Deploying the MCP Server to Google Cloud Run

The MCP server runs as a Docker container on Cloud Run. GitHub Actions builds the image, pushes it to GitHub Container Registry (ghcr.io), and deploys it to Cloud Run on every push to `main` that touches the server or contract packages.

This guide covers the full setup from scratch: GCP project, Workload Identity Federation (no service account keys), Cloud Run, and the GitHub Actions workflow.

## Prerequisites

- A Google account with billing enabled
- The `gcloud` CLI installed ([cloud.google.com/sdk/docs/install](https://cloud.google.com/sdk/docs/install))
- Admin access to the GitHub repository

## 1. Create a GCP project

```bash
gcloud projects create ikary-manifest --name="IKARY Manifest"
gcloud config set project ikary-manifest
```

Enable billing for the project at [console.cloud.google.com/billing](https://console.cloud.google.com/billing). Cloud Run's free tier covers 2 million requests per month.

## 2. Enable required APIs

```bash
gcloud services enable \
  run.googleapis.com \
  iamcredentials.googleapis.com \
  cloudresourcemanager.googleapis.com
```

## 3. Set up Workload Identity Federation

Workload Identity Federation lets GitHub Actions authenticate to GCP without storing service account keys. This is the recommended approach by both Google and GitHub.

### Create a service account

```bash
gcloud iam service-accounts create github-deploy \
  --display-name="GitHub Actions Deploy"
```

### Grant permissions

The service account needs two roles: deploy to Cloud Run, and act as the Cloud Run runtime identity.

```bash
PROJECT_ID=$(gcloud config get-value project)
SA_EMAIL="github-deploy@${PROJECT_ID}.iam.gserviceaccount.com"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/run.admin"

gcloud iam service-accounts add-iam-policy-binding $SA_EMAIL \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/iam.serviceAccountUser"
```

### Create a Workload Identity Pool

```bash
gcloud iam workload-identity-pools create github-pool \
  --location="global" \
  --display-name="GitHub Actions Pool"
```

### Create a provider for GitHub

Replace `ikary-platform` with your GitHub org name.

```bash
gcloud iam workload-identity-pools providers create-oidc github-provider \
  --location="global" \
  --workload-identity-pool="github-pool" \
  --display-name="GitHub Provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" \
  --issuer-uri="https://token.actions.githubusercontent.com"
```

### Allow the GitHub repo to impersonate the service account

Replace `ikary-platform/ikary-manifest` with your `org/repo`.

```bash
POOL_ID=$(gcloud iam workload-identity-pools describe github-pool \
  --location="global" --format="value(name)")

gcloud iam service-accounts add-iam-policy-binding $SA_EMAIL \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/${POOL_ID}/attribute.repository/ikary-platform/ikary-manifest"
```

### Get the provider resource name

You will need this value for the GitHub repository variable.

```bash
gcloud iam workload-identity-pools providers describe github-provider \
  --location="global" \
  --workload-identity-pool="github-pool" \
  --format="value(name)"
```

The output looks like:

```
projects/123456789/locations/global/workloadIdentityPools/github-pool/providers/github-provider
```

## 4. Configure GitHub repository variables

Go to your repository **Settings > Secrets and variables > Actions > Variables** and add:

| Variable | Value |
|---|---|
| `GCP_PROJECT_ID` | Your project ID (e.g., `ikary-manifest`) |
| `GCP_REGION` | `us-central1` |
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | The full provider name from step 3 |
| `GCP_SERVICE_ACCOUNT` | `github-deploy@ikary-manifest.iam.gserviceaccount.com` |

These are stored as variables, not secrets. They contain no credentials. Authentication happens through Workload Identity Federation at runtime.

## 5. Deploy

Push to `main` with changes in `apps/mcp-server/`, `contracts/node/`, `manifests/`, or `Dockerfile`. The workflow triggers automatically.

To deploy manually from the GitHub Actions tab, use the "Run workflow" button on the **Deploy MCP Server** workflow.

### What the workflow does

1. Builds the Docker image
2. Pushes it to `ghcr.io/ikary-platform/ikary-manifest/manifest-api` (public, free for open-source repos)
3. Deploys the image to Cloud Run

The first deploy creates the Cloud Run service. Subsequent deploys update it in place with zero downtime.

After deploy, the workflow prints three URLs:

- **Service URL** at `https://ikary-manifest-api-HASH-uc.a.run.app`
- **Swagger docs** at `{service-url}/api/docs`
- **MCP endpoint** at `{service-url}/mcp`

## 6. Verify

Test the deployed API:

```bash
# Schema discovery
curl https://YOUR-SERVICE-URL/api/schemas/manifest

# Validation
curl -X POST https://YOUR-SERVICE-URL/api/validate/manifest \
  -H 'Content-Type: application/json' \
  -d '{"manifest":{"apiVersion":"ikary.co/v1alpha1","kind":"Cell","metadata":{"key":"test","name":"Test","version":"1.0.0"},"spec":{"mount":{"mountPath":"/","landingPage":"dash"},"pages":[{"key":"dash","type":"dashboard","title":"Dashboard","path":"/dashboard"}]}}}'

# MCP tools list
curl -X POST https://YOUR-SERVICE-URL/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

## Local Docker testing

Build and run the container locally before deploying:

```bash
docker build -t ikary-manifest-api .
docker run -p 4502:4502 ikary-manifest-api
```

Then open `http://localhost:4502/api/docs` to verify.

## Cost

Cloud Run's free tier includes:

- 2 million requests per month
- 360,000 vCPU-seconds
- 180,000 GiB-seconds of memory

The MCP server uses 256 MiB of memory and scales to zero when idle. For a public documentation API, this stays within the free tier.

## Files

| File | Purpose |
|---|---|
| `Dockerfile` | Multi-stage build (deps, build, production) |
| `.dockerignore` | Excludes docs, UI packages, and build artifacts |
| `.github/workflows/deploy-api.yml` | Build, push to ghcr.io, deploy to Cloud Run |
