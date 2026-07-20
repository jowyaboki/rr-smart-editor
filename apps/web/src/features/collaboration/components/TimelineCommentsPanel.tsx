import React from 'react';
import { useReviewComments } from '../hooks/useReviewComments';

export const TimelineCommentsPanel: React.FC = () => {
  const { comments, resolveComment } = useReviewComments();

  return (
    <div style={{ padding: '12px', background: '#111', color: '#fff', border: '1px solid #333', borderRadius: '4px', marginTop: '12px' }}>
      <span style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
        Timeline Frame Feedback
      </span>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
        {comments.map((comment) => (
          <div
            key={comment.id}
            style={{
              padding: '8px',
              background: '#1a1a1a',
              border: `1px solid ${comment.resolved ? '#333' : '#444'}`,
              borderRadius: '3px',
              opacity: comment.resolved ? 0.5 : 1,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#1976d2' }}>{comment.authorName}</span>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                {comment.frame !== undefined && (
                  <span style={{ fontSize: '9px', color: '#888' }}>Frame {comment.frame}</span>
                )}
                {!comment.resolved && (
                  <button
                    onClick={() => resolveComment(comment.id)}
                    style={{ padding: '1px 4px', fontSize: '8px', background: '#2e7d32', color: '#fff', border: 'none', borderRadius: '2px', cursor: 'pointer' }}
                  >
                    Resolve
                  </button>
                )}
              </div>
            </div>
            <div style={{ fontSize: '11px' }}>{comment.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default TimelineCommentsPanel;
