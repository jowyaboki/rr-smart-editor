# Marketplace Administration Guide

This guide is for administrators managing the RR Smart Editor Marketplace Ecosystem, covering safety moderation, reports, and featured curation.

## 1. Extension Audits and Malware Scans

Every package undergoes static analysis on submission to prevent malicious execution:
- **Sandboxed Validation**: Manifest permissions are audited to restrict arbitrary filesystem or network access unless declared and approved.
- **Malicious Pattern Scans**: Static scans block suspicious keywords such as `shelljs`, `sudo`, `eval`, or high-risk execution hooks.

## 2. Content Moderation Reports

Users and developers can report package anomalies or quality drops. The review process is managed under the `PackageManager`:
- Flagging reasons: `security_alert`, `incompatible_version`, `copyright_violation`.
- Status tracking: `pending_review`, `resolved`, `removed`.

## 3. Curating Featured Content

Ecosystem editors curate featured plugins and templates to boost quality and discoverability. Custom configuration properties:
- `featured_plugins`: Recommended extensions displayed on top tabs.
- `featured_templates`: Recommended motion design blueprints for quick starting.
