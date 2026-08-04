# Design System Guide - Phase 10

This guide outlines the unified design system, tokens, spatial rhythm, and interaction principles used across the RR Smart Editor to drive consistent developer and creator experiences.

## 1. Interaction Principles
* **Minimal Visual Noise**: Focus on the creator's assets. Content takes precedence over heavy frames or chrome decorations.
* **Information Density**: Standardized spacing scales matching high-end creative suites (Figma, VS Code) supporting fine-grain timeline and trace inspection.
* **Progressive Disclosure**: Detailed parameters remain hidden behind clean disclosure panels until explicitly queried by the creator.
* **Consistent Spacing**: Absolutely zero handcrafted absolute paddings or margins. Spacing conforms strictly to the core 4px grid.

## 2. Spacing rhythm
* `xs` (Extra Small): 4px (`var(--spacing-xs)`)
* `sm` (Small): 8px (`var(--spacing-sm)`)
* `md` (Medium): 16px (`var(--spacing-md)`)
* `lg` (Large): 24px (`var(--spacing-lg)`)
* `xl` (Extra Large): 32px (`var(--spacing-xl)`)

## 3. Core Color Tokens
* **Background**: `#0a1929` (Deep, distraction-free gray-blue workspace)
* **Surface**: `#102031` (Standard cards and workspace sidebars)
* **Border**: `#1e293b` (Delimiting pane splits and dividers)
* **Primary**: `#90caf9` (Interactive states and active selection markers)
* **Success**: `#4caf50` (Completed rendering tasks and valid compliance scores)
