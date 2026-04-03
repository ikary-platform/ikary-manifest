# Python SDK

Python SDK for loading and validating IKARY cell manifests.

## Install

```bash
cd python
pip install -e ".[dev]"
```

## Usage

```python
from ikary_manifest.loader import load_manifest_from_file

manifest = load_manifest_from_file("manifests/examples/crm-manifest.yaml")
print(manifest["metadata"]["key"])  # "crm"
```

## How it works

Python consumes the same YAML manifests as the TypeScript runtime. Shared artifacts:

| Artifact | Location | Python tool |
|----------|----------|-------------|
| YAML manifests | `manifests/examples/` | PyYAML |
| YAML schemas | `manifests/schemas/` | jsonschema |
| Entity files | `manifests/entities/` | PyYAML |

Python never depends on TypeScript files.

## API

### `load_manifest_from_file(path)`

Load a manifest from a `.yaml`, `.yml`, or `.json` file. Returns a plain `dict`.

```python
from ikary_manifest.loader import load_manifest_from_file

manifest = load_manifest_from_file("my-app.yaml")
```

### `load_manifest_from_yaml(content)`

Parse a YAML string into a manifest dict.

```python
from ikary_manifest.loader import load_manifest_from_yaml

manifest = load_manifest_from_yaml("""
apiVersion: ikary.co/v1alpha1
kind: Cell
metadata:
  key: test
  name: Test
  version: "1.0.0"
spec:
  mount:
    mountPath: /
    landingPage: dash
  pages:
    - key: dash
      type: dashboard
      title: Dash
      path: /dash
""")
```

## Project structure

```
python/
  ikary_manifest/
    loader/              # YAML/JSON loading
    runtime/             # Future runtime
    generator_fastapi/   # Future FastAPI code generator
  tests/
```

## Running tests

```bash
cd python
pytest
```

## Status

The Python SDK currently provides YAML/JSON loading. Planned features:

- JSON Schema structural validation using `manifests/schemas/`
- Native semantic validation rules
- FastAPI code generation from manifests
