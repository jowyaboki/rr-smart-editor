import { OpenAIProvider } from './openai';
import { AIServiceProvider } from './types';

export const getAIServiceProvider = (): AIServiceProvider => {
  const provider = process.env.AI_PROVIDER || 'openai';
  if (provider === 'openai') return new OpenAIProvider();
  throw new Error(`Unsupported AI provider: ${provider}`);
};
