"""Smoke tests for manifest loader."""

import json
from pathlib import Path

import pytest

from ikary_manifest.loader import load_manifest_from_file, load_manifest_from_yaml


MANIFESTS_DIR = Path(__file__).parent.parent.parent.parent / "manifests" / "examples"


def test_load_minimal_yaml():
    manifest_path = MANIFESTS_DIR / "minimal-manifest.yaml"
    result = load_manifest_from_file(manifest_path)
    assert result["apiVersion"] == "ikary.co/v1alpha1"
    assert result["kind"] == "Cell"
    assert result["metadata"]["key"] == "minimal"
    assert result["metadata"]["version"] == "1.0.0"


def test_load_crm_yaml():
    manifest_path = MANIFESTS_DIR / "crm-manifest.yaml"
    result = load_manifest_from_file(manifest_path)
    assert result["apiVersion"] == "ikary.co/v1alpha1"
    assert result["metadata"]["key"] == "crm"
    # CRM manifest uses $ref for entities — raw parse gives $ref objects
    assert result["spec"]["entities"][0]["$ref"] == "./entities/customer.entity.yaml"


def test_load_entity_yaml():
    entities_dir = MANIFESTS_DIR / "entities"
    result = load_manifest_from_file(entities_dir / "customer.entity.yaml")
    assert result["key"] == "customer"
    assert result["name"] == "Customer"
    assert len(result["fields"]) == 3
    assert result["$schema"] == "../../entities/entity-definition.schema.yaml"


def test_load_from_yaml_string():
    yaml_content = """
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
"""
    result = load_manifest_from_yaml(yaml_content)
    assert result["kind"] == "Cell"
    assert result["metadata"]["key"] == "test"


def test_load_json_file(tmp_path):
    manifest = {"apiVersion": "ikary.co/v1alpha1", "kind": "Cell", "metadata": {"key": "test"}}
    json_file = tmp_path / "manifest.json"
    json_file.write_text(json.dumps(manifest))
    result = load_manifest_from_file(json_file)
    assert result["kind"] == "Cell"
    assert result["apiVersion"] == "ikary.co/v1alpha1"


def test_load_unsupported_extension(tmp_path):
    toml_file = tmp_path / "manifest.toml"
    toml_file.write_text("[manifest]\n")
    with pytest.raises(ValueError, match="Unsupported file extension"):
        load_manifest_from_file(toml_file)
