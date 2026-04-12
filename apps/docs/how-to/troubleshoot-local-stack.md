# Troubleshoot Local Stack

Use this guide when setup or local runtime commands fail.

## Unscoped `ikary` install fails with 404

Use the published scoped package:

```bash
npx @ikary/ikary init my-app
```

`ikary` is the command name after install. It is not an unscoped npm package.

## `ikary local start` says container runtime is not running

Check Docker Desktop or Podman first.

```bash
docker ps
```

If that fails, start Docker Desktop or Podman, then run:

```bash
ikary local start manifest.json
```

## Port already in use (`4500`, `4501`, `4502`, or `5432`)

Find the process using the port and stop it.

```bash
lsof -i :4500
lsof -i :4501
lsof -i :4502
lsof -i :5432
```

Then run:

```bash
ikary local start manifest.json
```

## MCP returns HTTP 406 on raw curl calls

MCP Streamable HTTP requires the `Accept` header.

```bash
curl -X POST http://localhost:4502/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

## Validation errors after editing `manifest.json`

Run validation with explanations:

```bash
ikary validate manifest.json --explain
```

Then fix each reported path in order.

## Preview does not update

- Confirm you are editing the same `manifest.json` used by `ikary local start`
- Check stack status: `ikary local status`
- Check logs: `ikary local logs preview -f`
- Restart stack if needed: `ikary local stop` then `ikary local start manifest.json`

## Need a clean local database

```bash
ikary local reset-data
```

This removes local PostgreSQL data for the stack.
