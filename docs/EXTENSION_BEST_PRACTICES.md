# Extension Best Practices

To ensure stability, security, and consistent user experience, third-party developers must adhere to these extension design patterns.

## 1. Respect Sandbox Boundaries

- Do not use dangerous dynamic evaluations (`eval()`, `Function()`).
- Limit network calls to whitelisted API endpoints declared in the permission section of your manifest.
- Implement memory clean-ups inside your plugin's deactivation routine to prevent heap leaks.

## 2. Leverage Event-Driven Architecture

Subscribe to the `@ai-video-editor/platform-events` system rather than polling the engine:
```typescript
eventSystem.subscribe('onTimelineClipAdded', (clip) => {
  console.log('Clip added:', clip.id);
});
```

## 3. Graceful Degradation and Local Fallbacks

Build robust fallbacks when offline or when connection timeouts occur. Always handle API connection exceptions gracefully and show user-friendly error messages.
