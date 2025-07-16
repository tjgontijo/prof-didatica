'use client';

import React from 'react';

interface FilterProps {
  tests: string[];
  selectedTest: string | null;
  onSelectTest: (testName: string) => void;
}

/**
 * Componente de filtro para seleção de testes A/B
 */
export function Filter({ tests, selectedTest, onSelectTest }: FilterProps): JSX.Element {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6 border border-gray-200">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Filtrar por teste:</h3>
      <div className="flex flex-wrap gap-2">
        {tests.map((testName) => (
          <button
            key={testName}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${selectedTest === testName ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            onClick={() => onSelectTest(testName)}
          >
            {testName}
          </button>
        ))}
        {tests.length > 1 && (
          <button
            className={`px-4 py-2 text-sm rounded-md transition-colors ${selectedTest === null ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            onClick={() => onSelectTest('')}
          >
            Todos os testes
          </button>
        )}
      </div>
    </div>
  );
}
