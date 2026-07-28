export class PipelineError extends Error {
  constructor(message: string, public readonly stageId: string) {
    super(message);
    this.name = 'PipelineError';
  }
}

export class ValidationError extends PipelineError {
  constructor(message: string, stageId: string = 'validate') {
    super(message, stageId);
    this.name = 'ValidationError';
  }
}

export class WorkerAllocationError extends PipelineError {
  constructor(message: string, stageId: string = 'allocate_worker') {
    super(message, stageId);
    this.name = 'WorkerAllocationError';
  }
}

export class RenderExecutionError extends PipelineError {
  constructor(message: string, stageId: string = 'render') {
    super(message, stageId);
    this.name = 'RenderExecutionError';
  }
}

export class EncodingError extends PipelineError {
  constructor(message: string, stageId: string = 'encode') {
    super(message, stageId);
    this.name = 'EncodingError';
  }
}

export class ArtifactPersistenceError extends PipelineError {
  constructor(message: string, stageId: string = 'persist_artifacts') {
    super(message, stageId);
    this.name = 'ArtifactPersistenceError';
  }
}
