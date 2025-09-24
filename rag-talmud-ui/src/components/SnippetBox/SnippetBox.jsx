// components/SnippetBox/SnippetBox.jsx
import React from 'react';
import { X } from 'lucide-react';
import { COLORS } from '../../utils/constants';

const SnippetBox = ({ 
  refId, 
  snippets, 
  colorIndex, 
  onDelete, 
  className = '',
  showDeleteButton = true 
}) => {
  const color = COLORS[colorIndex % COLORS.length];

  const handleDelete = () => {
    onDelete?.(refId);
  };

  return (
    <div
      className={`${color} border-2 p-3 text-xs leading-tight h-full flex flex-col relative group ${className}`}
      style={{ fontSize: "11px", lineHeight: "1.3" }}
    >
      {showDeleteButton && (
        <button
          onClick={handleDelete}
          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 z-10"
          title="Delete this reference"
          aria-label={`Delete reference ${refId}`}
        >
          <X size={12} />
        </button>
      )}

      <h3 className="font-bold text-xs mb-2 text-gray-800 border-b border-gray-300 pb-1 pr-6">
        Reference: {refId}
      </h3>
      
      <div className="flex-1 overflow-y-auto">
        {snippets.map((snippet, i) => (
          <SnippetItem key={i} snippet={snippet} />
        ))}
      </div>
    </div>
  );
};

const SnippetItem = ({ snippet }) => (
  <div className="mb-2 last:mb-0">
    <p className="mb-1 text-gray-700">{snippet.text}</p>
    <p className="text-xs text-gray-500 italic">
      Source: {snippet.source}, Page: {snippet.page}
    </p>
  </div>
);

export default SnippetBox;