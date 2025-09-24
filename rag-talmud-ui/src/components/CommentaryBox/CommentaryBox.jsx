// components/CommentaryBox/CommentaryBox.jsx
import React from 'react';
import { X, Award } from 'lucide-react';

const COMMENTARY_COLORS = [
  "bg-indigo-50 border-indigo-300",
  "bg-violet-50 border-violet-300", 
  "bg-cyan-50 border-cyan-300",
  "bg-emerald-50 border-emerald-300",
  "bg-rose-50 border-rose-300",
  "bg-amber-50 border-amber-300"
];

const GRADE_COLORS = {
  'A+': 'text-green-700 bg-green-100',
  'A': 'text-green-600 bg-green-50',
  'A-': 'text-green-500 bg-green-50',
  'B+': 'text-blue-600 bg-blue-50',
  'B': 'text-blue-500 bg-blue-50',
  'B-': 'text-blue-400 bg-blue-50',
  'C+': 'text-yellow-600 bg-yellow-50',
  'C': 'text-yellow-500 bg-yellow-50',
  'C-': 'text-orange-500 bg-orange-50',
  'D': 'text-red-500 bg-red-50',
  'F': 'text-red-600 bg-red-100'
};

const CommentaryBox = ({ 
  evalId, 
  commentaries, 
  colorIndex, 
  onDelete, 
  className = '',
  showDeleteButton = true 
}) => {
  const color = COMMENTARY_COLORS[colorIndex % COMMENTARY_COLORS.length];

  const handleDelete = () => {
    onDelete?.(evalId);
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
          title="Delete this commentary"
          aria-label={`Delete commentary ${evalId}`}
        >
          <X size={12} />
        </button>
      )}

      <div className="flex items-center gap-2 mb-2 pr-6">
        <Award size={14} className="text-indigo-600" />
        <h3 className="font-bold text-xs text-gray-800 border-b border-gray-300 pb-1 flex-1">
          Commentary: {evalId}
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {commentaries.map((commentary, i) => (
          <CommentaryItem key={commentary.id} commentary={commentary} />
        ))}
      </div>
    </div>
  );
};

const CommentaryItem = ({ commentary }) => {
  const gradeColorClass = GRADE_COLORS[commentary.grade] || 'text-gray-500 bg-gray-50';

  return (
    <div className="mb-3 last:mb-0">
      <div className="flex items-center justify-between mb-2">
        <span className={`px-2 py-1 rounded text-xs font-bold ${gradeColorClass}`}>
          {commentary.grade}
        </span>
        <span className="text-xs text-gray-600 font-medium">
          {commentary.criteria}
        </span>
      </div>
      
      <p className="mb-2 text-gray-700 leading-relaxed">{commentary.comment}</p>
      
      <p className="text-xs text-gray-500 italic">
        Evaluator: {commentary.evaluator}
      </p>
    </div>
  );
};

export default CommentaryBox;