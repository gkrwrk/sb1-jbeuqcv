import { WorkflowStep } from '../types/workflow';

class WorkflowRecorder {
  private static instance: WorkflowRecorder;
  private isRecording = false;

  private constructor() {
    this.setupEventListeners();
  }

  static getInstance(): WorkflowRecorder {
    if (!WorkflowRecorder.instance) {
      WorkflowRecorder.instance = new WorkflowRecorder();
    }
    return WorkflowRecorder.instance;
  }

  private setupEventListeners(): void {
    document.addEventListener('click', this.handleClick.bind(this), true);
    document.addEventListener('input', this.handleInput.bind(this), true);
    document.addEventListener('keypress', this.handleKeypress.bind(this), true);
    document.addEventListener('scroll', this.handleScroll.bind(this), true);
    
    // Monitor URL changes
    let lastUrl = window.location.href;
    new MutationObserver(() => {
      if (window.location.href !== lastUrl) {
        this.recordNavigation(window.location.href);
        lastUrl = window.location.href;
      }
    }).observe(document, { subtree: true, childList: true });
  }

  private handleClick(event: MouseEvent): void {
    if (!this.isRecording || !(event.target instanceof HTMLElement)) return;

    const step: WorkflowStep = {
      type: 'click',
      selector: this.getSelector(event.target),
      timestamp: Date.now()
    };

    this.recordStep(step);
  }

  private handleInput(event: Event): void {
    if (!this.isRecording || !(event.target instanceof HTMLElement)) return;

    const step: WorkflowStep = {
      type: 'input',
      selector: this.getSelector(event.target),
      value: (event.target as HTMLInputElement).value,
      timestamp: Date.now()
    };

    this.recordStep(step);
  }

  private handleKeypress(event: KeyboardEvent): void {
    if (!this.isRecording) return;

    const step: WorkflowStep = {
      type: 'keypress',
      value: event.key,
      timestamp: Date.now()
    };

    this.recordStep(step);
  }

  private handleScroll(event: Event): void {
    if (!this.isRecording) return;

    const step: WorkflowStep = {
      type: 'scroll',
      position: {
        x: window.scrollX,
        y: window.scrollY
      },
      timestamp: Date.now()
    };

    this.recordStep(step);
  }

  private recordNavigation(url: string): void {
    if (!this.isRecording) return;

    const step: WorkflowStep = {
      type: 'navigation',
      url,
      timestamp: Date.now()
    };

    this.recordStep(step);
  }

  private getSelector(element: HTMLElement): string {
    // Implement smart selector generation
    if (element.id) {
      return `#${element.id}`;
    }

    if (element.className) {
      const classes = element.className.split(' ')
        .filter(c => !c.match(/^[0-9]/)) // Filter out dynamic classes
        .join('.');
      if (classes) {
        return `.${classes}`;
      }
    }

    // Create a unique selector path
    const path = [];
    let current = element;
    while (current && current !== document.body) {
      let selector = current.tagName.toLowerCase();
      
      if (current.id) {
        selector = `#${current.id}`;
        path.unshift(selector);
        break;
      }
      
      const siblings = Array.from(current.parentElement?.children || [])
        .filter(el => el.tagName === current.tagName);
        
      if (siblings.length > 1) {
        const index = siblings.indexOf(current) + 1;
        selector += `:nth-child(${index})`;
      }
      
      path.unshift(selector);
      current = current.parentElement as HTMLElement;
    }
    
    return path.join(' > ');
  }

  private recordStep(step: WorkflowStep): void {
    chrome.runtime.sendMessage({
      type: 'RECORD_STEP',
      step
    });
  }

  startRecording(): void {
    this.isRecording = true;
  }

  stopRecording(): void {
    this.isRecording = false;
  }
}

// Initialize recorder
WorkflowRecorder.getInstance();