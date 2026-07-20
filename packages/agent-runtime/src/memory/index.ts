import { AgentMemory } from '../types';

export class MemoryService implements AgentMemory {
  public conversation: { role: 'user' | 'assistant' | 'system'; content: string; timestamp: number }[] = [];
  public project: Record<string, any> = {};
  public workspace: Record<string, any> = {};
  public tasks: Record<string, any> = {};
  public shortTermCache = new Map<string, any>();

  /**
   * Adds a new message to the conversation memory block
   */
  public addMessage(role: 'user' | 'assistant' | 'system', content: string): void {
    this.conversation.push({
      role,
      content,
      timestamp: Date.now(),
    });
  }

  /**
   * Gets conversation history formatted for model adapters
   */
  public getConversationHistory(): { role: 'user' | 'assistant' | 'system'; content: string }[] {
    return this.conversation.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));
  }

  /**
   * Updates project context memory
   */
  public updateProjectMemory(key: string, value: any): void {
    this.project[key] = value;
  }

  /**
   * Updates workspace configuration memory
   */
  public updateWorkspaceMemory(key: string, value: any): void {
    this.workspace[key] = value;
  }

  /**
   * Updates current active task memory
   */
  public updateTaskMemory(taskId: string, key: string, value: any): void {
    if (!this.tasks[taskId]) {
      this.tasks[taskId] = {};
    }
    this.tasks[taskId][key] = value;
  }

  /**
   * Clears out short-term transient cache
   */
  public clearShortTermCache(): void {
    this.shortTermCache.clear();
  }
}
