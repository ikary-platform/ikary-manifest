# Ikary Manifest: Python SDK

Python SDK for loading and validating Ikary cell manifests.

## Installation

```bash
pip install -e ".[dev]"
```

## Usage

```python
from ikary_manifest.loader import load_manifest_from_file

manifest = load_manifest_from_file("../../manifests/examples/crm-manifest.yaml")
print(manifest["metadata"]["key"])  # "crm"
```

## How It Works

Python consumes the same YAML manifests as the TypeScript runtime. Shared artifacts:

- **YAML manifests** in `manifests/examples/`: parsed with PyYAML
- **JSON Schema** in `manifests/` (domain folders): structural validation with `jsonschema`
- **Semantic validation**: to be implemented natively in Python

Python never depends on TypeScript files.

## Project Structure

```
python/
  ikary_manifest/
    loader/              # YAML/JSON loading
    runtime/             # Future runtime
    generator_fastapi/   # Future FastAPI code generator
  tests/
```

## Running Tests

```bash
pytest
```
