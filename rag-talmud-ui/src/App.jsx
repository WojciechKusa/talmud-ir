// App.jsx - Extended main application
import React, { useState } from 'react';
import ExtendedTalmudLayout from './components/ExtendedTalmudLayout';
import QuerySelector from './components/QuerySelector';
import ReferenceAdder from './components/ReferenceAdder';
import LoadingSpinner from './components/UI/LoadingSpinner';
import ErrorMessage from './components/UI/ErrorMessage';
import { useMultiQueryRAG } from './hooks/useMultiQueryRAG';

function App() {
  const { 
    allQueries, 
    currentQuery, 
    currentQueryId, 
    referencePool, 
    isLoading, 
    error, 
    actions 
  } = useMultiQueryRAG('./data.json');

  const [showReferenceAdder, setShowReferenceAdder] = useState(false);

  const handleAddReference = (refId, snippets) => {
    actions.addReference(refId, snippets);
    setShowReferenceAdder(false);
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <LoadingSpinner message="Loading RAG data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <ErrorMessage 
          message={error} 
          onRetry={actions.loadData}
        />
      </div>
    );
  }

  if (!currentQuery) {
    return (
      <div className="h-screen w-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">No queries available</p>
          <button 
            onClick={actions.loadData}
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded"
          >
            Reload Data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Top Controls */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-start">
        <QuerySelector
          queries={allQueries}
          currentQueryId={currentQueryId}
          onQueryChange={actions.switchQuery}
          className="max-w-md"
        />
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowReferenceAdder(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors shadow-sm"
          >
            Add Reference
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <ExtendedTalmudLayout
        currentQuery={currentQuery}
        onDeleteSnippet={actions.deleteSnippet}
        onDeleteCommentary={actions.deleteCommentary}
        onRegenerateAnswer={actions.regenerateAnswer}
        onUpdateQuery={actions.updateCurrentQuery}
      />

      {/* Reference Adder Modal */}
      {showReferenceAdder && (
        <ReferenceAdder
          referencePool={referencePool}
          currentQuery={currentQuery}
          onAddReference={handleAddReference}
          onClose={() => setShowReferenceAdder(false)}
        />
      )}
    </div>
  );
}

export default App;