import { WorkflowStep, WorkflowError } from '../types/workflow';
import { retryWithBackoff } from '../utils/retry';

let isRecording = false;
let isPlaying = false;
let currentTabId: number | null = null;
let playbackErrors: WorkflowError[] = [];

// Enhanced message handling
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  try {
    switch (message.type) {
      case 'START_RECORDING':
        await handleStartRecording();
        break;
      
      case 'STOP_RECORDING':
        await handleStopRecording();
        break;
      
      case 'START_PLAYBACK':
        if (!isPlaying && message.workflow) {
          await handleStartPlayback(message.workflow);
        }
        break;
      
      case 'STOP_PLAYBACK':
        await handleStopPlayback();
        break;
      
      case 'RECORD_STEP':
        if (isRecording) {
          await handleRecordStep(message.step);
        }
        break;
    }
  } catch (error) {
    console.error('Background worker error:', error);
    playbackErrors.push({
      timestamp: Date.now(),
      message: error.message,
      step: message.step
    });
    
    // Notify the UI of the error
    chrome.runtime.sendMessage({
      type: 'PLAYBACK_ERROR',
      error: {
        message: error.message,
        step: message.step
      }
    });
  }
});

async function handleStartRecording() {
  isRecording = true;
  playbackErrors = [];
  
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tabs[0]?.id) {
    currentTabId = tabs[0].id;
    await injectRecordingScript(currentTabId);
  }
}

async function handleStopRecording() {
  isRecording = false;
  currentTabId = null;
}

async function handleStartPlayback(workflow: { steps: WorkflowStep[] }) {
  isPlaying = true;
  playbackErrors = [];
  
  try {
    await playWorkflow(workflow);
  } catch (error) {
    console.error('Playback error:', error);
    isPlaying = false;
    throw error;
  }
}

async function handleStopPlayback() {
  isPlaying = false;
}

async function handleRecordStep(step: WorkflowStep) {
  const workflow = await chrome.storage.local.get(['currentWorkflow']);
  if (workflow.currentWorkflow) {
    const validatedStep = await validateStep(step);
    workflow.currentWorkflow.steps.push(validatedStep);
    await chrome.storage.local.set({ currentWorkflow: workflow.currentWorkflow });
  }
}

async function playWorkflow(workflow: { steps: WorkflowStep[] }) {
  const tab = await chrome.tabs.create({ url: 'about:blank' });
  if (!tab.id) throw new Error('Failed to create new tab');

  currentTabId = tab.id;
  let lastUrl: string | null = null;

  for (const step of workflow.steps) {
    if (!isPlaying) break;

    try {
      if (step.type === 'navigation' && step.url) {
        lastUrl = step.url;
        await navigateWithRetry(currentTabId, step.url);
      } else if (lastUrl) {
        await executeStepWithRetry(currentTabId, step);
      }

      // Report progress
      chrome.runtime.sendMessage({
        type: 'PLAYBACK_PROGRESS',
        step,
        total: workflow.steps.length
      });

      // Dynamic delay based on step type
      await sleep(calculateStepDelay(step));
    } catch (error) {
      playbackErrors.push({
        timestamp: Date.now(),
        message: error.message,
        step
      });

      // Decide whether to continue or stop based on error severity
      if (isFailureError(error)) {
        throw error;
      }
    }
  }

  isPlaying = false;
  
  // Report completion
  chrome.runtime.sendMessage({
    type: 'PLAYBACK_COMPLETE',
    errors: playbackErrors
  });
}

async function navigateWithRetry(tabId: number, url: string): Promise<void> {
  return retryWithBackoff(async () => {
    await chrome.tabs.update(tabId, { url });
    await waitForNavigation(tabId);
  }, {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 5000
  });
}

async function executeStepWithRetry(tabId: number, step: WorkflowStep): Promise<void> {
  return retryWithBackoff(async () => {
    await executeStep(tabId, step);
  }, {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 5000
  });
}

async function validateStep(step: WorkflowStep): Promise<WorkflowStep> {
  // Validate and enhance the step data
  const enhancedStep = { ...step };

  if (step.selector) {
    enhancedStep.selector = improveSelector(step.selector);
  }

  if (step.type === 'input' && step.value) {
    enhancedStep.value = sanitizeInput(step.value);
  }

  return enhancedStep;
}

function improveSelector(selector: string): string {
  // Enhance selector reliability
  return selector
    .replace(/\.[0-9]+/g, '') // Remove dynamic classes
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

function sanitizeInput(value: string): string {
  // Sanitize input values
  return value
    .replace(/[<>]/g, '') // Remove potential HTML
    .trim();
}

function calculateStepDelay(step: WorkflowStep): number {
  // Dynamic delay based on step type
  switch (step.type) {
    case 'navigation':
      return 2000;
    case 'input':
      return 500;
    case 'click':
      return 800;
    default:
      return 300;
  }
}

function isFailureError(error: Error): boolean {
  // Determine if error should stop playback
  const criticalErrors = [
    'Navigation failed',
    'Element not found',
    'Permission denied'
  ];
  
  return criticalErrors.some(msg => error.message.includes(msg));
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Export for testing
export const __testing = {
  validateStep,
  improveSelector,
  sanitizeInput,
  calculateStepDelay,
  isFailureError
};