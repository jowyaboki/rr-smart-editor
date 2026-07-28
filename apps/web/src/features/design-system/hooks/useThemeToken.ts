import { useDesignSystemStore } from '../store/designSystemStore';

export function useThemeToken(path: string): any {
  const resolvedTokens = useDesignSystemStore(state => state.resolvedTokens);

  const parts = path.split('.');
  let current: any = resolvedTokens;
  for (const part of parts) {
    if (current === undefined || current === null) return undefined;
    current = current[part];
  }

  return current;
}
