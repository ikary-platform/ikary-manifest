# Primitive commands

`ikary primitive` manages custom UI components. See the [Custom Primitives guide](/guide/primitives) for the full workflow including implementation and the Primitive Studio.

## `ikary primitive add <name>`

Scaffolds a new custom primitive in the current project.

```bash
ikary primitive add my-widget
```

The command prompts for a display label, description, and category, then generates six files and updates `ikary-primitives.yaml`:

```
Add primitive

  ✔ Created my-widget primitive

  primitives/my-widget/MyWidget.tsx                React component
  primitives/my-widget/MyWidgetPresentationSchema.ts   Zod props schema
  primitives/my-widget/my-widget.contract.yaml     Human-readable contract
  primitives/my-widget/MyWidget.resolver.ts        Props resolver
  primitives/my-widget/MyWidget.register.ts        Registration
  primitives/my-widget/MyWidget.example.ts         Example scenarios
  ikary-primitives.yaml                            Updated
```

| Option | Description |
|--------|-------------|
| `--label <label>` | Display label (skips prompt) |
| `--description <desc>` | Short description (skips prompt) |
| `--category <cat>` | One of: `data`, `form`, `layout`, `feedback`, `navigation`, `custom` |

---

## `ikary primitive validate`

Validates every entry in `ikary-primitives.yaml`. Checks that each contract YAML parses correctly, referenced source files exist, and example props match the declared contract schema.

```bash
ikary primitive validate
```

Run this after editing a contract or adding a new example to catch errors before opening the Studio.

---

## `ikary primitive list`

Lists all registered primitives, both core and custom.

```bash
ikary primitive list
```

Pass `--json` for machine-readable output:

```bash
ikary primitive list --json
```

| Option | Description |
|--------|-------------|
| `--json` | Output as JSON array |

---

## `ikary primitive studio`

Opens the Primitive Studio in the browser. Requires the [local stack](/cli/local) to be running.

```bash
ikary primitive studio
```

The Studio opens at `http://localhost:3000/__primitive-studio`. It shows all custom primitives registered in `ikary-primitives.yaml` with a live props editor and component preview.

| Option | Description |
|--------|-------------|
| `-p, --port <port>` | Port the preview server is running on (default: 3000) |
