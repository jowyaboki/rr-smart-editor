import { ChatMessage } from '@ai-video-editor/shared';

export const ConversationService = {
  createMessage(role: 'user' | 'assistant', content: string): ChatMessage {
    return {
      id: Math.random().toString(36).substr(2, 9),
      role,
      content,
      timestamp: new Date().toISOString()
    };
  }
};
