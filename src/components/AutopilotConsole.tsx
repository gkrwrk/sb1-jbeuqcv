import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Play, Loader2, XCircle } from 'lucide-react';
import ClaudeService from '../services/claudeService';

const AutopilotConsole = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const claudeService = ClaudeService.getInstance();

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const appendOutput = (text: string) => {
    setOutput(prev => [...prev, text]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    setIsProcessing(true);
    setError(null);
    appendOutput(`> ${input}`);

    try {
      const apiKey = await claudeService.getApiKey();
      if (!apiKey) {
        throw new Error('Please set your API key in Settings first');
      }

      appendOutput('Starting Computer Use session...');
      const response = await claudeService.executeComputerUse(input);
      
      if (response.stop_reason === 'tool_use') {
        appendOutput('Executing automation...');
        await handleToolUse(response);
      }

      appendOutput('Task completed successfully');
      setInput('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      setError(message);
      appendOutput(`Error: ${message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToolUse = async (response: any) => {
    try {
      appendOutput('Processing tool action...');
      const toolResult = await executeToolAction(response.content);
      await claudeService.handleToolResponse(toolResult);
    } catch (error) {
      throw new Error('Failed to execute tool action');
    }
  };

  const executeToolAction = async (toolRequest: any): Promise<any> => {
    // Here we would implement the actual tool execution
    // For now, we'll simulate success
    return {
      success: true,
      output: 'Tool executed successfully',
      screenshot: 'base64_screenshot_data'
    };
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      <div className="flex items-center gap-2 p-3 border-b border-gray-800">
        <Terminal className="w-5 h-5 text-blue-400" />
        <span className="font-medium">Autopilot Console</span>
      </div>

      <div 
        ref={outputRef}
        className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-2"
      >
        {output.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap">{line}</div>
        ))}
        {error && (
          <div className="flex items-center gap-2 text-red-400">
            <XCircle className="w-4 h-4" />
            {error}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter a command for Claude..."
            className="flex-1 bg-gray-800 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isProcessing}
          />
          <button
            type="submit"
            disabled={isProcessing || !input.trim()}
            className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-4 rounded-lg flex items-center gap-2"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            Run
          </button>
        </div>
      </form>
    </div>
  );
};

export default AutopilotConsole;