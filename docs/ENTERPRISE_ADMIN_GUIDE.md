# Enterprise Admin Guide

This guide is for enterprise administrators managing compliance, licenses, and security logs in RR Smart Editor Studio Platform (v3.0).

## 1. Compliance and Retention Policies

Administrators can set global retention parameters on specific workspace collections:
- **Retention Period**: Defines how long asset proxies and master exports remain in active storage.
- **Legal Hold**: Explicitly overrides deletion commands to preserve active footage and transaction history during audits.

## 2. Programmatic Audit Log Exports

Every action, user login, and status change is journaled in real-time. Logs are exportable programmatically via the Studio APIs in JSON format for external SIEM indexing.

## 3. License Allocation

Monitor seat allocations and compute cost aggregates (GPU rendering, cloud storage, and AI cognitive translations) via the central admin console.
