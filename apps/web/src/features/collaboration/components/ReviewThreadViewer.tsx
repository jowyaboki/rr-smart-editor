import React, { useState } from 'react';
import { useReviewComments } from '../hooks/useReviewComments';

export const ReviewThreadViewer: React.FC = () => {
  const { comments, addComment } = useReviewComments();
  const [text, setText] = useState('');

  const handlePost = () => {
    if (!text.trim()) return;
    addComment('local-user', 'You', text);
    setText('');
  };

  return (
    <div style={{ padding: '12px', background: '#111', color: '#fff', border: '1px solid #333', borderRadius: '4px', marginTop: '12px' }}>
      <span style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
        Review Comments Thread
      </span>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto', marginBottom: '8px' }}>
        {comments.map((comment) => (
          <div key={comment.id} style={{ padding: '6px 8px', background: '#1a1a1a', borderRadius: '3px' }}>
            <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#888' }}>{comment.authorName}</div>
            <div style={{ fontSize: '11px', marginTop: '2px' }}>{comment.text}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '6px' }}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Reply to thread or @mention..."
          style={{ flex: 1, padding: '4px 8px', fontSize: '11px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '2px' }}
        />
        <button
          onClick={handlePost}
          style={{ padding: '4px 12px', fontSize: '11px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: '2px', cursor: 'pointer' }}
        >
          Post
        </button>
      </div>
    </div>
  );
};
export default ReviewThreadViewer;
