import React from 'react';

interface ApiKeySelectorProps {
  onKeySelect: () => void;
}

export const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onKeySelect }) => {
  return (
    <div className="w-full max-w-2xl bg-gray-800/50 p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-700">
        <div className="text-center">
            <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 mb-3">
                API Key Required
            </h3>
            <p className="text-gray-300 mb-6">
                This application uses the <strong>Gemini 3 Pro</strong> image generation model for high-fidelity realism, which requires you to select a Google AI Studio API key. Your key will be used for all API requests.
            </p>
            <button
                onClick={onKeySelect}
                className="w-full sm:w-auto inline-block py-3 px-8 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500 transition-all duration-300 transform hover:scale-105"
            >
                Select API Key
            </button>
            <p className="text-sm text-gray-400 mt-6">
                Image generation using Pro models may incur billing charges. For more information, please see the{' '}
                <a 
                    href="https://ai.google.dev/gemini-api/docs/billing" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:underline"
                >
                    billing documentation
                </a>.
            </p>
        </div>
    </div>
  );
};
