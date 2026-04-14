Show the available IKARY UI primitives.

Use the list_primitives MCP tool to get the full catalog.
Pass source: "custom" to see only project-specific primitives.

Organize them by category (data, form, layout, feedback, navigation, custom)
and explain which ones are relevant for the current manifest's page types.

For any primitive of interest, call get_primitive_contract to see its full
props schema, then get_primitive_examples for sample prop sets.

Read manifest.json first to understand what pages exist, then recommend
primitives that match.
