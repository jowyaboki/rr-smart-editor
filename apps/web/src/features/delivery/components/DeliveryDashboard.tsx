import React, { useEffect, useState } from 'react';
import { useDelivery } from '../hooks/useDelivery';
import {
  ExportPreset,
  DeliveryJob,
  Destination,
  DistributionTask,
  QualityReport,
} from '@ai-video-editor/delivery-platform';

// ==========================================
// REUSABLE SUB-COMPONENTS & WIDGETS
// ==========================================

export const ExportPresetCard: React.FC<{
  preset: ExportPreset;
  selected: boolean;
  onSelect: () => void;
}> = ({ preset, selected, onSelect }) => {
  return (
    <div
      onClick={onSelect}
      style={{
        background: selected ? '#1976d2' : '#2d2d2d',
        border: selected ? '1px solid #64b5f6' : '1px solid #3d3d3d',
        padding: '12px',
        borderRadius: '6px',
        color: '#fff',
        cursor: 'pointer',
        transition: 'all 0.2s',
        marginBottom: '8px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 'bold', fontSize: '13px' }}>{preset.name}</span>
        <span
          style={{
            fontSize: '10px',
            background: 'rgba(255,255,255,0.15)',
            padding: '2px 6px',
            borderRadius: '4px',
            textTransform: 'uppercase',
          }}
        >
          {preset.format}
        </span>
      </div>
      <p style={{ fontSize: '11px', color: selected ? '#e0e0e0' : '#aaa', margin: '6px 0 0 0' }}>
        {preset.description}
      </p>
    </div>
  );
};

export const DeliveryQueueCard: React.FC<{
  job: DeliveryJob;
  isSelected: boolean;
  isMultiSelected: boolean;
  onClick: () => void;
  onToggleSelect: (e: React.MouseEvent) => void;
}> = ({ job, isSelected, isMultiSelected, onClick, onToggleSelect }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#4caf50';
      case 'processing':
        return '#2196f3';
      case 'failed':
        return '#f44336';
      case 'cancelled':
        return '#ff9800';
      default:
        return '#9e9e9e';
    }
  };

  return (
    <div
      onClick={onClick}
      style={{
        background: isSelected ? '#2a2d32' : '#1e1e1e',
        border: isSelected ? '1px solid #2196f3' : '1px solid #2d2d2d',
        padding: '12px',
        borderRadius: '6px',
        color: '#fff',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '8px',
        transition: 'background 0.2s',
      }}
    >
      <input
        type="checkbox"
        checked={isMultiSelected}
        onChange={() => {}}
        onClick={onToggleSelect}
        style={{ cursor: 'pointer' }}
      />
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 'bold', fontSize: '13px' }}>Job ID: {job.id.substring(0, 12)}...</span>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 'bold',
              color: getStatusColor(job.status),
              textTransform: 'uppercase',
            }}
          >
            ● {job.status}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#aaa', marginTop: '4px' }}>
          <span>Proj: {job.projectId}</span>
          <span>Preset: {job.presetId}</span>
        </div>
        {job.status === 'processing' && (
          <div style={{ marginTop: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '2px' }}>
              <span>Progress</span>
              <span>{job.progress}%</span>
            </div>
            <div style={{ background: '#333', height: '4px', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ background: '#2196f3', width: `${job.progress}%`, height: '100%', transition: 'width 0.3s' }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const QualityReportCard: React.FC<{ report?: QualityReport }> = ({ report }) => {
  if (!report) {
    return (
      <div style={{ background: '#252526', padding: '16px', borderRadius: '6px', border: '1px solid #333', color: '#999', textAlign: 'center' }}>
        No QC Report compiled for this job yet.
      </div>
    );
  }

  return (
    <div style={{ background: '#252526', padding: '16px', borderRadius: '6px', border: '1px solid #333', color: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h4 style={{ margin: 0, fontSize: '13px', color: '#aaa' }}>QUALITY CONTROL SCORE</h4>
        <span
          style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: report.score >= 90 ? '#4caf50' : report.score >= 70 ? '#ff9800' : '#f44336',
          }}
        >
          {report.score} / 100
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px', marginBottom: '12px' }}>
        <div style={{ background: '#1e1e1e', padding: '8px', borderRadius: '4px' }}>
          <span style={{ color: '#aaa' }}>Status: </span>
          <strong style={{ color: report.isValid ? '#4caf50' : '#f44336' }}>
            {report.isValid ? 'PASSED' : 'REJECTED'}
          </strong>
        </div>
        <div style={{ background: '#1e1e1e', padding: '8px', borderRadius: '4px' }}>
          <span style={{ color: '#aaa' }}>Frame Drops: </span>
          <strong>{report.metrics.frameDrops}</strong>
        </div>
      </div>

      {report.violations.length > 0 ? (
        <div>
          <h5 style={{ margin: '0 0 6px 0', fontSize: '11px', color: '#aaa' }}>VIOLATIONS ({report.violations.length})</h5>
          <div style={{ maxHeight: '120px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {report.violations.map((v, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(244, 67, 54, 0.08)',
                  borderLeft: `3px solid ${v.severity === 'error' ? '#f44336' : '#ff9800'}`,
                  padding: '6px 10px',
                  borderRadius: '3px',
                  fontSize: '11px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: '#f44336' }}>
                  <span>{v.type}</span>
                  <span style={{ fontSize: '9px', opacity: 0.8 }}>{v.severity.toUpperCase()}</span>
                </div>
                <div style={{ color: '#ccc', marginTop: '2px' }}>{v.message}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ fontSize: '11px', color: '#4caf50', textAlign: 'center', padding: '6px' }}>
          ✓ No brand, formatting or audio violations detected.
        </div>
      )}
    </div>
  );
};

export const DestinationCard: React.FC<{ destination: Destination }> = ({ destination }) => {
  return (
    <div style={{ background: '#2a2a2b', padding: '10px', borderRadius: '6px', border: '1px solid #333', color: '#fff', marginBottom: '6px' }}>
      <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{destination.name}</div>
      <div style={{ fontSize: '10px', color: '#888', marginTop: '2px', textTransform: 'capitalize' }}>
        Type: {destination.type} | Config: {JSON.stringify(destination.config)}
      </div>
    </div>
  );
};

// ==========================================
// MAIN DELIVERY DASHBOARD COMPONENT
// ==========================================

export const DeliveryDashboard: React.FC = () => {
  const {
    jobs,
    presets,
    recentLogs,
    selectedJobId,
    selectedJobIds,
    selectedPresetId,
    activePanel,
    searchQuery,
    statusFilter,
    sortKey,
    sortOrder,
    isLoading,
    initStore,
    selectJob,
    toggleJobSelection,
    selectPreset,
    setActivePanel,
    setSearchQuery,
    setStatusFilter,
    setSort,
    submitDeliveryJob,
    cancelDeliveryJob,
    createCustomPreset,
    addLogMessage,
  } = useDelivery();

  const [simulatedProject, setSimulatedProject] = useState('project_broadway');

  useEffect(() => {
    initStore();
  }, [initStore]);

  // Derive some metrics
  const activeJobsCount = jobs.filter((j) => j.status === 'processing').length;
  const completedJobsCount = jobs.filter((j) => j.status === 'completed').length;
  const failedJobsCount = jobs.filter((j) => j.status === 'failed').length;

  const selectedJob = jobs.find((j) => j.id === selectedJobId);

  // Trigger simulated delivery submission
  const handleSimulateSubmit = async () => {
    if (!selectedPresetId) {
      alert('Please select an export preset on the left sidebar first.');
      return;
    }

    const mockArtifact = {
      id: `art_${Math.random().toString(36).substr(2, 9)}`,
      jobId: `render_${Math.random().toString(36).substr(2, 9)}`,
      url: `/uploads/renders/simulation_output.mp4`,
      format: 'mp4',
      size: 1024 * 1024 * 18,
      metadata: {
        duration: 25.0,
        resolution: { width: 1920, height: 1080 },
        codec: 'h264',
      },
      createdAt: new Date().toISOString(),
    };

    addLogMessage(`[Action: submitDeliveryJob] Creating delivery workflow for ${simulatedProject}...`);
    await submitDeliveryJob(simulatedProject, mockArtifact, selectedPresetId);
  };

  const handleBulkCancel = () => {
    if (selectedJobIds.length === 0) return;
    selectedJobIds.forEach((id) => cancelDeliveryJob(id));
    addLogMessage(`[Action: BulkCancel] Interrupted ${selectedJobIds.length} delivery jobs.`);
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateRows: 'auto 1fr auto',
        height: '100vh',
        background: '#121212',
        color: '#e0e0e0',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* HEADER SECTION */}
      <div
        style={{
          background: '#1c1c1c',
          padding: '12px 20px',
          borderBottom: '1px solid #2d2d2d',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>🚚</span>
          <div>
            <h1 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>
              PROFESSIONAL EXPORT, DELIVERY & DISTRIBUTION PLATFORM
            </h1>
            <p style={{ margin: 0, fontSize: '11px', color: '#888' }}>
              Optimizing, validating and packaging assets without direct rendering
            </p>
          </div>
        </div>

        {/* TOP TELEMETRY WIDGETS */}
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ background: '#252526', padding: '6px 12px', borderRadius: '4px', border: '1px solid #333' }}>
            <span style={{ fontSize: '10px', color: '#888', display: 'block', textTransform: 'uppercase' }}>Active Tasks</span>
            <strong style={{ color: '#2196f3', fontSize: '14px' }}>{activeJobsCount} Running</strong>
          </div>
          <div style={{ background: '#252526', padding: '6px 12px', borderRadius: '4px', border: '1px solid #333' }}>
            <span style={{ fontSize: '10px', color: '#888', display: 'block', textTransform: 'uppercase' }}>Completed</span>
            <strong style={{ color: '#4caf50', fontSize: '14px' }}>{completedJobsCount}</strong>
          </div>
          <div style={{ background: '#252526', padding: '6px 12px', borderRadius: '4px', border: '1px solid #333' }}>
            <span style={{ fontSize: '10px', color: '#888', display: 'block', textTransform: 'uppercase' }}>Failed</span>
            <strong style={{ color: '#f44336', fontSize: '14px' }}>{failedJobsCount}</strong>
          </div>
        </div>
      </div>

      {/* THREE PANEL GRID LAYOUT */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 340px', overflow: 'hidden' }}>
        {/* LEFT PANEL: SIDEBAR */}
        <div
          style={{
            background: '#181818',
            borderRight: '1px solid #2d2d2d',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            overflowY: 'auto',
          }}
        >
          <div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Export Presets
            </h3>
            {presets.map((preset) => (
              <ExportPresetCard
                key={preset.id}
                preset={preset}
                selected={selectedPresetId === preset.id}
                onSelect={() => selectPreset(preset.id)}
              />
            ))}
          </div>

          <div style={{ borderTop: '1px solid #2d2d2d', paddingTop: '16px' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Quick Action Simulation
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input
                type="text"
                value={simulatedProject}
                onChange={(e) => setSimulatedProject(e.target.value)}
                placeholder="Project Name"
                style={{
                  background: '#222',
                  border: '1px solid #3d3d3d',
                  borderRadius: '4px',
                  padding: '6px 10px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <button
                onClick={handleSimulateSubmit}
                style={{
                  background: '#2196f3',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px',
                  fontWeight: 'bold',
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                Submit New Delivery
              </button>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #2d2d2d', paddingTop: '16px' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#aaa', textTransform: 'uppercase' }}>Navigation</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {(['queue', 'presets', 'destinations', 'monitoring'] as const).map((p) => (
                <div
                  key={p}
                  onClick={() => setActivePanel(p)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    textTransform: 'capitalize',
                    background: activePanel === p ? '#252526' : 'transparent',
                    color: activePanel === p ? '#fff' : '#aaa',
                  }}
                >
                  📁 {p === 'queue' ? 'Delivery Queue' : p}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MIDDLE PANEL: DELIVERY QUEUE, SCHEDULING, SUMMARY */}
        <div
          style={{
            background: '#121212',
            padding: '20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {/* SEARCH & BULK ACTIONS CONTROLS */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              background: '#1a1a1a',
              padding: '10px 16px',
              borderRadius: '6px',
              border: '1px solid #2d2d2d',
            }}
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search delivery jobs..."
              style={{
                flex: 1,
                background: '#252526',
                border: '1px solid #3d3d3d',
                borderRadius: '4px',
                padding: '6px 12px',
                color: '#fff',
                fontSize: '12px',
              }}
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              style={{
                background: '#252526',
                border: '1px solid #3d3d3d',
                borderRadius: '4px',
                padding: '6px 12px',
                color: '#fff',
                fontSize: '12px',
              }}
            >
              <option value="all">All Statuses</option>
              <option value="queued">Queued</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {selectedJobIds.length > 0 && (
              <button
                onClick={handleBulkCancel}
                style={{
                  background: '#f44336',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '6px 12px',
                  fontWeight: 'bold',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Bulk Cancel ({selectedJobIds.length})
              </button>
            )}
          </div>

          {/* MAIN PANELS CONDITIONAL RENDER */}
          {activePanel === 'queue' && (
            <div>
              <h2 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#fff' }}>Delivery Queue</h2>
              {jobs.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#666', border: '1px dashed #333', borderRadius: '8px' }}>
                  No jobs found matching criteria. Submit a simulation on the left.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {jobs.map((job) => (
                    <DeliveryQueueCard
                      key={job.id}
                      job={job}
                      isSelected={selectedJobId === job.id}
                      isMultiSelected={selectedJobIds.includes(job.id)}
                      onClick={() => selectJob(job.id)}
                      onToggleSelect={(e) => {
                        e.stopPropagation();
                        toggleJobSelection(job.id);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activePanel === 'presets' && (
            <div>
              <h2 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#fff' }}>All Configured Profiles</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {presets.map((preset) => (
                  <div key={preset.id} style={{ background: '#1c1c1c', border: '1px solid #333', padding: '16px', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: '#fff' }}>
                      <span>{preset.name}</span>
                      <code style={{ fontSize: '11px', color: '#2196f3' }}>{preset.format}</code>
                    </div>
                    <p style={{ fontSize: '12px', color: '#aaa', margin: '8px 0 12px 0' }}>{preset.description}</p>
                    <div style={{ fontSize: '11px', color: '#888' }}>
                      <div>Codec: {preset.encodingProfile.videoCodec || 'Copy'}</div>
                      <div>Destinations: {preset.destinations.length} target(s)</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activePanel === 'destinations' && (
            <div>
              <h2 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#fff' }}>Configured Destinations</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { id: 'dest_local_default', name: 'Local Output Folder', type: 'local', config: { path: '/tmp/exports' } },
                  { id: 'dest_ftp_main', name: 'Secure Broadcast FTP', type: 'ftp_sftp', config: { host: 'sftp.broadcast.net' } },
                  { id: 'dest_aws_s3', name: 'Object Storage AWS S3', type: 'object_storage', config: { bucket: 'studio-deliveries' } },
                  { id: 'dest_yt_api', name: 'YouTube API publisher', type: 'social', config: { channelId: 'UC_broadway' } },
                ].map((d: any) => (
                  <DestinationCard key={d.id} destination={d} />
                ))}
              </div>
            </div>
          )}

          {activePanel === 'monitoring' && (
            <div>
              <h2 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#fff' }}>Active Network Monitoring</h2>
              <div style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', padding: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ background: '#252526', padding: '12px', borderRadius: '6px', textAlign: 'center' }}>
                    <span style={{ fontSize: '10px', color: '#888', display: 'block' }}>ESTIMATED BANDWIDTH</span>
                    <strong style={{ fontSize: '18px', color: '#2196f3' }}>5.0 MB/s</strong>
                  </div>
                  <div style={{ background: '#252526', padding: '12px', borderRadius: '6px', textAlign: 'center' }}>
                    <span style={{ fontSize: '10px', color: '#888', display: 'block' }}>AVG COMPILATION TIME</span>
                    <strong style={{ fontSize: '18px', color: '#4caf50' }}>1.2s</strong>
                  </div>
                  <div style={{ background: '#252526', padding: '12px', borderRadius: '6px', textAlign: 'center' }}>
                    <span style={{ fontSize: '10px', color: '#888', display: 'block' }}>RETRY SUCCESS RATE</span>
                    <strong style={{ fontSize: '18px', color: '#4caf50' }}>100%</strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL: INSPECTOR */}
        <div
          style={{
            background: '#181818',
            borderLeft: '1px solid #2d2d2d',
            padding: '16px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <h3 style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#aaa', textTransform: 'uppercase' }}>Selected Job Details</h3>

          {selectedJob ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: '#252526', padding: '12px', borderRadius: '6px', border: '1px solid #333' }}>
                <div style={{ fontSize: '11px', color: '#aaa' }}>Job ID</div>
                <code style={{ fontSize: '13px', fontWeight: 'bold' }}>{selectedJob.id}</code>
                <div style={{ fontSize: '11px', color: '#aaa', marginTop: '8px' }}>Project ID</div>
                <strong style={{ fontSize: '13px', color: '#fff' }}>{selectedJob.projectId}</strong>
              </div>

              {/* ENCODING PROFILE SUMMARY */}
              <div style={{ background: '#252526', padding: '12px', borderRadius: '6px', border: '1px solid #333' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#2196f3', textTransform: 'uppercase' }}>
                  ⚙️ Encoding & Codec Profiles
                </h4>
                {presets.find((p) => p.id === selectedJob.presetId) ? (
                  <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div>
                      Video Codec:{' '}
                      <strong style={{ color: '#fff' }}>
                        {presets.find((p) => p.id === selectedJob.presetId)?.encodingProfile.videoCodec || 'Copy'}
                      </strong>
                    </div>
                    <div>
                      Audio Codec:{' '}
                      <strong style={{ color: '#fff' }}>
                        {presets.find((p) => p.id === selectedJob.presetId)?.encodingProfile.audioCodec || 'Copy'}
                      </strong>
                    </div>
                    <div>
                      Resolution:{' '}
                      <strong style={{ color: '#fff' }}>
                        {presets.find((p) => p.id === selectedJob.presetId)?.encodingProfile.resolution
                          ? `${presets.find((p) => p.id === selectedJob.presetId)?.encodingProfile.resolution?.width}x${presets.find((p) => p.id === selectedJob.presetId)?.encodingProfile.resolution?.height}`
                          : 'Original'}
                      </strong>
                    </div>
                  </div>
                ) : (
                  <span style={{ fontSize: '11px', color: '#888' }}>No encoding parameters needed.</span>
                )}
              </div>

              {/* PACKAGING SETTINGS */}
              <div style={{ background: '#252526', padding: '12px', borderRadius: '6px', border: '1px solid #333' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#e91e63', textTransform: 'uppercase' }}>
                  📦 Packaging Settings
                </h4>
                {presets.find((p) => p.id === selectedJob.presetId)?.packagingProfile ? (
                  <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div>
                      Format:{' '}
                      <strong style={{ color: '#fff' }}>
                        {presets.find((p) => p.id === selectedJob.presetId)?.packagingProfile?.format.toUpperCase()}
                      </strong>
                    </div>
                    <div>
                      Segment Size:{' '}
                      <strong style={{ color: '#fff' }}>
                        {presets.find((p) => p.id === selectedJob.presetId)?.packagingProfile?.segmentDurationSeconds}s
                      </strong>
                    </div>
                  </div>
                ) : (
                  <span style={{ fontSize: '11px', color: '#888' }}>Plain wrapper file packaging.</span>
                )}
              </div>

              {/* QUALITY CONTROL SUMMARY */}
              <div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#ff9800', textTransform: 'uppercase' }}>
                  📊 Quality Control Audit
                </h4>
                <QualityReportCard report={selectedJob.qualityReport} />
              </div>

              {/* ESTIMATIONS CARD */}
              <div style={{ background: 'rgba(33, 150, 243, 0.1)', border: '1px solid rgba(33, 150, 243, 0.3)', padding: '12px', borderRadius: '6px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#90caf9', textTransform: 'uppercase' }}>
                  ⏱️ Real-time Estimations
                </h4>
                <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px', color: '#ccc' }}>
                  <div>Estimated Size: <strong>18.5 MB</strong></div>
                  <div>Estimated Processing Duration: <strong>1.5s</strong></div>
                  <div>Estimated Delivery ETA: <strong>3.7s</strong></div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ padding: '30px 10px', textAlign: 'center', color: '#666', border: '1px dashed #333', borderRadius: '6px' }}>
              Select a job from the queue to inspect details, encoding settings and QC scores.
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM CONSOLE & LOGS PANEL */}
      <div
        style={{
          background: '#141414',
          borderTop: '1px solid #2d2d2d',
          padding: '12px 20px',
          height: '160px',
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          gap: '20px',
        }}
      >
        {/* REAL-TIME EVENT BUS LOGS */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h4 style={{ margin: '0 0 6px 0', fontSize: '11px', color: '#aaa', textTransform: 'uppercase' }}>
            📡 Real-Time Delivery Event Console
          </h4>
          <div
            style={{
              flex: 1,
              background: '#090909',
              border: '1px solid #222',
              borderRadius: '4px',
              padding: '8px 12px',
              fontFamily: 'Monospace',
              fontSize: '11px',
              color: '#39ff14',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
            }}
          >
            {recentLogs.length === 0 ? (
              <span style={{ color: '#444' }}>Console idle. Submit a job to listen to EventBus telemetry...</span>
            ) : (
              recentLogs.map((log, idx) => <div key={idx}>{log}</div>)
            )}
          </div>
        </div>

        {/* COMPLIANCE SCORE METER */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h4 style={{ margin: '0 0 6px 0', fontSize: '11px', color: '#aaa', textTransform: 'uppercase' }}>
            Brand & Codec Safety Gauge
          </h4>
          <div
            style={{
              background: '#1e1e1e',
              border: '1px solid #2d2d2d',
              borderRadius: '6px',
              padding: '10px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#4caf50' }}>100% Secure</div>
            <div style={{ fontSize: '10px', color: '#888', marginTop: '2px' }}>
              All packaged output files strictly validated
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default DeliveryDashboard;
