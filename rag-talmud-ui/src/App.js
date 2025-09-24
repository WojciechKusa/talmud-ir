import React, { useEffect, useState } from "react";
import { X, RefreshCw } from "lucide-react";

const SNIPPET_COLORS = [
  "bg-blue-50 border-blue-200",
];

const COMMENTARY_COLORS = [
  "bg-teal-50 border-teal-200"
];

// Helper to generate mock answers
const generateMockAnswer = (remainingSnippets, mockAnswers) => {
  const snippetCount = Object.keys(remainingSnippets).length;

  if (snippetCount === 0) return mockAnswers["0"];
  if (snippetCount <= 2) return mockAnswers["1-2"];
  if (snippetCount === 3) return mockAnswers["3"];
  return mockAnswers["4+"];
};

function App() {
  const [content, setContent] = useState({
    query: "",
    snippets: {},
    answer: ""
  });
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Load data.json from public folder
  useEffect(() => {
    fetch("./data.json")
      .then((res) => res.json())
      .then((data) => {
        setContent(data);
      })
      .catch((err) => {
        console.error("Error loading data.json:", err);
      });
  }, []);

  const deleteSnippet = (refId) => {
    setContent((prev) => {
      const newSnippets = { ...prev.snippets };
      delete newSnippets[refId];
      return {
        ...prev,
        snippets: newSnippets
      };
    });
  };

  const regenerateAnswer = async () => {
    setIsRegenerating(true);

    // Mock API delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const newAnswer = generateMockAnswer(content.snippets, content.mockAnswers);
    setContent((prev) => ({
      ...prev,
      answer: newAnswer
    }));

    setIsRegenerating(false);
  };

const snippetEntries = Object.entries(content.snippets || {}).map(
  ([refId, snippets]) => ({
    type: "snippet",
    refId,
    snippets
  })
);

const commentaryEntries = (content.commentary || []).map((c) => ({
  type: "commentary",
  data: c
}));

// Merge and shuffle
const mergedEntries = [...snippetEntries, ...commentaryEntries].sort(
  () => Math.random() - 0.5
);

// Assign colors
const positionedEntries = mergedEntries.map((entry, idx) => {
  if (entry.type === "snippet") {
    return {
      ...entry,
      color: SNIPPET_COLORS[idx % SNIPPET_COLORS.length]
    };
  }
  return {
    ...entry,
    color: COMMENTARY_COLORS[idx % COMMENTARY_COLORS.length]
  };
});

const leftEntries = positionedEntries.slice(0, Math.ceil(positionedEntries.length / 4));
const topEntries = positionedEntries.slice(Math.ceil(positionedEntries.length / 4), Math.ceil(positionedEntries.length / 2));
const rightEntries = positionedEntries.slice(Math.ceil(positionedEntries.length / 2), Math.ceil(3 * positionedEntries.length / 4));
const bottomEntries = positionedEntries.slice(Math.ceil(3 * positionedEntries.length / 4));

const renderBox = (entry) => {
  if (entry.type === "snippet") {
    return (
      <div
        key={entry.refId}
        className={`${entry.color} border-2 p-3 text-xs leading-tight h-full flex flex-col relative group`}
        style={{ fontSize: "11px", lineHeight: "1.3" }}
      >
        <button
          onClick={() => deleteSnippet(entry.refId)}
          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 z-10"
          title="Delete this reference"
        >
          <X size={12} />
        </button>

        <h3 className="font-bold text-xs mb-2 text-gray-800 border-b border-gray-300 pb-1 pr-6">
          Reference: {entry.refId}
        </h3>
        <div className="flex-1 overflow-y-auto">
          {entry.snippets.map((snippet, i) => (
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
  }

  if (entry.type === "commentary") {
    return (
      <div
        key={`commentary-${entry.data.id}`}
        className={`${entry.color} border-2 p-3 text-xs leading-tight h-full flex flex-col`}
        style={{ fontSize: "11px", lineHeight: "1.3" }}
      >
        <h3 className="font-bold text-xs mb-2 text-gray-800 border-b border-gray-300 pb-1">
          Commentary (Grade {entry.data.grade})
        </h3>
        <div className="flex-1 overflow-y-auto">
          <p className="text-gray-700">{entry.data.comment}</p>
        </div>
      </div>
    );
  }
};

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden">
      <div className="h-full w-full grid grid-cols-5 grid-rows-5 gap-0 p-4">
        <div className="col-span-1 row-span-1"></div>
        <div className="col-span-3 row-span-1 flex gap-1">{topEntries.map(renderBox)}</div>
        <div className="col-span-1 row-span-1"></div>

        <div className="col-span-1 row-span-3 flex flex-col gap-1">{leftEntries.map(renderBox)}</div>

<div className="col-span-3 row-span-3 bg-white border-4 border-amber-300 flex flex-col rounded-lg shadow-sm">
  {/* Query Box */}
  <div className="p-4 border-b-2 border-amber-200">
    <input
      type="text"
      value={content.query}
      // disabled
      className="w-full bg-white border border-amber-300 p-3 rounded-md text-sm text-gray-900 shadow-sm"
    />
  </div>

{/* Answer Box */}
<div className="flex-1 p-4 flex flex-col">
  <div className="bg-amber-50 border border-amber-200 p-4 rounded text-sm text-gray-800 leading-relaxed overflow-y-auto flex-1 prose max-w-none custom-prose">
    {isRegenerating ? (
      <div className="flex items-center justify-center h-full text-amber-600 space-x-2">
        <RefreshCw size={20} className="animate-spin" />
        <span>Regenerating answer based on available snippets...</span>
      </div>
    ) : (
      <div
        className="prose max-w-none custom-prose"
        dangerouslySetInnerHTML={{ __html: content.answer }}
      />
    )}
  </div>

  {/* Actions */}
  <div className="flex items-center justify-end mt-4">
    <button
      onClick={regenerateAnswer}
      disabled={isRegenerating}
      className="bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300 text-white px-4 py-2 rounded text-sm flex items-center gap-2 transition-colors"
      title="Regenerate answer based on current snippets"
    >
      <RefreshCw size={16} className={isRegenerating ? "animate-spin" : ""} />
      {isRegenerating ? "Regenerating..." : "Regenerate"}
    </button>
  </div>
</div>

</div>


        <div className="col-span-1 row-span-3 flex flex-col gap-1">{rightEntries.map(renderBox)}</div>

        <div className="col-span-1 row-span-1"></div>
        <div className="col-span-3 row-span-1 flex gap-1">{bottomEntries.map(renderBox)}</div>
        <div className="col-span-1 row-span-1"></div>
      </div>
    </div>
  );
}

export default App;
