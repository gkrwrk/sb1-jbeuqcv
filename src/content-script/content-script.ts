import React from 'react';
import { createRoot } from 'react-dom/client';
import App from '../App';

// Create container for the extension UI
function createContainer() {
  const container = document.createElement('div');
  container.id = 'autopilot-extension-root';
  container.style.position = 'fixed';
  container.style.bottom = '20px';
  container.style.right = '20px';
  container.style.zIndex = '2147483647';
  document.body.appendChild(container);
  return container;
}

// Initialize the extension UI
function initializeUI() {
  const container = createContainer();
  const root = createRoot(container);
  root.render(React.createElement(App));
}

// Wait for page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeUI);
} else {
  initializeUI();
}

// Handle messages from background script
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'TOGGLE_UI') {
    const container = document.getElementById('autopilot-extension-root');
    if (container) {
      container.style.display = container.style.display === 'none' ? 'block' : 'none';
    }
  }
});