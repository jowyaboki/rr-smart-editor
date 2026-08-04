# Support Operations Guide

Standard operating procedures for customer success and technical support personnel of the RR Smart Editor Studio Platform (v5.0).

## 1. Generating Diagnostic Bundles

When an enterprise client encounters an issue, support agents request a **Diagnostic Bundle**:
- Single-click export from the user dashboard.
- Generates a zip archive containing:
  - **Environment Summary**: OS, node.js version, and active plugins.
  - **System Health Snapshots**: Heap memory overhead, database connection count, render queue metrics.
  - **Reproduction Log**: Transactional undo/redo log list prior to the error.

## 2. Multi-tier Support SLA Handling

- **SLA Tier 1 (Outage)**: Critical render nodes offline. Escalate to DevOps immediately.
- **SLA Tier 2 (Functional bug)**: Diagnostic bundle reviewed to isolate failing third-party plugin boundaries.
