# Architecture Overview

This project is a monorepo structured for a professional AI-powered video editor.

## Structure
- `apps/web`: Vite/React frontend application.
- `apps/server`: Node.js/Express backend and rendering server.
- `packages/shared`: Shared TypeScript types and Zod schemas.
- `packages/ui`: Reusable Material UI components and theme.

## Core Technologies
- **Frontend**: React, TypeScript, MUI, Zustand (State), React Query (Data Fetching), React Router.
- **Video**: Remotion, GSAP.
- **Backend**: Express, PostgreSQL (pg), Multer (Uploads), Fluent-ffmpeg (Metadata).
- **AI**: Modular provider architecture (OpenAI, Mock).

## Rendering
The server uses `@remotion/renderer` to bundle the frontend Remotion components and render them to MP4 on the server side.
