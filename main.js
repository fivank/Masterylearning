// main.js

// Import modules
import { loadInitialData } from './dataManager.js';
import { showDashboard } from './uiRenderer.js';
import { setupGlobalEventListeners } from './eventHandlers.js';
import { disableAllButtons } from './uiHelpers.js';

// Initialize the application
async function initializeApp() {
    disableAllButtons();
    await loadInitialData();
    showDashboard();
    setupGlobalEventListeners();
}

// Event Listener for DOMContentLoaded
document.addEventListener('DOMContentLoaded', initializeApp);
