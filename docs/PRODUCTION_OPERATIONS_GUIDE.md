# Production Operations Guide

This guide details the standard operating procedures for managing studio productions and assets across their lifecycle.

## 1. Workspace Hierarchy

Workspaces contain folders, projects, and multiple productions. Roles are assigned at the workspace level:
- **Admin**: Full metadata control, license management, and retention policy settings.
- **Write**: Editing access, asset uploads, and task completion.
- **Read**: View active dashboards, preview drafts, and review logs.

## 2. Production Lifecycle Stages

Each production transitions sequentially through the following states:
1. **Pre-production**: Scaffolding tasks, deadlines, and assigning the creative team.
2. **Production**: Batch ingesting raw camera footage and initial transcript generation.
3. **Post-production**: Assembly edit, colorist grading, client frame comments, and review approvals.
4. **Publishing**: Automated transcoding, quality checks, and direct publish to targets.
5. **Archive**: Codec compression, tier-transition to cold storage, and retention lock enforcement.

## 3. High-Concurrency Asset Ingest

Ingested files undergo instant duplicate scans using SHA-256 content hashes. Duplicate uploads are rejected to save bandwidth and storage space.
