import React, { useState, useEffect } from 'react';
import { Key, Loader2, CheckCircle, XCircle } from 'lucide-react';
import ClaudeService from '../services/claudeService';

const Settings = () => {
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const claudeService = ClaudeService.getInstance();

  useEffect(() => {
    loadApiKey();
  }, []);

  const loadApiKey = async () => {
    try {
      const key = await claudeService.getApiKey();
      if (key) {
        setApiKey(key);
        setIsValid(true);
      }
    } catch (error) {
      console.error('Failed to load API key:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsValidating(true);
    setError(null);

    try {
      const isValidKey = await claudeService.validateApiKey(apiKey);
      
      if (isValidKey) {
        await claudeService.setApiKey(apiKey);
        setIsValid(true);
      } else {
        setIsValid(false);
        setError('Invalid API key. Please check and try again.');
      }
    } catch (error) {
      setIsValid(false);
      setError(error instanceof Error ? error.message : 'Failed to validate API key');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="p-4 text-white">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Key className="w-5 h-5" />
        API Settings
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Anthropic API Key
          </label>
          <div className="relative">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-ant-api03-..."
              className="w-full bg-gray-800 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {isValid !== null && !isValidating && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {isValid ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
            )}
          </div>
          {error && (
            <p className="text-sm text-red-400 mt-1">{error}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isValidating || !apiKey}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg py-2 px-4 flex items-center justify-center gap-2"
        >
          {isValidating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Validating...
            </>
          ) : (
            'Save API Key'
          )}
        </button>
      </form>

      <div className="mt-6">
        <h3 className="text-sm font-medium mb-2">Getting Started</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-400">
          <li>Get your API key from <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Anthropic Console</a></li>
          <li>Enter your API key above and click Save</li>
          <li>Once validated, you can start using Claude's automation features</li>
        </ol>
      </div>
    </div>
  );
};

export default Settings;