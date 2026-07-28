import { RecordingConfig, RecordingSession, RecordingType } from '../types';

export class RecordingService {
  private config: RecordingConfig;
  private currentSession: RecordingSession | null = null;
  private rotationTimer: any = null;

  constructor(initialConfig: RecordingConfig) {
    this.config = initialConfig;
  }

  public getSession(): RecordingSession | null {
    return this.currentSession;
  }

  public getConfig(): RecordingConfig {
    return this.config;
  }

  public updateConfig(newConfig: Partial<RecordingConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public async startRecording(): Promise<RecordingSession> {
    if (this.currentSession && this.currentSession.status === 'recording') {
      throw new Error('A recording session is already active.');
    }

    const session: RecordingSession = {
      id: `rec_session_${Date.now()}`,
      status: 'recording',
      startTimeStamp: new Date().toISOString(),
      durationSeconds: 0,
      fileSizeMb: 0.0,
      activeFilePath: `${this.config.outputDirectory}/stream_program_${Date.now()}.${this.config.format}`,
      rotatedFilePaths: [],
    };

    this.currentSession = session;

    // Start interval counters & mock file growth
    this.startMockRecordingInterval();

    // Start automatic file rotation if enabled
    if (this.config.autoRotate) {
      this.startRotationTimer();
    }

    return session;
  }

  public async pauseRecording(): Promise<void> {
    if (!this.currentSession || this.currentSession.status !== 'recording') {
      throw new Error('No active recording session to pause.');
    }
    this.currentSession.status = 'paused';
  }

  public async resumeRecording(): Promise<void> {
    if (!this.currentSession || this.currentSession.status !== 'paused') {
      throw new Error('Recording session is not paused.');
    }
    this.currentSession.status = 'recording';
  }

  public async stopRecording(): Promise<RecordingSession> {
    if (!this.currentSession) {
      throw new Error('No active recording session to stop.');
    }

    this.currentSession.status = 'idle';
    this.clearTimers();

    const finalizedSession = this.currentSession;
    return finalizedSession;
  }

  private startMockRecordingInterval(): void {
    const interval = setInterval(() => {
      if (this.currentSession && this.currentSession.status === 'recording') {
        this.currentSession.durationSeconds += 1;
        // Mock bitrate kbps to MB conversion
        const megabitsPerSecond = this.config.bitrateKbps / 1020;
        this.currentSession.fileSizeMb += megabitsPerSecond / 8;
      } else if (!this.currentSession || this.currentSession.status === 'idle') {
        clearInterval(interval);
      }
    }, 1000);
  }

  private startRotationTimer(): void {
    const rotationMs = this.config.rotationDurationMinutes * 60 * 1000;
    this.rotationTimer = setTimeout(async () => {
      if (this.currentSession && this.currentSession.status === 'recording') {
        // Rotate file
        const oldPath = this.currentSession.activeFilePath;
        if (oldPath) {
          this.currentSession.rotatedFilePaths.push(oldPath);
        }
        this.currentSession.activeFilePath = `${this.config.outputDirectory}/stream_program_rotated_${Date.now()}.${this.config.format}`;
        this.currentSession.fileSizeMb = 0; // Reset segment file size
        // Chain next rotation
        this.startRotationTimer();
      }
    }, rotationMs);
  }

  private clearTimers(): void {
    if (this.rotationTimer) {
      clearTimeout(this.rotationTimer);
      this.rotationTimer = null;
    }
  }
}
