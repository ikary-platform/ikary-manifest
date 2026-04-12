# ikary

CLI for generating, validating, compiling, and previewing IKARY Cell manifests.

This package is a thin wrapper around [`@ikary/cli`](https://www.npmjs.com/package/@ikary/cli). It exists so you can run `npx @ikary/ikary` instead of `npx @ikary/cli`.

## Install

```bash
npx @ikary/ikary init
```

Or install globally:

```bash
npm install -g @ikary/ikary
ikary --help
```

## Usage

```bash
ikary init [project-name]   # Create a new Cell manifest project
ikary validate <path>       # Validate a manifest JSON file
ikary compile <path>        # Compile a manifest to normalized JSON
ikary preview <path>        # Preview a manifest in the playground
```

## Documentation

Full documentation: [documentation.ikary.co](https://documentation.ikary.co)
