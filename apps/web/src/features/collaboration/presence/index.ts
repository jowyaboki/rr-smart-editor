import { PresenceService } from '@ai-video-editor/collaboration';

export const webPresence = new PresenceService();
export const getActiveUserPresences = () => webPresence.listPresences();
