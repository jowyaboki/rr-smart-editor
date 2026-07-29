import {
  ApiEndpointPlugin,
  GraphQLResolverPlugin,
  OpenAPIFragmentPlugin,
} from '../types';

export class ApiPluginRegistry {
  private endpoints: Map<string, ApiEndpointPlugin> = new Map();
  private resolvers: Map<string, GraphQLResolverPlugin> = new Map();
  private openapiFragments: Map<string, OpenAPIFragmentPlugin> = new Map();

  public registerEndpoint(plugin: ApiEndpointPlugin): void {
    this.endpoints.set(`${plugin.method}:${plugin.path}`, plugin);
  }

  public registerGraphQLResolver(plugin: GraphQLResolverPlugin): void {
    this.resolvers.set(`${plugin.parentType}:${plugin.fieldName}`, plugin);
  }

  public registerOpenAPIFragment(plugin: OpenAPIFragmentPlugin): void {
    this.openapiFragments.set(plugin.id, plugin);
  }

  public getEndpoint(method: string, path: string): ApiEndpointPlugin | undefined {
    return this.endpoints.get(`${method}:${path}`);
  }

  public getGraphQLResolver(parentType: 'Query' | 'Mutation', fieldName: string): GraphQLResolverPlugin | undefined {
    return this.resolvers.get(`${parentType}:${fieldName}`);
  }

  public listEndpoints(): ApiEndpointPlugin[] {
    return Array.from(this.endpoints.values());
  }

  public listGraphQLResolvers(): GraphQLResolverPlugin[] {
    return Array.from(this.resolvers.values());
  }

  public listOpenAPIFragments(): OpenAPIFragmentPlugin[] {
    return Array.from(this.openapiFragments.values());
  }
}

export const globalApiPluginRegistry = new ApiPluginRegistry();
export default globalApiPluginRegistry;
