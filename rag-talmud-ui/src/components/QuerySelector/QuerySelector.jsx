// components/QuerySelector/QuerySelector.jsx
import React from 'react';
import { ChevronDown, FileText, MessageSquare, Award } from 'lucide-react';

const QuerySelector = ({ 
  queries, 
  currentQueryId, 
  onQueryChange,
  className = '' 
}) => {
  const currentQuery = queries.find(q => q.id === currentQueryId);
  
  const getQueryStats = (query) => {
    const snippetCount = Object.keys(query.snippets || {}).length;
    const commentaryCount = Object.keys(query.commentaries || {}).length;
    return { snippetCount, commentaryCount };
  };

  return (
    <div className={`relative ${className}`}>
      <div className="mb-4 bg-white border-2 border-amber-300 rounded-lg shadow-sm">
        <div className="p-3 border-b border-amber-200">
          <h2 className="text-sm font-bold text-amber-800 flex items-center gap-2">
            <FileText size={16} />
            Query Selection
          </h2>
        </div>
        
        <div className="p-3">
          <select 
            value={currentQueryId}
            onChange={(e) => onQueryChange(e.target.value)}
            className="w-full bg-white border border-amber-300 rounded px-3 py-2 text-sm text-gray-800 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            {queries.map((query) => {
              const stats = getQueryStats(query);
              return (
                <option key={query.id} value={query.id}>
                  {query.title} ({stats.snippetCount} refs, {stats.commentaryCount} evals)
                </option>
              );
            })}
          </select>
          
          {currentQuery && (
            <div className="mt-3 p-2 bg-amber-50 rounded text-xs">
              <div className="flex items-center gap-4 text-gray-600">
                <div className="flex items-center gap-1">
                  <MessageSquare size={12} />
                  <span>{getQueryStats(currentQuery).snippetCount} References</span>
                </div>
                <div className="flex items-center gap-1">
                  <Award size={12} />
                  <span>{getQueryStats(currentQuery).commentaryCount} Evaluations</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuerySelector;