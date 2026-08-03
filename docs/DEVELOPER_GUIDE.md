# Developer Guide

Welcome to the developer guide for building and integrating with RR Smart Editor Studio Platform (v3.0).

## 1. Setup and Installation

Clone the repository and install all workspace dependencies:
```bash
npm install
npm run build
```

## 2. Compiling and Bundling Extensions

Developers bundle their modules using standard compilers like `esbuild` or `typescript`. The final artifact must be signed before publishing:
```bash
# Package, sign and publish
npm run package-plugin
npm run sign-plugin -- --key=private.pem
```

## 3. Working with the Public SDK

Use `RRClient` to trigger programmatically any platform capabilities. Refer to `docs/SDK_REFERENCE.md` for the comprehensive API method signature list.
