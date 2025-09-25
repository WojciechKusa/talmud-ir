import React from "react";

function SampleSelector({ samples, selected, onChange, onClose }) {
  return (
    <div className="absolute inset-0 bg-black/30 z-10 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl shadow-2xl border border-indigo-300 w-80">
        
        {/* Title */}
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          Select Sample
        </h2>

        {/* Dropdown */}
        <select
          id="sample-select"
          value={selected}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-2 text-base border border-gray-300 rounded-md 
                     focus:outline-none focus:ring-2 focus:ring-indigo-500 
                     focus:border-indigo-500"
        >
          {samples.map((sample) => (
            <option key={sample.sample_id} value={sample.sample_id}>
              {sample.sample_id}
            </option>
          ))}
        </select>

        {/* Action button */}
        <button
          onClick={onClose}
          className="mt-4 w-full bg-indigo-500 hover:bg-indigo-600 
                     text-white px-4 py-2 rounded-md shadow-md transition-all"
        >
          Apply Selection
        </button>
      </div>
    </div>
  );
}

export default SampleSelector;