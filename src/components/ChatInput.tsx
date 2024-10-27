import React, { useState, useCallback } from 'react';
import { Bot, Send, Loader2 } from 'lucide-react';
import ClaudeService from '../services/claudeService';

const ChatInput = () => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const claudeService = ClaudeService.getInstance();

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const apiKey = await claudeService.getApiKey();
      if (!apiKey) {
        throw new Error('Please set your API key in Settings first');
      }

      const response = await claudeService.executeComputerUse(input);
      console.log('Claude response:', response);
      
      // Handle tool use response if needed
      if (response.stop_reason === 'tool_use') {
        // Implement tool execution logic here
        const toolResult = { success: true, result: 'Tool executed' };
        await claudeService.handleToolResponse(toolResult);
      }

      setInput('');
    } catch (error) {
      console.error('Chat error:', error);
      // Implement error handling UI
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading]);

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="absolute left-3 top-2.5">
        <Bot className="w-5 h-5 text-blue-500" />
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="What can I do for you?"
        className="w-full bg-gray-800 text-gray-100 pl-11 pr-12 py-2.5 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={!input.trim() || isLoading}
        className="absolute right-2 top-2 p-1 rounded-md hover:bg-gray-700 disabled:opacity-50"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
        ) : (
          <Send className="w-5 h-5 text-blue-500" />
        )}
      </button>
    </form>
  );
};

export default ChatInput;