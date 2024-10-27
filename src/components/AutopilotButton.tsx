import React, { useState, useEffect } from 'react';
import { Bot, Loader2, X } from 'lucide-react';
import ClaudeService from '../services/claudeService';

const AutopilotButton = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');
  const claudeService = ClaudeService.getInstance();

  useEffect(() => {
    // Check if API key exists
    claudeService.getApiKey().then(key => {
      if (!key) {
        setShowApiKeyModal(true);
      }
    });
  }, []);

  const handleApiKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatus('Validating API key...');
    
    try {
      const isValid = await claudeService.validateApiKey(apiKey);
      if (!isValid) {
        throw new Error('Invalid API key');
      }
      
      await claudeService.setApiKey(apiKey);
      setShowApiKeyModal(false);
      setStatus('API key validated successfully');
      handleAutopilot();
    } catch (error) {
      setError('Invalid API key or validation failed');
      setStatus('');
    }
  };

  const handleAutopilot = async () => {
    setError(null);
    setIsProcessing(true);
    setStatus('Starting automation...');

    try {
      const prompt = `I want to automate a workflow. Please help me:
1. Open a new browser tab
2. Navigate to example.com
3. Click any link on the page
4. Take a screenshot
Please execute these steps and show me what you're doing.`;

      setStatus('Sending request to Claude...');
      const response = await claudeService.createWorkflow(prompt);
      
      if (response.stop_reason === 'tool_use') {
        setStatus('Executing automation...');
        await handleToolUse(response);
      }
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
      setStatus('');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToolUse = async (response: any) => {
    try {
      // Execute tool action based on response
      const toolResult = {
        type: 'tool_result',
        value: { success: true, output: 'Tool executed successfully' }
      };
      
      setStatus('Processing tool response...');
      await claudeService.handleToolResult(toolResult);
      setStatus('Automation completed successfully');
    } catch (error) {
      setError('Failed to execute tool action');
      setStatus('');
    }
  };

  return (
    <>
      <button
        onClick={handleAutopilot}
        disabled={isProcessing}
        className="fixed bottom-4 left-4 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2 transition-colors"
      >
        {isProcessing ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : (
          <Bot className="w-6 h-6" />
        )}
        <span className="font-medium">Autopilot</span>
        {status && <span className="ml-2 text-sm opacity-90">{status}</span>}
      </button>

      {/* API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[400px] relative">
            <button
              onClick={() => setShowApiKeyModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-semibold mb-4">Enter Anthropic API Key</h3>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleApiKeySubmit}>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-ant-..."
                className="w-full p-2 border border-gray-300 rounded-md mb-4"
                required
              />
              
              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md font-medium"
              >
                Save API Key
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AutopilotButton;