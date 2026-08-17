# Studio Module Architecture

Consolidating features into a modular, plugin-driven Studio Framework where every capability acts as a registered Studio Module.

## Extension Registry
* **Registry Core**: Centralized state management is defined within `useWorkflowStore.ts`'s `registeredStudioModules` collection.
* **Contribution points**: Exposes sidebar, top toolbar, and command search registrations to custom plugins.
