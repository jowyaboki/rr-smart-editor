export interface Command {
  id: string;
  title: string;
  execute: (...args: any[]) => void | Promise<void>;
  undo?: () => void | Promise<void>;
}

export class CommandRegistry {
  private commands: Map<string, Command> = new Map();

  register(command: Command): void {
    this.commands.set(command.id, command);
  }

  execute(id: string, ...args: any[]): void {
    const command = this.commands.get(id);
    if (command) {
      command.execute(...args);
    } else {
      console.warn(`Command ${id} not found`);
    }
  }
}
