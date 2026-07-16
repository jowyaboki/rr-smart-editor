import React, { useState, useRef, useEffect } from 'react';
import { useExpressionStore } from '../store/expressionStore';
import { ValidationService } from '../services/ValidationService';
import { Autocomplete } from './Autocomplete';
import { ErrorPanel } from './ErrorPanel';
import { ReferenceBrowser } from './ReferenceBrowser';
import { FunctionBrowser } from './FunctionBrowser';
import { ExpressionError } from '@ai-video-editor/expression-engine';

interface ExpressionEditorProps {
  bindingId: string;
}

export const ExpressionEditor: React.FC<ExpressionEditorProps> = ({ bindingId }) => {
  const binding = useExpressionStore((state) => state.bindings[bindingId]);
  const setExpression = useExpressionStore((state) => state.setExpression);
  const toggleExpression = useExpressionStore((state) => state.toggleExpression);

  const [code, setCode] = useState('');
  const [error, setError] = useState<ExpressionError | null>(null);

  // Autocomplete state
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autocompleteWords = [
    'time', 'frame', 'fps', 'duration', 'layer', 'project', 'scene', 'composition', 'mouse',
    'clamp', 'lerp', 'ease', 'linear', 'random', 'noise', 'wiggle', 'smooth',
    'sin', 'cos', 'tan', 'min', 'max', 'abs', 'floor', 'ceil', 'round'
  ];

  useEffect(() => {
    if (binding) {
      setCode(binding.code);
      setError(binding.error);
    }
  }, [binding, bindingId]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setCode(val);

    if (binding) {
      setExpression(bindingId, val, binding.targetProperty, binding.targetNodeId);
    }

    // Run live compiler validation
    const err = ValidationService.validateExpression(val);
    setError(err);

    // Handle Autocomplete Suggestions Trigger
    const caret = e.target.selectionStart;
    const textBeforeCaret = val.slice(0, caret);
    const words = textBeforeCaret.split(/[\s+\-*/%^!?:,().[\]{}]/);
    const lastWord = words[words.length - 1];

    if (lastWord && lastWord.length >= 1) {
      const matches = autocompleteWords.filter((w) =>
        w.toLowerCase().startsWith(lastWord.toLowerCase()) && w.toLowerCase() !== lastWord.toLowerCase()
      );
      setSuggestions(matches);
      setSelectedIndex(0);

      // Simple calculation for dropdown placement
      const rect = e.target.getBoundingClientRect();
      const rows = textBeforeCaret.split('\n');
      const curRow = rows.length;
      const curCol = rows[rows.length - 1].length;
      setMenuStyle({
        top: `${30 + curRow * 18}px`,
        left: `${15 + curCol * 7}px`,
      });
    } else {
      setSuggestions([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % suggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertSuggestion(suggestions[selectedIndex]);
      } else if (e.key === 'Escape') {
        setSuggestions([]);
      }
    }
  };

  const insertSuggestion = (word: string) => {
    if (!textareaRef.current) return;
    const txt = textareaRef.current;
    const caret = txt.selectionStart;
    const textBeforeCaret = code.slice(0, caret);
    const words = textBeforeCaret.split(/[\s+\-*/%^!?:,().[\]{}]/);
    const lastWord = words[words.length - 1];

    const startPart = code.slice(0, caret - lastWord.length);
    const endPart = code.slice(caret);
    const newCode = startPart + word + endPart;

    setCode(newCode);
    setSuggestions([]);
    if (binding) {
      setExpression(bindingId, newCode, binding.targetProperty, binding.targetNodeId);
    }

    // Set focus back and place cursor
    setTimeout(() => {
      txt.focus();
      const newCaretPos = caret - lastWord.length + word.length;
      txt.setSelectionRange(newCaretPos, newCaretPos);
    }, 50);
  };

  const insertAtCursor = (value: string) => {
    if (!textareaRef.current) return;
    const txt = textareaRef.current;
    const caret = txt.selectionStart;
    const newCode = code.slice(0, caret) + value + code.slice(caret);

    setCode(newCode);
    if (binding) {
      setExpression(bindingId, newCode, binding.targetProperty, binding.targetNodeId);
    }

    // Highlight / focus
    setTimeout(() => {
      txt.focus();
      const newCursor = caret + value.length;
      txt.setSelectionRange(newCursor, newCursor);
    }, 50);
  };

  if (!binding) {
    return (
      <div style={{ color: '#888', padding: '20px', textAlign: 'center' }}>
        No expression binding selected.
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        backgroundColor: '#0f0f0f',
        padding: '20px',
        borderRadius: '8px',
        color: '#fff',
        border: '1px solid #222',
        maxWidth: '900px',
        margin: '0 auto',
      }}
    >
      {/* Header and Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #222',
          paddingBottom: '10px',
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
            Expression Editor for:{' '}
            <span style={{ color: '#00bcd4', fontFamily: 'monospace' }}>
              {binding.targetNodeId}.{binding.targetProperty}
            </span>
          </h2>
          <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
            Current Value: <span style={{ color: '#8bc34a', fontFamily: 'monospace' }}>{JSON.stringify(binding.lastValue)}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '12px', color: '#aaa', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={binding.enabled}
              onChange={(e) => toggleExpression(bindingId, e.target.checked)}
              style={{ marginRight: '6px' }}
            />
            Enable Expression
          </label>
        </div>
      </div>

      {/* Workspace split */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '20px' }}>
        {/* Editor text area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', position: 'relative' }}>
          <div style={{ fontSize: '12px', color: '#888' }}>Expression Code:</div>
          <div style={{ position: 'relative' }}>
            <textarea
              ref={textareaRef}
              value={code}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              style={{
                width: '100%',
                height: '180px',
                backgroundColor: '#161616',
                color: '#fff',
                border: '1px solid #333',
                borderRadius: '6px',
                padding: '12px',
                fontFamily: 'monospace',
                fontSize: '14px',
                lineHeight: '1.4',
                resize: 'vertical',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              placeholder="// Write your expression here (e.g. sin(time * 5) * 50)"
            />
            <Autocomplete
              suggestions={suggestions}
              selectedIndex={selectedIndex}
              onSelect={insertSuggestion}
              style={menuStyle}
            />
          </div>

          <ErrorPanel error={error} />
        </div>

        {/* Side panels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <ReferenceBrowser onInsert={insertAtCursor} />
          <FunctionBrowser onInsert={insertAtCursor} />
        </div>
      </div>
    </div>
  );
};
