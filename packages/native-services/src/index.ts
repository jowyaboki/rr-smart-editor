import { DesktopService } from './services/DesktopService';
import { NativeMenuService } from './services/NativeMenuService';
import { FileSystemService } from './services/FileSystemService';
import { GPUService } from './services/GPUService';
import { UpdateService } from './services/UpdateService';
import { CrashRecoveryService } from './services/CrashRecoveryService';
import { NativeAIService } from './services/NativeAIService';

export * from './services/DesktopService';
export * from './services/NativeMenuService';
export * from './services/FileSystemService';
export * from './services/GPUService';
export * from './services/UpdateService';
export * from './services/CrashRecoveryService';
export * from './services/NativeAIService';

export class NativeDesktopPlatformEngine {
  public desktopService: DesktopService;
  public nativeMenuService: NativeMenuService;
  public fileSystemService: FileSystemService;
  public gpuService: GPUService;
  public updateService: UpdateService;
  public crashRecoveryService: CrashRecoveryService;
  public nativeAIService: NativeAIService;

  constructor() {
    this.desktopService = new DesktopService();
    this.nativeMenuService = new NativeMenuService();
    this.fileSystemService = new FileSystemService();
    this.gpuService = new GPUService();
    this.updateService = new UpdateService();
    this.crashRecoveryService = new CrashRecoveryService();
    this.nativeAIService = new NativeAIService();
  }
}

export const globalNativeDesktopPlatformEngine = new NativeDesktopPlatformEngine();
