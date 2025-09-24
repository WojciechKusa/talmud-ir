// hooks/useMultiQueryRAG.js - Extended hook for multiple queries
import { useState, useEffect } from 'react';
import { dataService } from '../services/dataService';
import { generateMockAnswer } from '../services/answerGenerator';

export const useMultiQueryRAG = (dataSource = './data.json') => {
  const [allQueries, setAllQueries] = useState([]);
  const [currentQueryId, setCurrentQueryId] = useState(null);
  const [referencePool, setReferencePool] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentQuery = allQueries.find(q => q.id === currentQueryId) || null;

  useEffect(() => {
    loadData();
  }, [dataSource]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await dataService.fetchExtendedData(dataSource);
      
      setAllQueries(data.queries || []);
      setReferencePool(data.referencePool || []);
      
      // Set first query as current if none selected
      if (data.queries && data.queries.length > 0) {
        setCurrentQueryId(data.queries[0].id);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error loading RAG data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const switchQuery = (queryId) => {
    setCurrentQueryId(queryId);
  };

  const updateCurrentQuery = (updates) => {
    if (!currentQueryId) return;
    
    setAllQueries(prev => prev.map(query => 
      query.id === currentQueryId 
        ? { ...query, ...updates }
        : query
    ));
  };

  const deleteSnippet = (refId) => {
    if (!currentQuery) return;
    
    const newSnippets = { ...currentQuery.snippets };
    delete newSnippets[refId];
    
    updateCurrentQuery({ snippets: newSnippets });
  };

  const deleteCommentary = (evalId) => {
    if (!currentQuery) return;
    
    const newCommentaries = { ...currentQuery.commentaries };
    delete newCommentaries[evalId];
    
    updateCurrentQuery({ commentaries: newCommentaries });
  };

  const addReference = (refId, snippets) => {
    if (!currentQuery) return;
    
    const newSnippets = {
      ...currentQuery.snippets,
      [refId]: snippets
    };
    
    updateCurrentQuery({ snippets: newSnippets });
  };

  const regenerateAnswer = async () => {
    if (!currentQuery) return;
    
    try {
      // In a real app, this would call your answer generation API
      await new Promise(resolve => setTimeout(resolve, 2000)); // Mock delay
      
      const newAnswer = generateMockAnswer(
        currentQuery.snippets, 
        currentQuery.mockAnswers || {}
      );
      
      updateCurrentQuery({ answer: newAnswer });
      return newAnswer;
    } catch (err) {
      setError('Failed to regenerate answer');
      throw err;
    }
  };

  return {
    // Data
    allQueries,
    currentQuery,
    currentQueryId,
    referencePool,
    isLoading,
    error,
    
    // Actions
    actions: {
      loadData,
      switchQuery,
      updateCurrentQuery,
      deleteSnippet,
      deleteCommentary,
      addReference,
      regenerateAnswer
    }
  };
};

// hooks/useLayoutDistribution.js - Hook for managing layout distribution
import { useMemo } from 'react';

export const useLayoutDistribution = (snippets, commentaries) => {
  return useMemo(() => {
    // Combine snippets and commentaries into a single array for distribution
    const snippetItems = Object.entries(snippets || {}).map(([id, data], index) => ({
      type: 'snippet',
      id,
      data,
      colorIndex: index
    }));

    const commentaryItems = Object.entries(commentaries || {}).map(([id, data], index) => ({
      type: 'commentary', 
      id,
      data,
      colorIndex: index
    }));

    // Shuffle them together for random distribution
    const allItems = [...snippetItems, ...commentaryItems];
    const shuffled = [...allItems].sort(() => Math.random() - 0.5);

    // Distribute into quarters
    const quarterLength = Math.ceil(shuffled.length / 4);
    
    return {
      left: shuffled.slice(0, quarterLength),
      top: shuffled.slice(quarterLength, quarterLength * 2),
      right: shuffled.slice(quarterLength * 2, quarterLength * 3),
      bottom: shuffled.slice(quarterLength * 3),
      total: shuffled.length,
      snippetCount: snippetItems.length,
      commentaryCount: commentaryItems.length
    };
  }, [snippets, commentaries]);
};

// hooks/useReferenceSearch.js - Hook for reference pool searching
import { useState, useMemo } from 'react';

export const useReferenceSearch = (referencePool) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortBy, setSortBy] = useState('relevance');

  const allTags = useMemo(() => {
    const tagSet = new Set();
    referencePool.forEach(ref => {
      ref.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [referencePool]);

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
          return a.id.localeCompare(b.id);
        default:
          return 0;
      }
    });

    return filtered;
  }, [referencePool, searchTerm, selectedTags, sortBy]);

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

  return {
    searchTerm,
    setSearchTerm,
    selectedTags,
    sortBy,
    setSortBy,
    allTags,
    filteredReferences,
    toggleTag,
    clearFilters
  };
};