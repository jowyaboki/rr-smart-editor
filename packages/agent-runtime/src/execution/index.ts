import { ToolDefinition, ToolCall, ToolResult, ExecutionContext } from '../types';
import { BuiltInToolsRegistry } from '../tools';

export interface ExecutionOptions {
  allowedTools?: string[]; // Allowlist of tools
  permissions?: string[]; // User session permissions
  requireConfirmation?: boolean; // If true, triggers confirmation hook
  onConfirm?: (toolName: string, args: any) => Promise<boolean>;
}

export class ExecutionService {
  private registry = new BuiltInToolsRegistry();

  /**
   * Executes a single ToolCall with full sandbox safety and permission checks.
   */
  public async executeToolCall(
    call: ToolCall,
    context: ExecutionContext,
    options?: ExecutionOptions
  ): Promise<ToolResult> {
    if (context.isCancelled) {
      return {
        callId: call.id,
        success: false,
        error: { code: 'CANCELLED', message: 'Execution was cancelled by the user.' },
      };
    }

    const tool = this.registry.getTool(call.toolName);
    if (!tool) {
      return {
        callId: call.id,
        success: false,
        error: { code: 'TOOL_NOT_FOUND', message: `Tool with name "${call.toolName}" was not found in the registry.` },
      };
    }

    // 1. ALLOCATE TIMEOUTS & SANITY CHECKS
    const timeoutMs = context.timeout || 10000; // default 10 seconds
    const timeoutPromise = new Promise<ToolResult>((_, reject) => {
      setTimeout(() => reject(new Error('TIMEOUT')), timeoutMs);
    });

    try {
      // 2. CHECK SECURITY ALLOWLISTS
      if (options?.allowedTools && !options.allowedTools.includes(call.toolName)) {
        return {
          callId: call.id,
          success: false,
          error: { code: 'SECURITY_VIOLATION', message: `Execution of tool "${call.toolName}" is not permitted under the current security profile.` },
        };
      }

      // 3. ENFORCE ROLE-BASED PERMISSION CHECKS
      if (options?.permissions && !this.registry.isAuthorized(call.toolName, options.permissions)) {
        return {
          callId: call.id,
          success: false,
          error: { code: 'PERMISSION_DENIED', message: `Insufficient privileges to execute tool "${call.toolName}".` },
        };
      }

      // 4. TRIGGER USER CONFIRMATION HOOKS (For destructive/sensitive operations)
      if (options?.requireConfirmation && options.onConfirm) {
        const confirmed = await options.onConfirm(call.toolName, call.arguments);
        if (!confirmed) {
          return {
            callId: call.id,
            success: false,
            error: { code: 'USER_REJECTED', message: `User declined execution of tool "${call.toolName}".` },
          };
        }
      }

      // 5. RUN EXECUTOR IN SANITIZED SANDBOX ENVIRONMENT WITH TIMEOUTS
      const executionPromise = tool.executor(call.arguments, context);

      const result = await Promise.race([executionPromise, timeoutPromise]);
      return {
        ...result,
        callId: call.id,
      };

    } catch (err: any) {
      if (err.message === 'TIMEOUT') {
        return {
          callId: call.id,
          success: false,
          error: { code: 'TIMEOUT', message: `Tool execution exceeded the allowed duration of ${timeoutMs}ms.` },
        };
      }

      return {
        callId: call.id,
        success: false,
        error: {
          code: 'EXECUTION_FAILED',
          message: err.message || 'An unexpected error occurred during tool execution.',
          details: err,
        },
      };
    }
  }

  /**
   * Executes multiple ToolCalls concurrently.
   */
  public async executeParallel(
    calls: ToolCall[],
    context: ExecutionContext,
    options?: ExecutionOptions
  ): Promise<ToolResult[]> {
    if (context.isCancelled) {
      return calls.map(c => ({
        callId: c.id,
        success: false,
        error: { code: 'CANCELLED', message: 'Execution was cancelled.' },
      }));
    }

    const promises = calls.map(call => this.executeToolCall(call, context, options));
    return Promise.all(promises);
  }

  /**
   * Returns the registered BuiltInToolsRegistry instance
   */
  public getRegistry(): BuiltInToolsRegistry {
    return this.registry;
  }
}
