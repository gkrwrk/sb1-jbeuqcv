import { Tab } from '../types/workflow';

class TabManager {
  private static instance: TabManager;
  private activeTab: Tab | null = null;
  private tabHistory: Tab[] = [];

  private constructor() {
    this.setupTabListeners();
  }

  static getInstance(): TabManager {
    if (!TabManager.instance) {
      TabManager.instance = new TabManager();
    }
    return TabManager.instance;
  }

  private setupTabListeners(): void {
    chrome.tabs.onActivated.addListener(async (activeInfo) => {
      const tab = await chrome.tabs.get(activeInfo.tabId);
      this.handleTabChange(tab);
    });

    chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete') {
        this.handleTabChange(tab);
      }
    });
  }

  private handleTabChange(tab: chrome.tabs.Tab): void {
    if (!tab.id || !tab.url) return;

    const newTab: Tab = {
      id: tab.id,
      url: tab.url,
      title: tab.title || '',
      timestamp: Date.now()
    };

    this.activeTab = newTab;
    this.tabHistory.push(newTab);

    // Keep history limited to last 100 entries
    if (this.tabHistory.length > 100) {
      this.tabHistory.shift();
    }
  }

  async getCurrentTab(): Promise<Tab | null> {
    if (!this.activeTab) {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id && tab.url) {
        this.activeTab = {
          id: tab.id,
          url: tab.url,
          title: tab.title || '',
          timestamp: Date.now()
        };
      }
    }
    return this.activeTab;
  }

  getTabHistory(): Tab[] {
    return [...this.tabHistory];
  }

  async executeInTab(tabId: number, script: string): Promise<any> {
    return chrome.scripting.executeScript({
      target: { tabId },
      func: new Function(script) as () => void
    });
  }

  async waitForTabLoad(tabId: number): Promise<void> {
    return new Promise((resolve) => {
      const listener = (tid: number, changeInfo: chrome.tabs.TabChangeInfo) => {
        if (tid === tabId && changeInfo.status === 'complete') {
          chrome.tabs.onUpdated.removeListener(listener);
          resolve();
        }
      };
      chrome.tabs.onUpdated.addListener(listener);
    });
  }
}

export default TabManager;