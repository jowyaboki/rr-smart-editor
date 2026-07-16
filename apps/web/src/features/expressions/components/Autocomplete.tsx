import React from 'react';

interface AutocompleteProps {
  suggestions: string[];
  selectedIndex: number;
  onSelect: (suggestion: string) => void;
  style?: React.CSSProperties;
}

export const Autocomplete: React.FC<AutocompleteProps> = ({
  suggestions,
  selectedIndex,
  onSelect,
  style,
}) => {
  if (suggestions.length === 0) return null;

  return (
    <div
      style={{
        position: 'absolute',
        backgroundColor: '#1e1e1e',
        border: '1px solid #333',
        borderRadius: '4px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
        zIndex: 1000,
        maxHeight: '150px',
        overflowY: 'auto',
        minWidth: '150px',
        ...style,
      }}
    >
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {suggestions.map((sug, idx) => (
          <li
            key={sug}
            onClick={() => onSelect(sug)}
            style={{
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: '13px',
              color: '#ccc',
              backgroundColor: idx === selectedIndex ? '#2d2d2d' : 'transparent',
              borderBottom: '1px solid #252525',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#2d2d2d';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              if (idx !== selectedIndex) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#ccc';
              }
            }}
          >
            {sug}
          </li>
        ))}
      </ul>
    </div>
  );
};
