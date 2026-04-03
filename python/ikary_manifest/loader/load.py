"""Manifest loading implementation.

Loads YAML or JSON manifests into plain Python dicts.
Structural validation against JSON Schema is available when
manifests/schemas/CellManifestV1.schema.json has been generated.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import yaml


def load_manifest_from_yaml(content: str) -> dict[str, Any]:
    """Parse a YAML string into a manifest dict."""
    return yaml.safe_load(content)


def load_manifest_from_file(path: str | Path) -> dict[str, Any]:
    """Load a manifest from a YAML or JSON file."""
    p = Path(path)
    text = p.read_text(encoding="utf-8")
    if p.suffix in (".yaml", ".yml"):
        return load_manifest_from_yaml(text)
    if p.suffix == ".json":
        return json.loads(text)
    raise ValueError(f"Unsupported file extension: {p.suffix}")
