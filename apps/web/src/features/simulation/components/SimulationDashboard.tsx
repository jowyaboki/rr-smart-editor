import React, { useEffect, useState } from 'react';
import { useSimulationStore } from '../store/simulationStore';
import { PerformanceCharts } from './PerformanceCharts';
import { TimelineComparison } from './TimelineComparison';
import { BeforeAfterViewer } from './BeforeAfterViewer';
import { ResourceGraphs } from './ResourceGraphs';
import { Project, Workflow, WorkflowVariable } from '@ai-video-editor/shared';

export const SimulationDashboard: React.FC = () => {
  const {
    activeTwin,
    activeResult,
    scenarios,
    isSimulating,
    compareMode,
    replayPointer,
    initTwin,
    executeOperation,
    runScenario,
    stepForward,
    stepBackward,
    timeTravel,
    rollback,
    setCompareMode,
    clearSimulationHistory,
  } = useSimulationStore();

  const [simulationType, setSimulationType] = useState<'timeline_edit' | 'ai_operation' | 'variable_update' | 'expression_evaluation'>('timeline_edit');
  const [operationPayload, setPayload] = useState<string>('{}');

  // Trigger default initialization on load if no active twin
  useEffect(() => {
    if (!activeTwin) {
      const demoProject: Project = {
        id: 'proj_demo',
        name: 'Sundance Smart Montage',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        timeline: {
          tracks: [
            { id: 'tr_vid_1', name: 'Master Video 1', type: 'video' },
            { id: 'tr_aud_1', name: 'Background Audio', type: 'audio' },
          ],
          clips: [
            { id: 'c_broll_1', trackId: 'tr_vid_1', name: 'B-Roll Clip 1', startFrame: 0, duration: 150, type: 'video', assetId: 'as_broll_1', sizeMb: 85 },
            { id: 'c_dialog_1', trackId: 'tr_vid_1', name: 'Interview Take 2', startFrame: 150, duration: 300, type: 'video', assetId: 'as_interview_2', sizeMb: 450 },
          ],
        },
      };

      const demoWorkflows: Workflow[] = [
        {
          id: 'wf_montage',
          name: 'Beat Cutter Automation Pipeline',
          trigger: { type: 'manual' },
          steps: [
            { id: 'st_1', name: 'Detect audio transient peaks', type: 'script', config: {}, nextStepId: 'st_2' },
            { id: 'st_2', name: 'Generate AI smart cuts', type: 'ai_task', config: {}, nextStepId: 'st_3' },
            { id: 'st_3', name: 'Pre-cache transcoded region', type: 'transform', config: {} },
          ],
          variables: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      const demoAssets = [
        { id: 'as_broll_1', name: 'broll_1.mov', type: 'video', sizeMb: 85 },
        { id: 'as_interview_2', name: 'interview_2.mp4', type: 'video', sizeMb: 450 },
      ];

      const demoPlugins = ['legacy_audio', 'v2_audio']; // Triggers a conflict validation warning!

      initTwin(demoProject, demoWorkflows, [], demoAssets, demoPlugins, ['playback']); // Missing 'export_render' role!
    }
  }, [activeTwin, initTwin]);

  const handleCustomOperation = async () => {
    try {
      const parsed = JSON.parse(operationPayload);
      await executeOperation(simulationType, parsed);
    } catch (err) {
      alert('Invalid JSON payload! Please verify formatting.');
    }
  };

  const handlePredefinedPayload = (type: string) => {
    setSimulationType(type as any);
    if (type === 'timeline_edit') {
      setPayload(JSON.stringify({ action: 'move', clipId: 'c_broll_1', startFrame: 45 }, null, 2));
    } else if (type === 'ai_operation') {
      setPayload(JSON.stringify({ operation: 'auto_caption' }, null, 2));
    } else if (type === 'variable_update') {
      setPayload(JSON.stringify({ name: 'codec_bitrate', value: 8000 }, null, 2));
    } else if (type === 'expression_evaluation') {
      setPayload(JSON.stringify({ expression: 'this.__proto__.polluted = true', targetField: 'name', targetClipId: 'c_broll_1' }, null, 2));
    }
  };

  const originalState = activeTwin ? (activeTwin as any).initialStateJson ? JSON.parse((activeTwin as any).initialStateJson).project : null : null;
  const simulatedState = activeTwin ? activeTwin.getProjectState() : null;

  return (
    <div style={{ padding: '24px', background: '#121212', minHeight: '100vh', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #222', paddingBottom: '16px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '10px' }}>🤖</span> Digital Twin Simulation Engine
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#aaa' }}>
            Safe, isolated virtual sandbox for timeline modifications, cost estimations, performance profiling, and AI automation previews.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setCompareMode(!compareMode)}
            style={{
              padding: '10px 16px',
              background: compareMode ? '#2196f3' : '#333',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            {compareMode ? 'Disable Comparison' : 'Compare Split View'}
          </button>
          <button
            onClick={clearSimulationHistory}
            style={{
              padding: '10px 16px',
              background: '#e91e63',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Reset Sandbox
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px' }}>
        {/* Left Hand Column: Operations, Diff, Compare, and Replay */}
        <div>
          {/* Operations Sandbox panel */}
          <div style={{ background: '#1e1e1e', padding: '20px', borderRadius: '8px', border: '1px solid #333', marginBottom: '24px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px' }}>🔧 Sandbox Operation Dispatcher</h3>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <select
                value={simulationType}
                onChange={(e) => handlePredefinedPayload(e.target.value)}
                style={{ background: '#252526', color: '#fff', padding: '10px', border: '1px solid #444', borderRadius: '4px', flex: '1', cursor: 'pointer' }}
              >
                <option value="timeline_edit">Timeline Edit</option>
                <option value="ai_operation">AI Operation</option>
                <option value="variable_update">Variable Update</option>
                <option value="expression_evaluation">Expression Evaluation</option>
              </select>

              <button
                onClick={handleCustomOperation}
                disabled={isSimulating}
                style={{
                  padding: '0 24px',
                  background: '#4caf50',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                {isSimulating ? 'Processing...' : 'Dispatch Operation'}
              </button>
            </div>

            <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '8px' }}>JSON Configuration payload:</div>
            <textarea
              value={operationPayload}
              onChange={(e) => setPayload(e.target.value)}
              rows={5}
              style={{
                width: '100%',
                background: '#151515',
                color: '#4caf50',
                fontFamily: 'monospace',
                padding: '12px',
                border: '1px solid #333',
                borderRadius: '4px',
                boxSizing: 'border-box',
                resize: 'vertical',
              }}
            />
            <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
              <button onClick={() => handlePredefinedPayload('timeline_edit')} style={{ fontSize: '11px', background: '#2d2d2d', color: '#ccc', border: 'none', padding: '4px 8px', borderRadius: '2px', cursor: 'pointer' }}>Preset Move</button>
              <button onClick={() => handlePredefinedPayload('ai_operation')} style={{ fontSize: '11px', background: '#2d2d2d', color: '#ccc', border: 'none', padding: '4px 8px', borderRadius: '2px', cursor: 'pointer' }}>Preset Captioning</button>
              <button onClick={() => handlePredefinedPayload('variable_update')} style={{ fontSize: '11px', background: '#2d2d2d', color: '#ccc', border: 'none', padding: '4px 8px', borderRadius: '2px', cursor: 'pointer' }}>Preset Variable</button>
              <button onClick={() => handlePredefinedPayload('expression_evaluation')} style={{ fontSize: '11px', background: '#2d2d2d', color: '#ccc', border: 'none', padding: '4px 8px', borderRadius: '2px', cursor: 'pointer' }}>Preset Expression Pollution</button>
            </div>
          </div>

          {/* Preset Scenario Runs */}
          <div style={{ background: '#1e1e1e', padding: '20px', borderRadius: '8px', border: '1px solid #333', marginBottom: '24px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px' }}>🚀 Run Predefined Simulation Scenarios</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              {scenarios.map((scen) => (
                <div key={scen.id} style={{ background: '#252526', padding: '16px', borderRadius: '6px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid #333' }}>
                  <div>
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', color: '#2196f3' }}>{scen.name}</h4>
                    <p style={{ margin: 0, fontSize: '12px', color: '#aaa', lineHeight: '1.4' }}>{scen.description}</p>
                  </div>
                  <button
                    onClick={() => runScenario(scen)}
                    disabled={isSimulating}
                    style={{
                      marginTop: '16px',
                      background: '#2196f3',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '8px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                    }}
                  >
                    Simulate Pipeline
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Chronological Logs and Time Travel Controls */}
          {activeTwin && activeTwin.history.length > 0 && (
            <div style={{ background: '#1e1e1e', padding: '20px', borderRadius: '8px', border: '1px solid #333', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '16px' }}>⏳ Replay & Time Travel Console</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={stepBackward} style={{ padding: '6px 12px', background: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>⬅ Step Back</button>
                  <button onClick={stepForward} style={{ padding: '6px 12px', background: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Step Fwd ➡</button>
                  <button onClick={rollback} style={{ padding: '6px 12px', background: 'rgba(233, 30, 99, 0.2)', color: '#e91e63', border: '1px solid #e91e63', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Undo Last</button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '10px' }}>
                <div
                  onClick={() => timeTravel(-1)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '4px',
                    background: replayPointer === -1 ? '#2196f3' : '#252526',
                    cursor: 'pointer',
                    fontSize: '12px',
                    textAlign: 'center',
                    minWidth: '100px',
                  }}
                >
                  <strong>Initial State</strong>
                  <div style={{ fontSize: '10px', opacity: 0.7 }}>Reset Sandbox</div>
                </div>

                {activeTwin.history.map((evt, i) => (
                  <div
                    key={evt.id}
                    onClick={() => timeTravel(i)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '4px',
                      background: replayPointer === i ? '#2196f3' : '#252526',
                      border: replayPointer >= i ? '1px solid #2196f3' : '1px solid transparent',
                      cursor: 'pointer',
                      fontSize: '12px',
                      textAlign: 'center',
                      minWidth: '120px',
                    }}
                  >
                    <strong>Step {i + 1}</strong>
                    <div style={{ fontSize: '10px', opacity: 0.7, textTransform: 'capitalize' }}>{evt.type.replace('_', ' ')}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Diffs & Side by side comparison */}
          {compareMode && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <BeforeAfterViewer originalProject={originalState} simulatedProject={simulatedState} />
              <TimelineComparison originalProject={originalState} simulatedProject={simulatedState} />
            </div>
          )}
        </div>

        {/* Right Hand Column: Analytics, Validations, and Suggestions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Performance Profiler Charts */}
          <PerformanceCharts prediction={activeResult?.predictions || null} />

          {/* Cost Estimates */}
          <ResourceGraphs prediction={activeResult?.predictions || null} />

          {/* Validations/Health Service checks */}
          <div style={{ background: '#1e1e1e', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', borderBottom: '1px solid #333', paddingBottom: '10px', color: '#ff9800' }}>
              ⚠️ Security & Health Validations
            </h3>

            {activeResult?.validationIssues && activeResult.validationIssues.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {activeResult.validationIssues.map((issue) => (
                  <div
                    key={issue.id}
                    style={{
                      background: issue.severity === 'error' ? 'rgba(244, 67, 54, 0.1)' : 'rgba(255, 152, 0, 0.1)',
                      borderLeft: `4px solid ${issue.severity === 'error' ? '#f44336' : '#ff9800'}`,
                      padding: '10px',
                      borderRadius: '4px',
                      fontSize: '13px',
                    }}
                  >
                    <div style={{ fontWeight: 'bold', textTransform: 'capitalize', color: issue.severity === 'error' ? '#f44336' : '#ff9800', marginBottom: '2px' }}>
                      {issue.category.replace('_', ' ')} ({issue.severity})
                    </div>
                    <div>{issue.message}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '12px', background: '#252526', borderRadius: '4px', textAlign: 'center', color: '#888', fontSize: '13px' }}>
                No active conflicts or broken expressions. The virtual project sandbox is completely healthy.
              </div>
            )}
          </div>

          {/* Optimization Suggestions */}
          <div style={{ background: '#1e1e1e', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', borderBottom: '1px solid #333', paddingBottom: '10px', color: '#4caf50' }}>
              💡 Smart Optimization Proposals
            </h3>

            {activeResult?.optimizationProposals && activeResult.optimizationProposals.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {activeResult.optimizationProposals.map((prop) => (
                  <div key={prop.id} style={{ background: '#252526', padding: '12px', borderRadius: '6px', border: '1px solid #333' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#4caf50' }}>{prop.title}</span>
                      <span
                        style={{
                          fontSize: '11px',
                          background: prop.effort === 'low' ? 'rgba(76,175,80,0.1)' : prop.effort === 'medium' ? 'rgba(255,152,0,0.1)' : 'rgba(244,67,54,0.1)',
                          color: prop.effort === 'low' ? '#4caf50' : prop.effort === 'medium' ? '#ff9800' : '#f44336',
                          padding: '2px 6px',
                          borderRadius: '2px',
                          textTransform: 'uppercase',
                        }}
                      >
                        {prop.effort} effort
                      </span>
                    </div>
                    <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#aaa', lineHeight: '1.4' }}>{prop.description}</p>
                    <div style={{ fontSize: '11px', color: '#fff', borderTop: '1px solid #333', paddingTop: '6px', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Projected Duration Reduction:</span>
                      <strong style={{ color: '#4caf50' }}>-{(prop.potentialSavings.renderDurationReductionMs / 1000).toFixed(1)}s</strong>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '12px', background: '#252526', borderRadius: '4px', textAlign: 'center', color: '#888', fontSize: '13px' }}>
                Generate estimates to inspect actionable speed and storage enhancements.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
