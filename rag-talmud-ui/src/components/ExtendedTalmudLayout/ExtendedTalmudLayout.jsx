// components/ExtendedTalmudLayout/ExtendedTalmudLayout.jsx
import React, { useState } from 'react';
import SnippetBox from '../SnippetBox';
import CommentaryBox from '../CommentaryBox';
import CenterPanel from '../CenterPanel';
import { useLayoutDistribution } from '../../hooks/useLayoutDistribution';

const ExtendedTalmudLayout = ({ 
  currentQuery, 
  onDeleteSnippet, 
  onDeleteCommentary, 
  onRegenerateAnswer, 
  onUpdateQuery 
}) => {
  const [isRegenerating, setIsRegenerating] = useState(false);

  const distribution = useLayoutDistribution(
    currentQuery.snippets, 
    currentQuery.commentaries
  );

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Mock delay
      await onRegenerateAnswer();
    } finally {
      setIsRegenerating(false);
    }
  };

  const renderBox = (item) => {
    if (item.type === 'snippet') {
      return (
        <SnippetBox
          key={item.id}
          refId={item.id}
          snippets={item.data}
          colorIndex={item.colorIndex}
          onDelete={onDeleteSnippet}
        />
      );
    } else if (item.type === 'commentary') {
      return (
        <CommentaryBox
          key={item.id}
          evalId={item.id}
          commentaries={item.data}
          colorIndex={item.colorIndex}
          onDelete={onDeleteCommentary}
        />
      );
    }
    return null;
  };

  return (
    <div className="h-full w-full pt-32 pb-4 px-4">
      <div className="h-full w-full grid grid-cols-5 grid-rows-5 gap-1">
        
        {/* Empty corners */}
        <div className="col-span-1 row-span-1"></div>
        
        {/* Top boxes */}
        <div className="col-span-3 row-span-1 flex gap-1 overflow-hidden">
          {distribution.top.map(renderBox)}
        </div>
        
        <div className="col-span-1 row-span-1"></div>

        {/* Left boxes */}
        <div className="col-span-1 row-span-3 flex flex-col gap-1 overflow-hidden">
          {distribution.left.map(renderBox)}
        </div>

        {/* Center panel */}
        <CenterPanel
          content={currentQuery}
          isRegenerating={isRegenerating}
          onRegenerateAnswer={handleRegenerate}
          onUpdateQuery={onUpdateQuery}
        />

        {/* Right boxes */}
        <div className="col-span-1 row-span-3 flex flex-col gap-1 overflow-hidden">
          {distribution.right.map(renderBox)}
        </div>

        {/* Empty corners */}
        <div className="col-span-1 row-span-1"></div>
        
        {/* Bottom boxes */}
        <div className="col-span-3 row-span-1 flex gap-1 overflow-hidden">
          {distribution.bottom.map(renderBox)}
        </div>
        
        <div className="col-span-1 row-span-1"></div>
      </div>

      {/* Status Bar */}
      <div className="absolute bottom-4 right-4 bg-white/90 rounded-lg px-3 py-1 text-xs text-gray-600 shadow-sm">
        {distribution.snippetCount} references • {distribution.commentaryCount} evaluations
      </div>
    </div>
  );
};

export default ExtendedTalmudLayout;