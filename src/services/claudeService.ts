import StorageService from './storageService';

class ClaudeService {
  private static instance: ClaudeService;
  private API_URL = 'https://api.anthropic.com/v1/messages';
  private API_KEY: string | null = null;
  private API_VERSION = '2023-06-01';
  private COMPUTER_USE_BETA = 'computer-use-2024-10-22';
  private storageService: StorageService;

  private constructor() {
    this.storageService = StorageService.getInstance();
    this.initializeApiKey();
  }

  static getInstance(): ClaudeService {
    if (!ClaudeService.instance) {
      ClaudeService.instance = new ClaudeService();
    }
    return ClaudeService.instance;
  }

  private async initializeApiKey(): Promise<void> {
    try {
      this.API_KEY = await this.storageService.get('claude_api_key');
    } catch (error) {
      console.error('Failed to initialize API key:', error);
    }
  }

  async setApiKey(key: string): Promise<void> {
    if (!key.startsWith('sk-ant-api03-')) {
      throw new Error('Invalid API key format');
    }

    try {
      const isValid = await this.validateApiKey(key);
      if (!isValid) {
        throw new Error('API key validation failed');
      }

      this.API_KEY = key;
      await this.storageService.set('claude_api_key', key);
    } catch (error) {
      console.error('Failed to set API key:', error);
      throw error;
    }
  }

  async getApiKey(): Promise<string | null> {
    return this.API_KEY;
  }

  private async validateApiKey(key: string): Promise<boolean> {
    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': this.API_VERSION
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'Test' }]
        })
      });

      return response.ok;
    } catch (error) {
      console.error('API Key validation error:', error);
      return false;
    }
  }

  async executeComputerUse(prompt: string): Promise<any> {
    if (!this.API_KEY) {
      throw new Error('API key not set');
    }

    const request = {
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1024,
      tools: [
        {
          type: 'computer_20241022',
          name: 'computer',
          display_width_px: 1024,
          display_height_px: 768,
          display_number: 1
        },
        {
          type: 'text_editor_20241022',
          name: 'str_replace_editor'
        },
        {
          type: 'bash_20241022',
          name: 'bash'
        }
      ],
      messages: [
        {
          role: 'user',
          content: `${prompt}\n\nPlease execute these steps and show me what you're doing. After each step, take a screenshot and verify the action was successful.`
        }
      ]
    };

    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.API_KEY,
          'anthropic-version': this.API_VERSION,
          'anthropic-beta': this.COMPUTER_USE_BETA
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'API request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Claude API Error:', error);
      throw error;
    }
  }

  async handleToolResponse(toolResult: any): Promise<any> {
    if (!this.API_KEY) {
      throw new Error('API key not set');
    }

    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.API_KEY,
          'anthropic-version': this.API_VERSION,
          'anthropic-beta': this.COMPUTER_USE_BETA
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 1024,
          messages: [
            {
              role: 'user',
              content: {
                type: 'tool_result',
                value: toolResult
              }
            }
          ]
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'API request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Claude API Error:', error);
      throw error;
    }
  }
}

export default ClaudeService;