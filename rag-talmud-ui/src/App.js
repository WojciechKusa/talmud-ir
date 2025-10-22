import React, { useEffect, useState } from "react";
import HamburgerMenu from "./components/ui/HamburgerMenu";
import SampleSelector from "./components/ui/SampleSelector";
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

const GENERATION_COLORS = [
  "bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:from-purple-100 hover:to-purple-150",
];

function App() {
  const [data, setData] = useState({
    central_block_id: "",
    generations: [],
    snippets: [],
    commentaries: [],
    metrics: []
  });
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [samples, setSamples] = useState([]);
  const [selectedSampleId, setSelectedSampleId] = useState("");
  const [boldMetrics, setBoldMetrics] = useState(false);
  const [expandedCards, setExpandedCards] = useState({});
  const [showSelector, setShowSelector] = useState(false);
  const [hiddenCards, setHiddenCards] = useState({});

useEffect(() => {
    console.log("Attempting to fetch new.jsonl...");
    // Try multiple possible paths
    const possiblePaths = [
      `${process.env.PUBLIC_URL}/new.jsonl`,
      "/new.jsonl",
      "./new.jsonl"
    ];
    
    const tryFetch = async (paths) => {
      for (const path of paths) {
        try {
          console.log(`Trying path: ${path}`);
          const res = await fetch(path);
          if (res.ok) {
            const text = await res.text();
            // Check if it's actually JSON, not HTML
            if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
              console.error(`Path ${path} returned HTML instead of JSONL`);
              continue;
            }
            console.log("Success! Found the file at:", path);
            return text;
          }
        } catch (err) {
          console.error(`Failed to fetch from ${path}:`, err);
        }
      }
      throw new Error("Could not load new.jsonl from any path");
    };
    
    tryFetch(possiblePaths)
    tryFetch(possiblePaths)
      .then((text) => {
        console.log("File loaded, size:", text.length, "bytes");
        console.log("First 100 chars:", text.substring(0, 100));
        
        const lines = text.split('\n').filter(line => line.trim());
        console.log("Number of lines:", lines.length);
        
        const parsed = lines.map((line, idx) => {
          try {
            return JSON.parse(line);
          } catch (e) {
            console.error(`Failed to parse line ${idx}:`, line.substring(0, 50), e);
            return null;
          }
        }).filter(Boolean);
        
        console.log("Successfully parsed samples:", parsed.length);
        setSamples(parsed);
        
        if (parsed.length > 0) {
          console.log("First sample central_block_id:", parsed[0].central_block_id);
          setSelectedSampleId(parsed[0].central_block_id);
          setData(parsed[0]);
        }
      })
      .catch((err) => {
        console.error("FETCH FAILED - Error loading new.jsonl:", err);
        console.error("Make sure:");
        console.error("1. File is named exactly 'new.jsonl' (case sensitive)");
        console.error("2. File is in the public/ folder");
        console.error("3. Dev server was restarted after adding the file");
        
        // Fallback: use hardcoded sample data
        const fallbackData = {
          central_block_id: "gen_001",
          generations: [{
            query: "Sample Question",
            answer: "This is a sample answer. Make sure new.jsonl is in the public/ folder.",
            id: "gen_001",
            automated_metrics: {MAP: 0.75, Factuality: 0.8, Coherence: 0.9, Relevance: 0.85}
          }],
          snippets: [],
          commentaries: [],
          metrics: []
        };
        setSamples([fallbackData]);
        setSelectedSampleId("gen_001");
        setData(fallbackData);
      });
  }, []);

  useEffect(() => {
    if (!selectedSampleId || samples.length === 0) return;
    const sample = samples.find(s => s.central_block_id === selectedSampleId) || samples[0];
    if (sample) setData(sample);
  }, [selectedSampleId, samples]);

  const handleSampleChange = (event) => {
    setSelectedSampleId(event.target.value);
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

  const deleteSnippet = (snippetId) => {
    setData((prev) => ({
      ...prev,
      snippets: prev.snippets.filter(s => s.id !== snippetId)
    }));
  };

  const regenerateAnswer = async () => {
    setIsRegenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Find the central generation and randomize its metrics
    const centralItem = getCentralItem();
    if (centralItem && centralItem.automated_metrics) {
      const newMetrics = randomizeMetrics(centralItem.automated_metrics);
      
      setData((prev) => {
        const newGenerations = prev.generations.map(gen => 
          gen.id === centralItem.id 
            ? { ...gen, automated_metrics: newMetrics }
            : gen
        );
        return { ...prev, generations: newGenerations };
      });

      setBoldMetrics(true);
      setTimeout(() => setBoldMetrics(false), 3000);
    }

    setIsRegenerating(false);
  };

  // Get the central item based on central_block_id
  const getCentralItem = () => {
    const allItems = [
      ...data.generations,
      ...data.snippets,
      ...data.commentaries,
      ...data.metrics.map(m => ({ ...m, type: 'metrics' }))
    ];
    return allItems.find(item => item.id === data.central_block_id);
  };

  // Get all items except the central one for the surrounding cards
  const getSurroundingItems = () => {
    const allItems = [];
    
    // Add generations (except central)
    data.generations.forEach(gen => {
      if (gen.id !== data.central_block_id) {
        allItems.push({ type: "generation", data: gen, id: gen.id });
      }
    });

    // Add snippets (except central)
    data.snippets.forEach(snippet => {
      if (snippet.id !== data.central_block_id) {
        allItems.push({ type: "snippet", data: snippet, id: snippet.id });
      }
    });

    // Add commentaries (except central)
    data.commentaries.forEach(commentary => {
      if (commentary.id !== data.central_block_id) {
        allItems.push({ type: "commentary", data: commentary, id: commentary.id.toString() });
      }
    });

    // Add metrics (except central)
    data.metrics.forEach(metric => {
      if (metric.id !== data.central_block_id) {
        allItems.push({ type: "metrics", data: metric, id: metric.id });
      }
    });

    return allItems.filter(item => !hiddenCards[item.id]);
  };

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

  const surroundingItems = getSurroundingItems();
  const cardPositions = distributeCards(surroundingItems);
  const centralItem = getCentralItem();

  const renderCard = (entry, position) => {
    const isExpanded = expandedCards[entry.id];
    const isCompact = !isExpanded;
    
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
      return (
        <div
          key={entry.id}
          className={`${getCardClasses()} ${SNIPPET_COLORS[0]} p-3`}
          onClick={() => toggleCardExpansion(entry.id)}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1">
              <BookOpen size={14} className="text-blue-600" />
              <h4 className="font-bold text-xs text-gray-800">{entry.data.id}</h4>
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
                onClick={(e) => { e.stopPropagation(); deleteSnippet(entry.data.id); }}
                className="text-red-400 hover:text-red-600"
                title="Delete"
              >
                <X size={10} />
              </button>
            </div>
          </div>
          
          <div className="text-xs leading-relaxed">
            <p className="text-gray-700 mb-1">
              {isCompact ? `${entry.data.text.slice(0, 60)}...` : entry.data.text}
            </p>
            {isExpanded && (
              <div className="flex gap-2 text-xs text-gray-500 mb-2">
                <span className="bg-white/70 px-1 rounded text-xs">{entry.data.source}</span>
                <span className="bg-white/70 px-1 rounded text-xs">{entry.data.page}</span>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (entry.type === "commentary") {
      const gradeColor = entry.data.grade === 'A' || entry.data.grade === '5' ? 'text-green-600 bg-green-100' : 
                        entry.data.grade === 'B' || entry.data.grade === '4' ? 'text-blue-600 bg-blue-100' : 
                        'text-orange-600 bg-orange-100';
      
      return (
        <div
          key={entry.id}
          className={`${getCardClasses()} ${COMMENTARY_COLORS[0]} p-3`}
          onClick={() => toggleCardExpansion(entry.id)}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1">
              <MessageSquare size={14} className="text-emerald-600" />
              <h3 className="font-bold text-xs text-gray-800">Commentary</h3>
              {entry.data.grade && (
                <span className={`text-xs font-bold px-1 py-0.5 rounded-full ${gradeColor}`}>
                  {entry.data.grade}
                </span>
              )}
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
            {isCompact
              ? entry.data.comment.length > 100
                ? `${entry.data.comment.slice(0, 100)}...`
                : entry.data.comment
              : entry.data.comment}
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

    if (entry.type === "generation") {
      return (
        <div
          key={entry.id}
          className={`${getCardClasses()} ${GENERATION_COLORS[0]} p-3`}
          onClick={() => toggleCardExpansion(entry.id)}
        >
          <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1">
          <MessageSquare size={14} className="text-purple-600" />
          {isCompact && entry.data.query.length > 100 ? `${entry.data.query.slice(0, 100)}...` : entry.data.query}
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
            onClick={(e) => {
          e.stopPropagation();
          const originalColor = GENERATION_COLORS[0];
          const updatedGenerations = data.generations.map((gen) =>
            gen.id === entry.id ? { ...gen, highlight: true } : gen
          );
          setData((prev) => ({ ...prev, generations: updatedGenerations }));

          setTimeout(() => {
            const resetGenerations = data.generations.map((gen) =>
              gen.id === entry.id ? { ...gen, highlight: false } : gen
            );
            setData((prev) => ({ ...prev, generations: resetGenerations }));
          }, 2000);
            }}
            className="text-indigo-400 hover:text-indigo-600"
            title="Regenerate"
          >
            <RefreshCw size={10} />
          </button>
        </div>
          </div>
          
          <div
        className={`text-xs leading-relaxed ${
          entry.data.highlight ? "bg-white transition-colors duration-200" : ""
        }`}
          >
        <p className="text-gray-700">
          {isCompact ? `${entry.data.answer.slice(0, 80)}...` : entry.data.answer}
        </p>
          </div>
        </div>
      );
    }
  };

  const renderCentralContent = () => {
    if (!centralItem) {
      return <div className="text-gray-500 text-center">No central item found</div>;
    }

    if (centralItem.query !== undefined && centralItem.answer !== undefined) {
      // This is a generation
      return (
      <div className="h-full flex flex-col">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-4 flex items-center gap-2">
          <input
        type="text"
        value={centralItem.query}
        readOnly
        className="w-full bg-white/95 backdrop-blur-sm border-0 p-2 rounded-xl text-gray-900 shadow-inner font-medium text-base"
        placeholder="Enter your research question..."
        style={{ fontSize: "1rem" }}
          />
          {isRegenerating ? (
        <RefreshCw size={22} className="ml-2 text-indigo-600 animate-spin" />
          ) : (
        <button
          onClick={regenerateAnswer}
          className="ml-2 text-indigo-400 hover:text-indigo-600"
          title="Regenerate"
        >
          <RefreshCw size={22} />
        </button>
          )}
        </div>

        <div className="flex-1 p-6 flex flex-col overflow-hidden">
          <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 shadow-inner flex-1 overflow-y-auto min-h-[250px]">
        {isRegenerating ? (
          <div className="flex items-center justify-center h-full text-indigo-600 space-x-3">
            <RefreshCw size={28} className="animate-spin" />
            <span className="text-xl font-medium">Regenerating answer...</span>
          </div>
        ) : (
          <div
            className="prose prose-lg max-w-none text-gray-800 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: centralItem.answer }}
          />
        )}
          </div>
        </div>
      </div>
      );
        } else if (centralItem.text) {
      // This is a snippet
      return (
        <div className="h-full flex flex-col p-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 flex-1">
                <BookOpen size={20} className="text-blue-600" />
                {/* Only show the source/page fields in the footer, not here */}
              </div>
              <button
                onClick={() => regenerateAnswer()}
                className="text-indigo-400 hover:text-indigo-600"
                title="Regenerate"
              >
                <RefreshCw size={20} />
              </button>
            </div>
            {/* Editable text area takes all space */}
            <div className="flex-1 overflow-y-auto flex flex-col">
              <textarea
                value={centralItem.text}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    snippets: prev.snippets.map((snippet) =>
                      snippet.id === centralItem.id
                        ? { ...snippet, text: e.target.value }
                        : snippet
                    ),
                  }))
                }
                className="w-full h-full bg-white/95 backdrop-blur-sm border-0 p-2 rounded-xl text-gray-900 shadow-inner font-medium resize-none flex-1"
              />
            </div>
            {/* Footer with source and page */}
            <div className="flex gap-4 text-sm text-gray-600 mt-4">
              <input
                type="text"
                value={centralItem.source}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    snippets: prev.snippets.map((snippet) =>
                      snippet.id === centralItem.id
                        ? { ...snippet, source: e.target.value }
                        : snippet
                    ),
                  }))
                }
                className="bg-white/70 px-3 py-1 rounded-lg flex-1"
                placeholder="Source"
              />
              <input
                type="text"
                value={centralItem.page}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    snippets: prev.snippets.map((snippet) =>
                      snippet.id === centralItem.id
                        ? { ...snippet, page: e.target.value }
                        : snippet
                    ),
                  }))
                }
                className="bg-white/70 px-3 py-1 rounded-lg flex-1"
                placeholder="Page"
              />
            </div>
          </div>
        </div>
      );
    } else if (centralItem.comment) {
      // This is a commentary
      return (
        <div className="h-full flex flex-col p-6">
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl p-6 flex-1 overflow-y-auto">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare size={20} className="text-emerald-600" />
              <h2 className="text-xl font-bold text-gray-800">Commentary</h2>
              {centralItem.grade && (
                <span className="text-lg font-bold px-3 py-1 rounded-full bg-green-100 text-green-600">
                  {centralItem.grade}
                </span>
              )}
            </div>
            <p className="text-gray-800 leading-relaxed text-lg">{centralItem.comment}</p>
          </div>
        </div>
      );
    } else {
      // This is metrics or other type
      return (
        <div className="h-full flex flex-col p-6">
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-xl p-6 flex-1">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={20} className="text-amber-600" />
              <h2 className="text-xl font-bold text-gray-800">Metrics</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(centralItem).filter(([key]) => key !== 'id' && key !== 'type').map(([metric, value]) => (
                <div key={metric} className="bg-white/60 rounded-lg p-4 text-center">
                  <div className="text-sm text-gray-600 mb-1">{metric}</div>
                  <div className="text-2xl font-bold text-amber-700">
                    {typeof value === 'number' ? value.toFixed(2) : value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 overflow-hidden relative">
      
      {/* Hamburger Menu */}
      <div className="absolute top-4 right-4 z-20">
        <HamburgerMenu onClick={() => setShowSelector((prev) => !prev)} />
      </div>

      {/* Sample Selector */}
      {showSelector && (
        <SampleSelector
          samples={samples}
          selected={selectedSampleId}
          onChange={setSelectedSampleId}
          onClose={() => setShowSelector(false)}
        />
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
            {renderCentralContent()}
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