# Modernization Guide - Phase 10

This guide outlines rules for maintaining a modernized TypeScript and React presentation layer.

## 1. TypeScript Standards
* Consistently enforce strict typing. Avoid implicit any or loose type assertions.
* Maximize the use of `readonly` and `const` declarations.

## 2. React Standards
* Subscribe to discrete Zustand state selectors instead of full-store hook bindings.
* Lazily load heavier diagnostic modules behind standard Suspense wrappers.
