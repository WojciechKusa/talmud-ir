// components/ReferenceAdder/ReferenceAdder.jsx
import React, { useState, useMemo } from 'react';
import { Plus, Search, Filter, X, Zap } from 'lucide-react';

const ReferenceAdder = ({ 
  referencePool, 
  currentQuery,
  onAddReference, 
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortBy, setSortBy] = useState('relevance'); // 'relevance', 'source', 'recent'

  // Filter and sort references
  const filteredReferences = useMemo(() => {
    let filtered = referencePool.filter(ref => {
      const matchesSearch = searchTerm === '' || 
        ref.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ref.source.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.every(tag => ref.tags?.includes(tag));
      
      return matchesSearch && matchesTags;
    });

    // Sort references
    filtered.sort((a, b) => {
      switch(sortBy) {
        case 'relevance':
          return (b.relevanceScore || 0) - (a.relevanceScore || 0);
        case 'source':
          return a.source.localeCompare(b.source);
        case 'recent':
          return a.id.localeCompare(b.id); // Assuming newer IDs are "more recent"
        default:
          return 0;
      }
    });

    return filtered;
  }, [referencePool, searchTerm, selectedTags, sortBy]);

  // Get all available tags
  const allTags = useMemo(() => {
    const tagSet = new Set();
    referencePool.forEach(ref => {
      ref.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [referencePool]);

  const handleAddReference = (reference) => {
    // Generate a new reference ID for the current query
    const existingRefs = Object.keys(currentQuery.snippets || {});
    const newRefId = `ref_added_${Date.now()}`;
    
    const newSnippet = {
      text: reference.text,
      source: reference.source,
      page: reference.page
    };

    onAddReference(newRefId, [newSnippet]);
    setIsOpen(false);
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTags([]);
    setSortBy('relevance');
  };

  if (!isOpen) {
    return (
      <div className={`${className}`}>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors shadow-sm"
          title="Add new reference from pool"
        >
          <Plus size={16} />
          Add Reference
        </button>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${className}`}>
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] m-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Plus size={20} />
            Add Reference from Pool
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search references..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="relevance">Sort by Relevance</option>
              <option value="source">Sort by Source</option>
              <option value="recent">Sort by Recent</option>
            </select>

            {/* Clear filters */}
            <button
              onClick={clearFilters}
              className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm transition-colors"
            >
              Clear
            </button>
          </div>

          {/* Tags */}
          <div className="mt-3">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600 flex items-center gap-1">
                <Filter size={14} />
                Tags:
              </span>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-2 py-1 rounded text-xs transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reference List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {filteredReferences.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No references match your criteria
              </div>
            ) : (
              filteredReferences.map((reference) => (
                <ReferenceCard
                  key={reference.id}
                  reference={reference}
                  onAdd={() => handleAddReference(reference)}
                />
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            Showing {filteredReferences.length} of {referencePool.length} references
          </div>
        </div>
      </div>
    </div>
  );
};

const ReferenceCard = ({ reference, onAdd }) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <p className="text-sm text-gray-800 mb-2 leading-relaxed">
            {reference.text}
          </p>
          
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Source: {reference.source}, {reference.page}
            </p>
            
            <div className="flex items-center gap-2">
              {reference.relevanceScore && (
                <div className="flex items-center gap-1 text-xs text-amber-600">
                  <Zap size={12} />
                  {(reference.relevanceScore * 100).toFixed(0)}% relevant
                </div>
              )}
              
              <div className="flex gap-1">
                {reference.tags?.slice(0, 3).map(tag => (
                  <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    {tag}
                  </span>
                ))}
                {reference.tags?.length > 3 && (
                  <span className="text-xs text-gray-500">+{reference.tags.length - 3}</span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <button
          onClick={onAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm flex items-center gap-1 transition-colors whitespace-nowrap"
        >
          <Plus size={14} />
          Add
        </button>
      </div>
    </div>
  );
};

export default ReferenceAdder;