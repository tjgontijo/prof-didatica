'use client';

import React from 'react';

type Test = {
  id: string;
  testId: string;
  name: string;
};

type TestSelectorProps = {
  tests: Test[];
  selectedTestId: string | null;
  onSelectTest: (testId: string) => void;
};

const TestSelector = ({ tests, selectedTestId, onSelectTest }: TestSelectorProps) => {
  return (
    <div className="flex items-center gap-1">
      <label htmlFor="test-select" className="text-xs font-medium text-gray-500 whitespace-nowrap">
        Teste:
      </label>
      <select
        id="test-select"
        value={selectedTestId || ''}
        onChange={(e) => onSelectTest(e.target.value)}
        className="text-sm border-0 py-1 pl-2 pr-8 focus:ring-0 focus:border-gray-300 rounded bg-gray-50"
      >
        {tests.map((test) => (
          <option key={test.id} value={test.id}>
            {test.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TestSelector;
