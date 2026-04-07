# @ikary/cli

CLI for generating, validating, compiling, and previewing IKARY Cell manifests.

## Install

```bash
npx ikary init
```

Or install globally:

```bash
npm install -g @ikary/cli
ikary --help
```

## Commands

```bash
ikary init [project-name]   # Create a new Cell manifest project
ikary validate <path>       # Validate a manifest JSON file
ikary compile <path>        # Compile a manifest to normalized JSON
ikary preview <path>        # Preview a manifest in the playground
```

### `ikary init`

Scaffolds a new Cell manifest project with a valid starting template.

```bash
ikary init my-app
```

### `ikary validate`

Validates a Cell manifest JSON file against the schema and runs semantic checks.

```bash
ikary validate ./manifest.json
```

### `ikary compile`

Compiles a Cell manifest to its normalized form. Useful for inspecting the final output the engine produces.

```bash
ikary compile ./manifest.json
ikary compile ./manifest.json -o compiled.json
ikary compile ./manifest.json --stdout
```

### `ikary preview`

Launches a local dev server to preview the manifest in the Cell Playground.

```bash
ikary preview ./manifest.json
ikary preview ./manifest.json --port 4000
```

## Documentation

Full documentation lives in the [ikary-manifest](https://github.com/ikary-platform/ikary-manifest) repository.

## License

MIT
