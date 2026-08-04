# Known Production Limitations

The following architectural limits and edge cases are documented for operational teams:

## 1. Local Database Standalone Fallback Size
- **Description**: The standalone fallback mode utilizes an in-memory SQL router for local operations.
- **Limitation**: Large offline project trees are cached in RAM; extremely large timelines with >100,000 clips can experience high heap footprint in offline mode.
- **Mitigation**: Periodic autosaving dumps project states to local `renders_db.json` and purges the active in-memory cache.

## 2. Dynamic Hot Reloading Limits
- **Description**: Plugins can be installed or uninstalled on the fly without application restart.
- **Limitation**: Extensions that subscribe to native external OS resources (like direct serial camera telemetry hooks) must release active OS handles in their `deactivate` method; otherwise, resources remain locked until restart.
- **Mitigation**: The SDK enforces strict resource release policies for certified plugins.

## 3. Storage Allocation Boundaries
- **Description**: Temporary preview rendering cache has a hard storage threshold.
- **Limitation**: When storage space is completely exhausted, local previews degrade in quality.
- **Mitigation**: Real-time alerts recommend triggering a manual cache purge or increasing virtual volume size.
