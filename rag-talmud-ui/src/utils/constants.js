// utils/constants.js
export const COLORS = [
  "bg-red-50 border-red-200",
  "bg-green-50 border-green-200",
  "bg-blue-50 border-blue-200",
  "bg-yellow-50 border-yellow-200",
  "bg-purple-50 border-purple-200",
  "bg-pink-50 border-pink-200",
  "bg-teal-50 border-teal-200",
  "bg-orange-50 border-orange-200"
];

export const LAYOUT_CONFIG = {
  GRID_COLS: 5,
  GRID_ROWS: 5,
  CENTER_COL_SPAN: 3,
  CENTER_ROW_SPAN: 3,
  SNIPPET_POSITIONS: {
    TOP: 'top',
    BOTTOM: 'bottom',
    LEFT: 'left',
    RIGHT: 'right'
  }
};

export const ANIMATION_DELAYS = {
  REGENERATE_DELAY: 2000,
  TRANSITION_DURATION: 200
};

export const UI_STATES = {
  LOADING: 'loading',
  ERROR: 'error',
  SUCCESS: 'success',
  REGENERATING: 'regenerating'
};

// utils/snippetUtils.js
export const distributeSnippets = (snippetEntries) => {
  const positionedSnippets = snippetEntries.map(([refId, snippets], idx) => ({
    refId,
    snippets,
    colorIndex: idx
  }));

  const quarterLength = Math.ceil(positionedSnippets.length / 4);
  
  return {
    left: positionedSnippets.slice(0, quarterLength),
    top: positionedSnippets.slice(quarterLength, quarterLength * 2),
    right: positionedSnippets.slice(quarterLength * 2, quarterLength * 3),
    bottom: positionedSnippets.slice(quarterLength * 3)
  };
};

export const calculateSnippetStats = (snippets) => {
  const entries = Object.entries(snippets);
  const totalSnippets = entries.reduce((acc, [, snippetList]) => acc + snippetList.length, 0);
  const sourceCount = new Set(
    entries.flatMap(([, snippetList]) => 
      snippetList.map(snippet => snippet.source)
    )
  ).size;

  return {
    referenceCount: entries.length,
    totalSnippets,
    sourceCount
  };
};

// utils/layoutUtils.js
export const getGridPositions = (position, colSpan = 1, rowSpan = 1) => {
  const positions = {
    'top-left': { col: 1, row: 1 },
    'top-center': { col: 2, row: 1, colSpan: 3 },
    'top-right': { col: 5, row: 1 },
    'center-left': { col: 1, row: 2, rowSpan: 3 },
    'center': { col: 2, row: 2, colSpan: 3, rowSpan: 3 },
    'center-right': { col: 5, row: 2, rowSpan: 3 },
    'bottom-left': { col: 1, row: 5 },
    'bottom-center': { col: 2, row: 5, colSpan: 3 },
    'bottom-right': { col: 5, row: 5 }
  };

  return positions[position] || positions['center'];
};

export const generateGridClasses = (position, customSpans = {}) => {
  const pos = getGridPositions(position);
  const colSpan = customSpans.colSpan || pos.colSpan || 1;
  const rowSpan = customSpans.rowSpan || pos.rowSpan || 1;

  return `col-span-${colSpan} row-span-${rowSpan}`;
};