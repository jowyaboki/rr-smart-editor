# Plugin Developer Guide

Welcome to the RR Smart Editor Extension Development Kit. This guide will walk you through building, packaging, signing, and deploying third-party plugins.

## 1. Extension Lifecycle

Plugins go through the following lifecycle states:
- **Created**: Plugin scaffolding initialized with a valid `package.json` and `manifest`.
- **Validated**: Static code scanning ensures security policies are met.
- **Signed**: RSA/SHA-256 digital signature is attached.
- **Published**: Package uploaded to the Marketplace Registry.
- **Installed**: Downloaded and activated by the editor client.
- **Active**: Listening to workspace events.
- **Uninstalled**: Cleaned up from disk and memory.

## 2. Manifest Schema

Every plugin must define an `extension-manifest.json` or embed the manifest in `package.json`:

```json
{
  "id": "sample-anim-pack",
  "name": "sample-anim-pack",
  "displayName": "Sample Animations Pack",
  "version": "1.0.0",
  "description": "Premium transition presets for marketing reels.",
  "author": "Creative Labs",
  "category": "plugin",
  "editorVersion": ">=1.0.0",
  "engineVersion": ">=1.0.0",
  "permissions": ["filesystem"],
  "activationEvents": ["onStartup"],
  "entry": "dist/bundle.js"
}
```

## 3. Developing and Bundling

Use modern bundlers like `esbuild` or `tsup` to bundle your plugin into a single self-contained JS entrypoint:

```bash
npx esbuild src/index.ts --bundle --minify --platform=node --outfile=dist/bundle.js
```
