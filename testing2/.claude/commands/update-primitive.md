Update an existing custom UI primitive.

Ask the user which primitive to update and what should change.

Read the current files:
  primitives/<name>/<Name>.tsx
  primitives/<name>/<Name>PresentationSchema.ts
  primitives/<name>/<name>.contract.yaml

Use get_primitive_contract to see the current schema, then decide:

──── NON-BREAKING change (no existing manifests break) ────────────────────
Examples: adding an optional prop, changing a label, fixing a bug.

1. Edit the component, schema, contract, and examples as needed.
2. Keep the version number in <name>.contract.yaml unchanged.
3. Run: ikary primitive validate
4. Check the live preview at http://localhost:4500/__primitive-studio

──── BREAKING change (existing manifests would break) ─────────────────────
Examples: removing a required prop, renaming a prop, changing a prop type.

1. Copy the current <Name>.register.ts to <Name>.v<N>.register.ts and
   adjust it to register the old version under the explicit old version key.
2. Bump the version in <name>.contract.yaml (e.g. "1.0.0" → "2.0.0").
3. Update <Name>PresentationSchema.ts and <Name>.tsx for the new API.
4. Add the old version key to breakingChanges in <name>.contract.yaml.
5. Register the new version in <Name>.register.ts with the bumped version.
6. Run: ikary primitive validate
7. Update manifests that referenced the old primitive to use the new props.

After any update, use validate_primitive_props with the new example props
to confirm the contract and component stay in sync.
