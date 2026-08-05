# Quality Gates Reference - Phase 10

Mandatory validations required during the Pull Request integration pipeline.

## 1. Automated Checks
* **Coverage Verification**: Unit test assertions must not regress.
* **Bundle Budgets**: Prevents layout reflow and bundle footprint growth.
* **A11y Checks**: Validates WCAG 2.2 focus attributes automatically.
* **API Versioning**: Ensures SemVer compliance on shared endpoints.
