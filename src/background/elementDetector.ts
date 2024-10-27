import { ElementInfo } from '../types/workflow';

class ElementDetector {
  private static instance: ElementDetector;

  private constructor() {}

  static getInstance(): ElementDetector {
    if (!ElementDetector.instance) {
      ElementDetector.instance = new ElementDetector();
    }
    return ElementDetector.instance;
  }

  generateSelector(element: HTMLElement): string {
    const selectors: string[] = [];
    
    // Try ID
    if (element.id) {
      selectors.push(`#${element.id}`);
    }

    // Try data attributes
    const dataAttrs = Array.from(element.attributes)
      .filter(attr => attr.name.startsWith('data-'))
      .map(attr => `[${attr.name}="${attr.value}"]`);
    
    if (dataAttrs.length) {
      selectors.push(...dataAttrs);
    }

    // Try classes
    const classes = Array.from(element.classList)
      .filter(cls => !cls.match(/^[0-9]/)) // Filter dynamic classes
      .join('.');
    
    if (classes) {
      selectors.push(`.${classes}`);
    }

    // Try aria labels
    if (element.getAttribute('aria-label')) {
      selectors.push(`[aria-label="${element.getAttribute('aria-label')}"]`);
    }

    // Try text content for buttons and links
    if (
      (element instanceof HTMLButtonElement || element instanceof HTMLAnchorElement) &&
      element.textContent?.trim()
    ) {
      selectors.push(
        `${element.tagName.toLowerCase()}:contains("${element.textContent.trim()}")`
      );
    }

    return this.validateSelectors(selectors);
  }

  private validateSelectors(selectors: string[]): string {
    // Test each selector's uniqueness and reliability
    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 1) {
        return selector;
      }
    }

    // Fallback to position-based selector
    return this.generatePositionalSelector(element);
  }

  private generatePositionalSelector(element: HTMLElement): string {
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

  async analyzeElement(element: HTMLElement): Promise<ElementInfo> {
    return {
      selector: this.generateSelector(element),
      tag: element.tagName.toLowerCase(),
      type: element.getAttribute('type') || '',
      visible: this.isVisible(element),
      clickable: this.isClickable(element),
      attributes: this.getRelevantAttributes(element),
      position: element.getBoundingClientRect().toJSON()
    };
  }

  private isVisible(element: HTMLElement): boolean {
    const style = window.getComputedStyle(element);
    return style.display !== 'none' &&
           style.visibility !== 'hidden' &&
           style.opacity !== '0' &&
           element.offsetWidth > 0 &&
           element.offsetHeight > 0;
  }

  private isClickable(element: HTMLElement): boolean {
    const clickableTypes = ['button', 'submit', 'reset', 'radio', 'checkbox'];
    return element instanceof HTMLButtonElement ||
           element instanceof HTMLAnchorElement ||
           element instanceof HTMLInputElement && clickableTypes.includes(element.type) ||
           element.onclick !== null ||
           element.getAttribute('role') === 'button';
  }

  private getRelevantAttributes(element: HTMLElement): Record<string, string> {
    const relevantAttrs = ['id', 'class', 'name', 'type', 'role', 'aria-label'];
    const attributes: Record<string, string> = {};

    for (const attr of relevantAttrs) {
      const value = element.getAttribute(attr);
      if (value) {
        attributes[attr] = value;
      }
    }

    return attributes;
  }
}

export default ElementDetector;