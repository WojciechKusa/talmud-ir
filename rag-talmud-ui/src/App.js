import React, { useEffect, useState } from "react";
import data from "./data/data.json";


const COLORS = [
  "bg-red-50 border-red-200",
  "bg-green-50 border-green-200", 
  "bg-blue-50 border-blue-200",
  "bg-yellow-50 border-yellow-200",
  "bg-purple-50 border-purple-200",
  "bg-pink-50 border-pink-200",
  "bg-teal-50 border-teal-200",
  "bg-orange-50 border-orange-200"
];

function App() {
  const [content, setContent] = useState({
    query: "",
    snippets: {},
    answer: ""
  });

  useEffect(() => {
    setContent(data);
  }, []);

  const snippetEntries = Object.entries(content.snippets || {});
  
  // Create positioned snippets for Talmud-style layout
  const positionedSnippets = snippetEntries.map(([refId, snippets], idx) => ({
    refId,
    snippets,
    color: COLORS[idx % COLORS.length]
  }));

  // Split snippets into different sides
  const leftSnippets = positionedSnippets.slice(0, Math.ceil(positionedSnippets.length / 4));
  const topSnippets = positionedSnippets.slice(Math.ceil(positionedSnippets.length / 4), Math.ceil(positionedSnippets.length / 2));
  const rightSnippets = positionedSnippets.slice(Math.ceil(positionedSnippets.length / 2), Math.ceil(3 * positionedSnippets.length / 4));
  const bottomSnippets = positionedSnippets.slice(Math.ceil(3 * positionedSnippets.length / 4));

  const renderSnippetBox = ({ refId, snippets, color }) => (
    <div
      key={refId}
      className={`${color} border-2 p-3 text-xs leading-tight h-full flex flex-col`}
      style={{
        fontSize: '11px',
        lineHeight: '1.3'
      }}
    >
      <h3 className="font-bold text-xs mb-2 text-gray-800 border-b border-gray-300 pb-1">
        Reference: {refId}
      </h3>
      <div className="flex-1 overflow-y-auto">
        {snippets.map((snippet, i) => (
          <div key={i} className="mb-2 last:mb-0">
            <p className="mb-1 text-gray-700">{snippet.text}</p>
            <p className="text-xs text-gray-500 italic">
              Source: {snippet.source}, Page: {snippet.page}
            </p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden">
      {/* Main Talmud-style grid layout */}
      <div className="h-full w-full grid grid-cols-5 grid-rows-5 gap-0 p-4">
        
        {/* Top row */}
        <div className="col-span-1 row-span-1"></div>
        <div className="col-span-3 row-span-1 flex gap-1">
          {topSnippets.map(renderSnippetBox)}
        </div>
        <div className="col-span-1 row-span-1"></div>
        
        {/* Middle rows */}
        <div className="col-span-1 row-span-3 flex flex-col gap-1">
          {leftSnippets.map(renderSnippetBox)}
        </div>
        
        {/* Center - Main content */}
        <div className="col-span-3 row-span-3 bg-white border-4 border-amber-300 flex flex-col">
          {/* Query section */}
          <div className="flex-1 p-4 border-b-2 border-amber-200">
            <h1 className="text-lg font-bold mb-3 text-center text-amber-800 border-b border-amber-300 pb-2">
              User Query
            </h1>
            <div className="bg-amber-50 border border-amber-200 p-3 rounded text-sm text-gray-800 text-center leading-relaxed">
              {content.query}
            </div>
          </div>
          
          {/* Answer section */}
          <div className="flex-1 p-4">
<div
  className="bg-amber-50 border border-amber-200 p-3 rounded text-sm text-gray-800 leading-relaxed overflow-y-auto h-full"
  dangerouslySetInnerHTML={{ __html: content.answer }}
></div>
          </div>
        </div>
        
        <div className="col-span-1 row-span-3 flex flex-col gap-1">
          {rightSnippets.map(renderSnippetBox)}
        </div>
        
        {/* Bottom row */}
        <div className="col-span-1 row-span-1"></div>
        <div className="col-span-3 row-span-1 flex gap-1">
          {bottomSnippets.map(renderSnippetBox)}
        </div>
        <div className="col-span-1 row-span-1"></div>
        
      </div>
    </div>
  );
}

export default App;