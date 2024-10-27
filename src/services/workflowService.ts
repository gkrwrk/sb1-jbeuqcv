import { Workflow, WorkflowStep } from '../types/workflow';

class WorkflowService {
  private static instance: WorkflowService;
  private currentWorkflow: Workflow | null = null;
  private isRecording = false;
  private isPlaying = false;

  private constructor() {}

  static getInstance(): WorkflowService {
    if (!WorkflowService.instance) {
      WorkflowService.instance = new WorkflowService();
    }
    return WorkflowService.instance;
  }

  async startRecording(workflowName: string): Promise<void> {
    if (typeof chrome === 'undefined' || !chrome.runtime) {
      console.warn('Chrome runtime not available - running in development mode');
      return;
    }

    try {
      this.isRecording = true;
      this.currentWorkflow = {
        id: crypto.randomUUID(),
        name: workflowName,
        steps: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      await chrome.storage.local.set({ currentWorkflow: this.currentWorkflow });
      chrome.runtime.sendMessage({ type: 'START_RECORDING' });
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }

  async stopRecording(): Promise<Workflow | null> {
    if (typeof chrome === 'undefined' || !chrome.runtime) {
      console.warn('Chrome runtime not available - running in development mode');
      return null;
    }

    try {
      this.isRecording = false;
      const workflow = this.currentWorkflow;
      
      if (workflow) {
        const savedWorkflows = await this.getSavedWorkflows();
        savedWorkflows.push(workflow);
        await chrome.storage.local.set({ savedWorkflows });
        this.currentWorkflow = null;
        await chrome.storage.local.remove('currentWorkflow');
      }
      
      chrome.runtime.sendMessage({ type: 'STOP_RECORDING' });
      return workflow;
    } catch (error) {
      console.error('Error stopping recording:', error);
      throw error;
    }
  }

  async playWorkflow(workflow: Workflow): Promise<void> {
    if (typeof chrome === 'undefined' || !chrome.runtime) {
      console.warn('Chrome runtime not available - running in development mode');
      return;
    }

    if (this.isPlaying || this.isRecording) return;
    
    try {
      this.isPlaying = true;
      await chrome.storage.local.set({ playingWorkflow: workflow });
      chrome.runtime.sendMessage({ 
        type: 'START_PLAYBACK',
        workflow 
      });
    } catch (error) {
      console.error('Error playing workflow:', error);
      throw error;
    }
  }

  async getSavedWorkflows(): Promise<Workflow[]> {
    if (typeof chrome === 'undefined' || !chrome.runtime) {
      console.warn('Chrome runtime not available - running in development mode');
      return [];
    }

    try {
      const result = await chrome.storage.local.get('savedWorkflows');
      return result.savedWorkflows || [];
    } catch (error) {
      console.error('Error getting saved workflows:', error);
      return [];
    }
  }

  async deleteWorkflow(workflowId: string): Promise<void> {
    if (typeof chrome === 'undefined' || !chrome.runtime) {
      console.warn('Chrome runtime not available - running in development mode');
      return;
    }

    try {
      const workflows = await this.getSavedWorkflows();
      const updatedWorkflows = workflows.filter(w => w.id !== workflowId);
      await chrome.storage.local.set({ savedWorkflows: updatedWorkflows });
    } catch (error) {
      console.error('Error deleting workflow:', error);
      throw error;
    }
  }
}

export default WorkflowService;