// components/CenterPanel/CenterPanel.jsx
import React from 'react';
import { RefreshCw } from 'lucide-react';
import QueryBox from './QueryBox';
import AnswerBox from './AnswerBox';

const CenterPanel = ({ 
  content, 
  isRegenerating, 
  onRegenerateAnswer, 
  onUpdateQuery 
}) => {
  return (
    <div className="col-span-3 row-span-3 bg-white border-4 border-amber-300 flex flex-col rounded-lg shadow-sm">
      {/* Query Section */}
      <QueryBox 
        query={content.query}
        title={content.title}
        onUpdateQuery={onUpdateQuery}
      />
      
      {/* Answer Section */}
      <AnswerBox 
        answer={content.answer}
        isRegenerating={isRegenerating}
        onRegenerateAnswer={onRegenerateAnswer}
      />
    </div>
  );
};

export default CenterPanel;

// components/CenterPanel/QueryBox.jsx
import React from 'react';

const QueryBox = ({ query, title, onUpdateQuery }) => {
  return (
    <div className="p-4 border-b-2 border-amber-200">
      {title && (
        <h1 className="text-sm font-bold text-amber-700 mb-2 text-center">
          {title}
        </h1>
      )}
      <input
        type="text"
        value={query}
        onChange={(e) => onUpdateQuery?.({ query: e.target.value })}
        className="w-full bg-white border border-amber-300 p-3 rounded-md text-sm text-gray-900 shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        placeholder="Enter your query..."
      />
    </div>
  );
};

export default QueryBox;

// components/CenterPanel/AnswerBox.jsx
import React from 'react';
import { RefreshCw } from 'lucide-react';

const AnswerBox = ({ answer, isRegenerating, onRegenerateAnswer }) => {
  return (
    <div className="flex-1 p-4 flex flex-col">
      <div className="bg-amber-50 border border-amber-200 p-4 rounded text-sm text-gray-800 leading-relaxed overflow-y-auto flex-1 prose max-w-none custom-prose">
        {isRegenerating ? (
          <div className="flex items-center justify-center h-full text-amber-600 space-x-2">
            <RefreshCw size={20} className="animate-spin" />
            <span>Regenerating answer based on available snippets...</span>
          </div>
        ) : (
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: answer }}
          />
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end mt-4">
        <button
          onClick={onRegenerateAnswer}
          disabled={isRegenerating}
          className="bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300 text-white px-4 py-2 rounded text-sm flex items-center gap-2 transition-colors"
          title="Regenerate answer based on current snippets"
        >
          <RefreshCw size={16} className={isRegenerating ? "animate-spin" : ""} />
          {isRegenerating ? "Regenerating..." : "Regenerate"}
        </button>
      </div>
    </div>
  );
};

export { QueryBox, AnswerBox };