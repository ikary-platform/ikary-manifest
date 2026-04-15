---
"@ikary/cell-playground": patch
---

Link `try.ikary.co` from docs homepage, nav bar, and playground header; remove unused "Copy Mermaid" and "Download JSON" buttons from the schema dependencies workspace.

- **Docs homepage**: promotes "Try it live →" (`try.ikary.co`) as the primary brand CTA; demotes "Start In 10 Minutes" to secondary; drops "API And MCP" from the hero
- **Docs top nav**: adds a standalone "Try it →" nav item after Playground, present on every docs page
- **Cell-playground header**: adds "Try it live" link before "Back to documentation"
- **Schema dependencies**: removes `Copy Mermaid` and `Download JSON` buttons; deletes the now-dead `toMermaid`, `buildGraphExportPayload`, and `escapeMermaid` functions from `schema-graph-model.ts`
