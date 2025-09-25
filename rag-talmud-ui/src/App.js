import React, { useEffect, useState } from "react";
import { X, RefreshCw, Eye, EyeOff, ChevronDown, ChevronUp, Star, ThumbsUp, ThumbsDown, BarChart3, BookOpen, MessageSquare, Minimize2, Maximize2 } from "lucide-react";

const SNIPPET_COLORS = [
  "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:from-blue-100 hover:to-blue-150",
];

const COMMENTARY_COLORS = [
  "bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 hover:from-emerald-100 hover:to-emerald-150",
];

const METRICS_COLORS = [
  "bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 hover:from-amber-100 hover:to-amber-150",
];

const OTHER_FIELDS_COLORS = [
  "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 hover:from-gray-100 hover:to-gray-150",
];

// Mock data for demonstration
function App() {
  const [content, setContent] = useState({
    query: "",
    answer: "",
    snippets: {},
    commentary: [],
    automated_metrics: undefined,
    mockAnswers: {}
  });
  const [isRegenerating, setIsRegenerating] = useState(false);

  const [samples, setSamples] = useState([]);
  const [selectedSampleId, setSelectedSampleId] = useState("");

  useEffect(() => {
    fetch("./data.jsonl")
      .then((res) => res.text())
      .then((text) => {
        const lines = text.split('\n').filter(Boolean);
        const parsed = lines.map(line => {
          try {
            return JSON.parse(line);
          } catch (e) {
            return null;
          }
        }).filter(Boolean);
        setSamples(parsed);
        if (parsed.length > 0) {
          setSelectedSampleId(parsed[0].sample_id);
          setContent(parsed[0]);
        }
      })
      .catch((err) => {
        console.error("Error loading data.jsonl:", err);
      });
  }, []);

  useEffect(() => {
    if (!selectedSampleId || samples.length === 0) return;
    const sample = samples.find(s => s.sample_id === selectedSampleId);
    if (sample) setContent(sample);
  }, [selectedSampleId, samples]);

  const handleSampleChange = (event) => {
    setSelectedSampleId(event.target.value);
  };

  const renderSampleSelector = () => (
    <div className="absolute top-4 right-4 bg-white p-2 rounded shadow-md">
      <label htmlFor="sample-select" className="block text-sm font-medium text-gray-700">
        Select Sample
      </label>
      <select
        id="sample-select"
        value={selectedSampleId}
        onChange={handleSampleChange}
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
      >
        {samples.map((sample) => (
          <option key={sample.sample_id} value={sample.sample_id}>
            {sample.sample_id}
          </option>
        ))}
      </select>
    </div>
  );
  const [boldMetrics, setBoldMetrics] = useState(false);
  const [expandedCards, setExpandedCards] = useState({});
  const [showSelector, setShowSelector] = useState(false);
  const [hiddenCards, setHiddenCards] = useState({});

  const generateMockAnswer = (remainingSnippets, mockAnswers) => {
    const snippetCount = Object.keys(remainingSnippets).length;
    if (snippetCount === 0) return mockAnswers["0"];
    if (snippetCount <= 2) return mockAnswers["1-2"];
    if (snippetCount === 3) return mockAnswers["3"];
    return mockAnswers["4+"];
  };

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

  const toggleCardExpansion = (cardId) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const toggleCardVisibility = (cardId) => {
    setHiddenCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const randomizeMetrics = (metrics) => {
    const randomized = {};
    for (const [key, value] of Object.entries(metrics)) {
      if (typeof value === "number") {
        const factor = 0.6 + Math.random() * 0.3;
        randomized[key] = Math.round(value * factor * 100) / 100;
      } else {
        randomized[key] = value;
      }
    }
    return randomized;
  };

  const regenerateAnswer = async () => {
    setIsRegenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const newAnswer = generateMockAnswer(content.snippets, content.mockAnswers);
    let newMetrics = content.automated_metrics
      ? randomizeMetrics(content.automated_metrics)
      : undefined;

    setContent((prev) => ({
      ...prev,
      answer: newAnswer,
      automated_metrics: newMetrics || prev.automated_metrics,
    }));

    if (newMetrics) {
      setBoldMetrics(true);
      setTimeout(() => setBoldMetrics(false), 3000);
    }

    setIsRegenerating(false);
  };

  // Create organized entries for Talmudic layout
  const snippetEntries = Object.entries(content.snippets || {}).map(
    ([refId, snippets]) => ({
      type: "snippet",
      refId,
      snippets,
      id: refId
    })
  );

  const commentaryEntries = (content.commentary || []).map((c) => ({
    type: "commentary",
    data: c,
    id: `commentary-${c.id}`
  }));

  const metricsEntry = content.automated_metrics
    ? [{
        type: "metrics",
        data: content.automated_metrics,
        id: "metrics"
      }]
    : [];

  const allEntries = [...snippetEntries, ...commentaryEntries, ...metricsEntry];
  const visibleEntries = allEntries.filter(entry => !hiddenCards[entry.id]);

  // Distribute cards around the center
  const distributeCards = (entries) => {
    const positions = ['top', 'right', 'bottom', 'left'];
    const distributed = { top: [], right: [], bottom: [], left: [] };
    
    entries.forEach((entry, index) => {
      const position = positions[index % positions.length];
      distributed[position].push(entry);
    });
    
    return distributed;
  };

  const cardPositions = distributeCards(visibleEntries);

  const renderCard = (entry, position) => {
    const isExpanded = expandedCards[entry.id];
    const isCompact = !isExpanded;
    
    // Determine size based on position and content
    const getCardClasses = () => {
      const base = "transition-all duration-500 hover:scale-105 hover:shadow-2xl backdrop-blur-sm border-2 rounded-xl shadow-lg relative group cursor-pointer";
      
      if (position === 'top' || position === 'bottom') {
        return `${base} ${isCompact ? 'h-24' : 'h-auto max-h-64'} overflow-hidden`;
      } else {
        return `${base} ${isCompact ? 'h-32' : 'h-auto max-h-80'} overflow-hidden`;
      }
    };
    
    if (entry.type === "metrics") {
      return (
        <div
          key={entry.id}
          className={`${getCardClasses()} ${METRICS_COLORS[0]} p-4`}
          onClick={() => toggleCardExpansion(entry.id)}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <BarChart3 size={16} className="text-amber-600" />
              <h3 className="font-bold text-sm text-gray-800">Metrics</h3>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => { e.stopPropagation(); toggleCardVisibility(entry.id); }}
                className="text-gray-400 hover:text-gray-600"
                title="Hide"
              >
                <EyeOff size={12} />
              </button>
              <button
                onClick={(e) => e.stopPropagation()}
                className="text-gray-400"
              >
                {isExpanded ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
              </button>
            </div>
          </div>
          
          {isCompact ? (
            <div className="flex justify-between text-xs">
              {Object.entries(entry.data).slice(0, 2).map(([metric, value]) => (
                <div key={metric} className="text-center">
                  <div className="text-gray-600">{metric}</div>
                  <div className={`font-bold text-amber-700 ${boldMetrics ? 'animate-pulse' : ''}`}>
                    {typeof value === 'number' ? value.toFixed(2) : value}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(entry.data).map(([metric, value]) => (
                <div key={metric} className="bg-white/60 rounded-lg p-2 text-center">
                  <div className="text-xs text-gray-600">{metric}</div>
                  <div className={`text-sm font-bold text-amber-700 ${boldMetrics ? 'animate-pulse scale-110' : ''}`}>
                    {typeof value === 'number' ? value.toFixed(2) : value}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (entry.type === "snippet") {
      const colorIndex = parseInt(entry.refId.split('_')[2] || '0') % SNIPPET_COLORS.length;
      const colorClass = SNIPPET_COLORS[colorIndex];
      
      return (
        <div
          key={entry.id}
          className={`${getCardClasses()} ${colorClass} p-3`}
          onClick={() => toggleCardExpansion(entry.id)}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1">
              <BookOpen size={14} className="text-blue-600" />
              <h4 className="font-bold text-xs text-gray-800">{entry.refId.replace('_', ' ')}</h4>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => { e.stopPropagation(); toggleCardVisibility(entry.id); }}
                className="text-gray-400 hover:text-gray-600"
                title="Hide"
              >
                <EyeOff size={10} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); deleteSnippet(entry.refId); }}
                className="text-red-400 hover:text-red-600"
                title="Delete"
              >
                <X size={10} />
              </button>
            </div>
          </div>
          
          <div className="text-xs leading-relaxed">
            {entry.snippets.map((snippet, i) => (
              <div key={i}>
                <p className="text-gray-700 mb-1">
                  {isCompact ? `${snippet.text.slice(0, 60)}...` : snippet.text}
                </p>
                {isExpanded && (
                  <div className="flex gap-2 text-xs text-gray-500 mb-2">
                    <span className="bg-white/70 px-1 rounded text-xs">{snippet.source}</span>
                    <span className="bg-white/70 px-1 rounded text-xs">p.{snippet.page}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (entry.type === "commentary") {
      const colorIndex = (entry.data.id - 1) % COMMENTARY_COLORS.length;
      const colorClass = COMMENTARY_COLORS[colorIndex];
      const gradeColor = entry.data.grade === 'A' ? 'text-green-600 bg-green-100' : 
                        entry.data.grade === 'B' ? 'text-blue-600 bg-blue-100' : 
                        'text-orange-600 bg-orange-100';
      
      return (
        <div
          key={entry.id}
          className={`${getCardClasses()} ${colorClass} p-3`}
          onClick={() => toggleCardExpansion(entry.id)}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1">
              <MessageSquare size={14} className="text-emerald-600" />
              <h3 className="font-bold text-xs text-gray-800">Commentary</h3>
              <span className={`text-xs font-bold px-1 py-0.5 rounded-full ${gradeColor}`}>
                {entry.data.grade}
              </span>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => { e.stopPropagation(); toggleCardVisibility(entry.id); }}
                className="text-gray-400 hover:text-gray-600"
                title="Hide"
              >
                <EyeOff size={10} />
              </button>
            </div>
          </div>
          
          <p className="text-xs text-gray-700 leading-relaxed mb-2">
            {isCompact ? `${entry.data.comment.slice(0, 80)}...` : entry.data.comment}
          </p>
          
          {isExpanded && (
            <div className="flex gap-1 pt-2 border-t border-gray-200">
              <button className="flex items-center gap-1 px-2 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded-full text-xs transition-colors">
                <ThumbsUp size={10} />
                <span className="hidden sm:inline">Helpful</span>
              </button>
              <button className="flex items-center gap-1 px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-full text-xs transition-colors">
                <ThumbsDown size={10} />
                <span className="hidden sm:inline">Not Helpful</span>
              </button>
            </div>
          )}
        </div>
      );
    }
  };

  const hiddenCount = Object.keys(hiddenCards).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 overflow-hidden relative">
      
      {/* Hamburger Menu */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={() => setShowSelector((prev) => !prev)}
          className="bg-white/80 backdrop-blur-md p-2 rounded-full shadow-md border border-gray-300 hover:bg-white transition-all"
        >
          <div className="flex flex-col gap-1">
            <span className="block w-5 h-0.5 bg-gray-700 rounded"></span>
            <span className="block w-5 h-0.5 bg-gray-700 rounded"></span>
            <span className="block w-5 h-0.5 bg-gray-700 rounded"></span>
          </div>
        </button>
      </div>

      {/* Sample Selector */}
        {showSelector && (
          <div className="absolute inset-0 bg-black/30 z-10 flex items-center justify-center">
            <div className="bg-white p-6 rounded-xl shadow-2xl border border-indigo-300">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Select Sample</h2>
          <select
            id="sample-select"
            value={selectedSampleId}
            onChange={(e) => setSelectedSampleId(e.target.value)}
            className="w-full px-4 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {samples.map((sample) => (
              <option key={sample.sample_id} value={sample.sample_id}>
            {sample.sample_id}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowSelector(false)}
            className="mt-4 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md shadow-md transition-all"
          >
            Apply Selection
          </button>
            </div>
          </div>
        )}

        {/* Talmudic Grid Layout */}
      <div className="h-screen grid grid-cols-12 grid-rows-12 gap-2 p-4">
        
        {/* Top Row - spanning across */}
        <div className="col-span-12 row-span-2 flex gap-2 overflow-x-auto">
          {cardPositions.top.map((entry) => renderCard(entry, 'top'))}
        </div>

        {/* Left Column */}
        <div className="col-span-3 row-span-8 flex flex-col gap-2 overflow-y-auto">
          {cardPositions.left.map((entry) => renderCard(entry, 'left'))}
        </div>

        {/* Central Content Area */}
        <div className="col-span-6 row-span-8 flex flex-col">
          <div className="bg-white/90 backdrop-blur-lg border-4 border-indigo-300 rounded-2xl shadow-2xl overflow-hidden h-full flex flex-col">
            {/* Query Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-4">
              <input
                type="text"
                value={content.query}
                readOnly
                className="w-full bg-white/95 backdrop-blur-sm border-0 p-3 rounded-xl text-gray-900 shadow-inner font-medium"
                placeholder="Enter your research question..."
              />
            </div>

            {/* Answer Content */}
            <div className="flex-1 p-6 flex flex-col overflow-hidden">
              <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 shadow-inner flex-1 overflow-y-auto">
                {isRegenerating ? (
                  <div className="flex items-center justify-center h-full text-indigo-600 space-x-3">
                    <RefreshCw size={28} className="animate-spin" />
                    <span className="text-xl font-medium">Regenerating answer...</span>
                  </div>
                ) : (
                  <div
                    className="prose prose-lg max-w-none text-gray-800 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: content.answer }}
                  />
                )}
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-medium">
                    {Object.keys(content.snippets).length} refs
                  </span>
                  {hiddenCount > 0 && (
                    <button
                      onClick={() => setHiddenCards({})}
                      className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full hover:bg-orange-200 transition-colors"
                    >
                      {hiddenCount} hidden • Show all
                    </button>
                  )}
                </div>
                
                <button
                  onClick={regenerateAnswer}
                  disabled={isRegenerating}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:scale-100"
                >
                  <RefreshCw size={18} className={isRegenerating ? "animate-spin" : ""} />
                  {isRegenerating ? "Regenerating..." : "Regenerate"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-span-3 row-span-8 flex flex-col gap-2 overflow-y-auto">
          {cardPositions.right.map((entry) => renderCard(entry, 'right'))}
        </div>

        {/* Bottom Row */}
        <div className="col-span-12 row-span-2 flex gap-2 overflow-x-auto">
          {cardPositions.bottom.map((entry) => renderCard(entry, 'bottom'))}
        </div>

      </div>
    </div>
  );
}

export default App;