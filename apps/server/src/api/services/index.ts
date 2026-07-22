import { ApiGateway, ApiVersionManager, SdkGenerator } from '@ai-video-editor/api-sdk';

export const gatewayService = new ApiGateway();
export const versionManagerService = new ApiVersionManager();
export const sdkGeneratorService = new SdkGenerator();
export { ApiGateway, ApiVersionManager, SdkGenerator };
