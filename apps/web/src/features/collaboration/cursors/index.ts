import { webPresence } from '../presence';

export const trackCursorMovement = (userId: string, x: number, y: number) => {
  return webPresence.updatePresence(userId, { cursor: { x, y } });
};
