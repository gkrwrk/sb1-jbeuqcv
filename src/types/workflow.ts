export interface Tab {
  id: number;
  url: string;
  title: string;
  timestamp: number;
}

export interface ElementInfo {
  selector: string;
  tag: string;
  type: string;
  visible: boolean;
  clickable: boolean;
  attributes: Record<string, string>;
  position: DOMRect;
}

export interface WorkflowStep {
  type: 'click' | 'input' | 'navigation' | 'scroll' | 'keypress';
  selector?: string;
  value?: string;
  url?: string;
  timestamp: number;
  position?: { x: number; y: number };
  elementInfo?: ElementInfo;
  tabId?: number;
  frameId?: number;
  status?: 'pending' | 'success' | 'error';
  error?: string;
}

export interface WorkflowError {
  timestamp: number;
  message: string;
  step: WorkflowStep;
  details?: Record<string, any>;
}

export interface Workflow {
  id: string;
  name: string;
  steps: WorkflowStep[];
  createdAt: number;
  updatedAt: number;
  errors?: WorkflowError[];
  status?: 'active' | 'completed' | 'failed';
  lastRun?: number;
  successCount?: number;
  failureCount?: number;
}