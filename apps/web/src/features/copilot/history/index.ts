export const recordUndoCheckpoint = (checkpointId: string, projectGraph: any) => ({
  checkpointId,
  timestamp: Date.now(),
  state: JSON.stringify(projectGraph),
});
export const rollbackToCheckpoint = (checkpoint: any) => {
  return JSON.parse(checkpoint.state);
};
