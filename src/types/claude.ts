export interface ClaudeResponse {
  id: string;
  type: string;
  role: string;
  content: any;
  model: string;
  stop_reason: string | null;
  stop_sequence: string | null;
}

export interface ComputerUseRequest {
  model: string;
  max_tokens: number;
  tools: Tool[];
  messages: Message[];
}

export interface Tool {
  type: string;
  name: string;
  display_width_px?: number;
  display_height_px?: number;
  display_number?: number;
}

export interface Message {
  role: string;
  content: string | ToolResult;
}

export interface ToolResult {
  type: string;
  value: any;
}