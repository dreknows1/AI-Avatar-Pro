
import React from 'react';
import type { GenerationStatus } from '../types';

interface LoadingIndicatorProps {
  status: GenerationStatus;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ status }) => {
  return (
    <div className="w-full max-w-2xl text-center flex flex-col items-center">
      <div className="w-20 h-20 border-4 border-dashed rounded-full animate-spin border-purple-400"></div>
      <h2 className="text-2xl font-bold mt-6 mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
        Creation in Progress
      </h2>
      <p className="text-gray-300 mb-6">{status.message}</p>
      <div className="w-full bg-gray-700 rounded-full h-2.5">
        <div
          className="bg-gradient-to-r from-purple-500 to-cyan-500 h-2.5 rounded-full"
          style={{ width: `${status.progress}%`, transition: 'width 0.5s ease-in-out' }}
        ></div>
      </div>
    </div>
  );
};
