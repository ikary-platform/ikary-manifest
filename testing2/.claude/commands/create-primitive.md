Create a new custom UI primitive for this project.

Ask the user what the primitive should do (name, purpose, props it needs).

Use the scaffold_primitive MCP tool to generate the 6-file scaffold:
  primitives/<name>/
    <Name>.tsx                  # React component
    <Name>PresentationSchema.ts # Zod schema
    <name>.contract.yaml        # human-readable props contract
    <Name>.resolver.ts          # props transform
    <Name>.register.ts          # registry entry
    <Name>.example.ts           # example scenarios

scaffold_primitive also appends an entry to ikary-primitives.yaml.

After scaffolding:
1. Open primitives/<name>/<Name>.tsx and implement the component.
   - Use props typed with z.infer<typeof <Name>PresentationSchema>.
   - Keep it a pure function; no side effects.
2. Update <Name>PresentationSchema.ts to reflect the real props.
3. Update <name>.contract.yaml so the Studio editor shows accurate types.
4. Update <Name>.example.ts with realistic scenario data.

Validate the scaffold:
  Run: ikary primitive validate

Preview the primitive live:
  Run: ikary local start manifest.json (if not already running)
  Open: http://localhost:4500/__primitive-studio
  The primitive will appear under the "Custom" group.

Use validate_primitive_props to check that example props match the contract.
