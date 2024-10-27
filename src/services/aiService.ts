import { ChatMessage } from '../types/chat';

class AIService {
  private static instance: AIService;
  private API_URL = 'https://api.openai.com/v1/chat/completions';
  private API_KEY: string | null = null;

  private constructor() {}

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async setApiKey(key: string): Promise<void> {
    this.API_KEY = key;
    await chrome.storage.local.set({ openai_key: key });
  }

  async getApiKey(): Promise<string | null> {
    const result = await chrome.storage.local.get(['openai_key']);
    this.API_KEY = result.openai_key || null;
    return this.API_KEY;
  }

  async sendMessage(messages: ChatMessage[]): Promise<string> {
    if (!this.API_KEY) {
      throw new Error('API key not set');
    }

    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          temperature: 0.7,
          max_tokens: 150
        })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('AI Service Error:', error);
      throw error;
    }
  }
}

export default AIService;