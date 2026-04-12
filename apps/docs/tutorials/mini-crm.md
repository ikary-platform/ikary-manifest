# Tutorial: Build A Mini CRM

This tutorial builds a working CRM demo from the published example manifest.

## What you will build

A CRM app with customer and invoice entities, pages, roles, and navigation.

## 1. Create a project

```bash
npx @ikary/ikary init mini-crm
cd mini-crm
```

## 2. Load the CRM example manifest

```bash
curl -sS https://public.ikary.co/api/examples/crm-manifest > manifest.json
```

## 3. Validate the manifest

```bash
ikary validate manifest.json
```

Expected result:

- Validation succeeds
- Customer and invoice entities are detected

## 4. Run the local stack

```bash
ikary local start manifest.json
```

Open `http://localhost:4500`.

You should see:

- CRM navigation
- Entity list and detail pages
- Generated forms for create and update flows

## 5. Make one domain change

Add a field to the customer entity in `manifest.json`.

```json
{
  "key": "industry",
  "type": "string",
  "name": "Industry"
}
```

Then re-run validation.

```bash
ikary validate manifest.json
```

Expected result:

- Validation still succeeds
- New field appears in generated forms and views

## Where to go next

- [Entity Definition reference](/reference/entity-definition)
- [Lifecycle and state machine](/reference/entity-lifecycle)
- [Policies and permissions](/reference/entity-policies)
- [Troubleshoot local setup](/how-to/troubleshoot-local-stack)
