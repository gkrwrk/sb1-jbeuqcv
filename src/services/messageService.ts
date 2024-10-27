class MessageService {
  private static instance: MessageService;
  
  private constructor() {}

  static getInstance(): MessageService {
    if (!MessageService.instance) {
      MessageService.instance = new MessageService();
    }
    return MessageService.instance;
  }

  sendMessage(message: any): void {
    if (this.isChromeExtension()) {
      chrome.runtime.sendMessage(message);
    } else {
      console.log('Development mode - Message:', message);
    }
  }

  private isChromeExtension(): boolean {
    return typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
  }
}

export default MessageService;