import React, { useEffect, useState } from "react";
import data from "./data/data.json";

function App() {
  const [content, setContent] = useState({
    query: "",
    snippets: {},
    answer: ""
  });

  useEffect(() => {
    setContent(data);
  }, []);

  return (
    <div className="h-screen w-screen bg-gray-50 p-4">
      <div className="flex flex-wrap gap-4">
        {Object.entries(content.snippets || {}).map(([refId, snippets], idx) => (
          <div
            key={refId}
            className="bg-white shadow rounded p-4 m-2 flex-1 min-w-[300px] max-w-sm"
          >
            <h2 className="font-bold mb-2">Reference: {refId}</h2>
            {snippets.map((snippet, i) => (
              <div key={i} className="mb-4">
                <p className="mb-1">{snippet.text}</p>
                <p className="text-xs text-gray-500">
                  Source: {snippet.source}, Page: {snippet.page}
                </p>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="mt-8 bg-gray-100 p-4 rounded">
        <h1 className="text-xl font-bold mb-2">User Query</h1>
        <div className="bg-white p-2 rounded mb-4">{content.query}</div>
        <h2 className="text-lg font-semibold mb-1">Generated Answer</h2>
        <div className="bg-white p-2 rounded">{content.answer}</div>
      </div>
    </div>
  );
}

export default App;
