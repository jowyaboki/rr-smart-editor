# Versioning Policy

The RR Smart Editor Studio Platform strictly adheres to Semantic Versioning 2.0.0.

## 1. Version Format

Versions are represented as: `MAJOR.MINOR.PATCH`

- **MAJOR**: Increment when backward-incompatible API or schema changes are introduced.
- **MINOR**: Increment when backward-compatible features or platform modules are added.
- **PATCH**: Increment when backward-compatible bug fixes or security patches are deployed.

## 2. API Deprecation Strategy

Before removing any public API method or capability:
1. Mark the method as `@deprecated` with a clear migration recommendation.
2. Maintain the deprecated method for at least one full MINOR version lifecycle.
3. Remove the deprecated API only in the subsequent MAJOR version release.
