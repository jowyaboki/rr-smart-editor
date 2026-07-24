import { IGPUService, GPUDiagnostics } from '@ai-video-editor/desktop-core';

export class GPUService implements IGPUService {
  private mockDiagnostics: GPUDiagnostics = {
    gpuEnabled: true,
    vendorName: 'NVIDIA Corporation',
    modelName: 'NVIDIA RTX 4090',
    driverVersion: '535.104.05',
    vramTotalMb: 24576,
    supportsHardwareAcceleration: true,
    apiType: 'cuda',
  };

  public async detectGPU(): Promise<GPUDiagnostics> {
    return this.mockDiagnostics;
  }

  public async isHardwareAccelerated(): Promise<boolean> {
    return this.mockDiagnostics.supportsHardwareAcceleration;
  }

  public setMockDiagnostics(diag: GPUDiagnostics): void {
    this.mockDiagnostics = diag;
  }
}
