# AI Provider Architecture

The AI module follows a modular provider-based architecture.

## Components

1. **AIService**: The central entry point for all AI requests. It delegates tasks to the active provider based on environment configuration (`AI_PROVIDER`).
2. **AIProviderRegistry**: A registry where all available providers (OpenAI, Mock, etc.) are registered.
3. **AIServiceProvider Interface**: Defines the contract that every provider must implement.
4. **Providers**: Concrete implementations like `OpenAIProvider` and `MockAIProvider`.

## Adding a New Provider

1. Implement the `AIServiceProvider` interface in a new file (e.g., `src/providers/ai/claude.ts`).
2. Register the new provider in `src/providers/ai/registry.ts`.
3. Set `AI_PROVIDER=claude` in your environment variables.

## Shared Types

All AI-related types and Zod schemas are defined in `packages/shared/src/ai.ts` to ensure type safety across the frontend and backend.
