class StorageService {
  private static instance: StorageService;
  private storageReady: Promise<void>;
  
  private constructor() {
    this.storageReady = this.initializeStorage();
  }

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  private async initializeStorage(): Promise<void> {
    if (this.isChromeExtension()) {
      return new Promise((resolve) => {
        chrome.runtime.onInstalled.addListener(() => resolve());
        if (chrome.runtime.id) {
          resolve();
        }
      });
    }
  }

  async get(key: string): Promise<any> {
    await this.storageReady;
    
    if (this.isChromeExtension()) {
      return new Promise((resolve) => {
        chrome.storage.local.get(key, (result) => {
          resolve(result[key]);
        });
      });
    } else {
      try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
      } catch (error) {
        console.error('Storage get error:', error);
        return null;
      }
    }
  }

  async set(key: string, value: any): Promise<void> {
    await this.storageReady;
    
    if (this.isChromeExtension()) {
      return new Promise((resolve, reject) => {
        chrome.storage.local.set({ [key]: value }, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve();
          }
        });
      });
    } else {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error('Storage set error:', error);
        throw error;
      }
    }
  }

  async remove(key: string): Promise<void> {
    await this.storageReady;
    
    if (this.isChromeExtension()) {
      return new Promise((resolve, reject) => {
        chrome.storage.local.remove(key, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve();
          }
        });
      });
    } else {
      localStorage.removeItem(key);
    }
  }

  async clear(): Promise<void> {
    await this.storageReady;
    
    if (this.isChromeExtension()) {
      return new Promise((resolve, reject) => {
        chrome.storage.local.clear(() => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve();
          }
        });
      });
    } else {
      localStorage.clear();
    }
  }

  private isChromeExtension(): boolean {
    return typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
  }
}

export default StorageService;