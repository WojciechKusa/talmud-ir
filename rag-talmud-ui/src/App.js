import React, { useEffect, useState } from "react";
import data from "./data/data.json"; // works with CRA/Vite

function App() {
  const [content, setContent] = useState({
    query: "",
    leftCommentary: [],
    rightCommentary: [],
    references: []
  });

  useEffect(() => {
    setContent(data);
  }, []);

  return (
    <div className="h-screen w-screen bg-gray-50 p-4">
      <div className="grid grid-cols-12 grid-rows-12 gap-4 h-full">
        <div className="col-span-12 row-span-1 bg-yellow-100 p-2 text-center font-semibold">
          User Query Metadata
        </div>
        <div className="col-span-3 row-span-10 bg-green-100 p-2 overflow-y-auto text-sm">
          {content.leftCommentary.map((c, i) => (
            <p key={i}>{c}</p>
          ))}
        </div>
        <div className="col-span-6 row-span-10 bg-white shadow-lg p-4 overflow-y-auto">
          <h1 className="text-xl font-bold mb-2">User Query</h1>
          <div className="bg-gray-100 p-2 rounded mb-4">{content.query}</div>
          <h2 className="text-lg font-semibold">Generated Answer</h2>
          <p>This is where the system’s response will appear.</p>
        </div>
        <div className="col-span-3 row-span-10 bg-blue-100 p-2 overflow-y-auto text-sm">
          {content.rightCommentary.map((c, i) => (
            <p key={i}>{c}</p>
          ))}
        </div>
        <div className="col-span-12 row-span-1 bg-purple-100 p-2 text-center text-sm">
          {content.references.join(", ")}
        </div>
      </div>
    </div>
  );
}

export default App;
