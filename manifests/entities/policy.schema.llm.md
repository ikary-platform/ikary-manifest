# policy.schema.llm.md

## 1. Purpose

This document describes the language-neutral JSON Schema definition for the **PolicyDefinitions** schema, located at `manifests/entities/policy.schema.yaml`. It defines access control policies for entities and fields through three internal definitions: ActionPolicy, EntityPoliciesDefinition, and FieldPoliciesDefinition. This LLD exists for code generation tasks.

## 2. Owned Responsibilities

- Validates that `ActionPolicy` contains a required `scope` string from the enum `public`, `tenant`, `workspace`, `owner`, `role`, `custom`.
- Accepts an optional `condition` string on `ActionPolicy` with minLength 1.
- Validates that `EntityPoliciesDefinition` maps CRUD actions (`view`, `create`, `update`, `delete`) to `ActionPolicy` objects.
- Validates that `FieldPoliciesDefinition` maps field keys to objects containing `view` and `update` ActionPolicy entries.
- Rejects unknown properties on `ActionPolicy` and `EntityPoliciesDefinition` via `additionalProperties: false`.
- Allows dynamic field keys on `FieldPoliciesDefinition` through `additionalProperties` typed as ActionPolicy containers.

## 3. Out of Scope

- UI rendering of policy data.
- Backend enforcement or evaluation of access control rules.
- Transport layer concerns (HTTP, gRPC, file I/O).
- Business logic beyond structural schema validation.

## 4. Runtime Inputs

- `ActionPolicy.scope` -- string, required, enum: public | tenant | workspace | owner | role | custom
- `ActionPolicy.condition` -- string, optional, minLength 1
- `EntityPoliciesDefinition.view` -- ActionPolicy, optional
- `EntityPoliciesDefinition.create` -- ActionPolicy, optional
- `EntityPoliciesDefinition.update` -- ActionPolicy, optional
- `EntityPoliciesDefinition.delete` -- ActionPolicy, optional
- `FieldPoliciesDefinition.[fieldKey].view` -- ActionPolicy, optional
- `FieldPoliciesDefinition.[fieldKey].update` -- ActionPolicy, optional

## 5. Primitive Composition

Self-contained. All definitions (`ActionPolicy`, `EntityPoliciesDefinition`, `FieldPoliciesDefinition`) use internal `#/definitions/` references. No external `$ref` schemas are referenced.

## 6. Render-State Mapping

This is a schema-layer unit and does not own UI render-state.

## 7. Interaction Model

Interaction is declarative. Data fields and keys are emitted, not executed.

## 8. Routing Model

No routing side effects are owned. Route or path values, if any, are validated as data only.

## 9. Files to Generate or Update

- `manifests/entities/policy.schema.yaml` -- YAML schema source
- `manifests/entities/policy.schema.md` -- human-readable documentation
- `manifests/entities/policy.schema.llm.md` -- this LLM implementation guide
- `contracts/node/contract/src/contract/entity/policy/PolicyScopeSchema.ts` -- TypeScript mirror
- `contracts/node/contract/src/contract/entity/policy/ActionPolicySchema.ts` -- TypeScript mirror
- `contracts/node/contract/src/contract/entity/policy/EntityPoliciesDefinitionSchema.ts` -- TypeScript mirror
- `contracts/node/contract/src/contract/entity/policy/FieldPoliciesDefinitionSchema.ts` -- TypeScript mirror

## 10. Repo Constraints

- Kebab-case file naming with `.schema` suffix.
- JSON Schema Draft 2020-12 format.
- Use `$ref` for composition; apply `additionalProperties: false` where applicable.
- Keep extensions additive and backward compatible.
