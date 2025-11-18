import { useState } from 'react';
import { useLocalStorage } from '../../lib/useLocalStorage';

export function AgentApiKeySettings() {
  const [apiKey, setApiKey] = useLocalStorage<string>('agent-api-key', '');
  const [showKey, setShowKey] = useState(false);
  const [tempKey, setTempKey] = useState(apiKey);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setApiKey(tempKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleClear = () => {
    setTempKey('');
    setApiKey('');
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="card p-6 max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        AI Agent API Key
      </h2>
      
      <p className="text-gray-600 mb-6">
        Configure your API key for the AI Study Session feature. This key is stored
        locally in your browser and is never sent to our servers.
      </p>

      <div className="space-y-4">
        <div>
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
            API Key
          </label>
          <div className="relative">
            <input
              id="apiKey"
              type={showKey ? 'text' : 'password'}
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              placeholder="Enter your API key"
              className="w-full px-4 py-2 pr-24 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-600 hover:text-gray-900 px-2 py-1"
            >
              {showKey ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {saved && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
            ✓ Settings saved successfully
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={!tempKey}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Save API Key
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            Clear
          </button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Where to get an API key:</h3>
          <p className="text-sm text-blue-800">
            Contact your administrator for access to the AI agent API. The endpoint
            is configured to: <code className="bg-blue-100 px-1.5 rounded text-xs">
              {import.meta.env.VITE_AGENT_ENDPOINT || 'http://ai-snow.reindeer-pinecone.ts.net:9292'}
            </code>
          </p>
        </div>
      </div>
    </div>
  );
}
