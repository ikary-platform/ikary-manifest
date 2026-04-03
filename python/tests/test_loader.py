"""Smoke tests for manifest loader."""

from pathlib import Path

from ikary_manifest.loader import load_manifest_from_file, load_manifest_from_yaml


MANIFESTS_DIR = Path(__file__).parent.parent.parent / "manifests" / "examples"


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
    assert len(result["spec"]["entities"]) == 2
    assert result["spec"]["entities"][0]["key"] == "customer"


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
