import { GeneratorConfig } from '@ai-video-editor/devkit';

export class CodegenService {
  /**
   * Automates the code generation of Types, Schemas, Boilerplate, Registries, Tests, and Documentations
   */
  public generateCodeArtifacts(config: GeneratorConfig): {
    schemas: string;
    registryInjections: string;
    tests: string;
    docs: string;
  } {
    const uppercaseName = config.name.charAt(0).toUpperCase() + config.name.slice(1);

    const schemas = `
import { z } from 'zod';

export const ${uppercaseName}ConfigSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  enabled: z.boolean().default(true),
});

export type ${uppercaseName}Config = z.infer<typeof ${uppercaseName}ConfigSchema>;
    `;

    const registryInjections = `
import { globalPluginRegistry } from '@ai-video-editor/plugin-sdk';
import { ${uppercaseName}Engine } from './src';

// Automatic registration entrypoint
globalPluginRegistry.registerExtension('${config.name.toLowerCase()}', new ${uppercaseName}Engine());
    `;

    const tests = `
import { describe, test } from 'node:test';
import assert from 'node:assert';
import { ${uppercaseName}Engine } from '../src';

describe('${uppercaseName} Auto-Generated Unit Tests', () => {
  test('Boilerplate validation test', () => {
    const instance = new ${uppercaseName}Engine();
    assert.ok(instance);
  });
});
    `;

    const docs = `
# ${uppercaseName} - Auto Generated SDK Documentation

Overview of ${config.name} (${config.type}) created by ${config.author}.

## Setup Instructions
Import this module and mount it within the RR Smart Editor workspace devkit registry.
    `;

    return {
      schemas,
      registryInjections,
      tests,
      docs,
    };
  }
}
export const globalCodegenService = new CodegenService();
