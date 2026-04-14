Help me build a manifest for my application.

Ask the user what kind of application they want to build.

Use the recommend_manifest_structure MCP tool with their description as the
goal. This returns suggested entities, relations, pages, and navigation.

Take the recommendations and generate a complete manifest.json file with:
- All suggested entities with their fields, relations, and lifecycle
- CRUD pages (entity-list, entity-detail, entity-create) for each entity
- A dashboard page
- Navigation items for all list pages
- Roles (admin, viewer at minimum)

After generating, run: ikary validate manifest.json --explain
If there are errors, use the explain_validation_errors MCP tool and fix them.
