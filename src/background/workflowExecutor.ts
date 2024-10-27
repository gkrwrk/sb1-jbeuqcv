import { WorkflowStep, WorkflowError } from '../types/workflow';
import { retryWithBackoff } from '../utils/retry';

export class WorkflowExecutor {
  private static readonly TIMEOUT = 30000; // 30 seconds
  private static readonly POLLING_INTERVAL = 100; // 100ms

  static async executeStep(tabId: number, step: WorkflowStep): Promise<void> {
    const script = this.generateStepScript(step);
    
    try {
      await this.injectScript(tabId, script);
      await this.waitForExecution(tabId, step);
    } catch (error) {
      throw this.enhanceError(error, step);
    }
  }

  private static generateStepScript(step: WorkflowStep): string {
    switch (step.type) {
      case 'click':
        return this.generateClickScript(step);
      case 'input':
        return this.generateInputScript(step);
      case 'scroll':
        return this.generateScrollScript(step);
      case 'keypress':
        return this.generateKeypressScript(step);
      default:
        throw new Error(`Unsupported step type: ${step.type}`);
    }
  }

  private static generateClickScript(step: WorkflowStep): string {
    return `
      (function() {
        const element = document.querySelector('${step.selector}');
        if (!element) throw new Error('Element not found');
        
        const rect = element.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
          throw new Error('Element is not visible');
        }
        
        element.click();
        return true;
      })();
    `;
  }

  private static generateInputScript(step: WorkflowStep): string {
    return `
      (function() {
        const element = document.querySelector('${step.selector}');
        if (!element) throw new Error('Element not found');
        if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)) {
          throw new Error('Element is not an input field');
        }
        
        element.value = '${step.value}';
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      })();
    `;
  }

  private static generateScrollScript(step: WorkflowStep): string {
    return `
      window.scrollTo({
        top: ${step.position?.y || 0},
        left: ${step.position?.x || 0},
        behavior: 'smooth'
      });
    `;
  }

  private static generateKeypressScript(step: WorkflowStep): string {
    return `
      document.activeElement?.dispatchEvent(
        new KeyboardEvent('keypress', {
          key: '${step.value}',
          bubbles: true
        })
      );
    `;
  }

  private static async injectScript(tabId: number, script: string): Promise<any> {
    return retryWithBackoff(
      () => chrome.scripting.executeScript({
        target: { tabId },
        func: new Function(script) as () => void
      }),
      {
        maxAttempts: 3,
        initialDelay: 1000,
        maxDelay: 5000
      }
    );
  }

  private static async waitForExecution(tabId: number, step: WorkflowStep): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < this.TIMEOUT) {
      const result = await this.checkStepCompletion(tabId, step);
      if (result) return;
      
      await new Promise(resolve => setTimeout(resolve, this.POLLING_INTERVAL));
    }
    
    throw new Error('Step execution timed out');
  }

  private static async checkStepCompletion(tabId: number, step: WorkflowStep): Promise<boolean> {
    // Implement step-specific completion checks
    return true; // Placeholder
  }

  private static enhanceError(error: Error, step: WorkflowStep): WorkflowError {
    return {
      message: error.message,
      step,
      timestamp: Date.now(),
      details: {
        type: step.type,
        selector: step.selector,
        url: step.url
      }
    };
  }
}