// hooks/useRAGData.js
import { useState, useEffect } from 'react';
import { dataService } from '../services/dataService';
import { generateMockAnswer } from '../services/answerGenerator';

export const useRAGData = (dataSource = './data.json') => {
  const [content, setContent] = useState({
    query: "",
    snippets: {},
    answer: "",
    mockAnswers: {}
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, [dataSource]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await dataService.fetchData(dataSource);
      setContent(data);
    } catch (err) {
      setError(err.message);
      console.error('Error loading RAG data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateContent = (updates) => {
    setContent(prev => ({ ...prev, ...updates }));
  };

  const deleteSnippet = (refId) => {
    setContent(prev => {
      const newSnippets = { ...prev.snippets };
      delete newSnippets[refId];
      return { ...prev, snippets: newSnippets };
    });
  };

  const regenerateAnswer = async () => {
    try {
      const newAnswer = generateMockAnswer(content.snippets, content.mockAnswers);
      setContent(prev => ({ ...prev, answer: newAnswer }));
      return newAnswer;
    } catch (err) {
      setError('Failed to regenerate answer');
      throw err;
    }
  };

  return {
    content,
    isLoading,
    error,
    actions: {
      loadData,
      updateContent,
      deleteSnippet,
      regenerateAnswer
    }
  };
};