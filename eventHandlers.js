// eventHandlers.js

// Import necessary modules
import { loadData, saveData, resetApp } from './dataManager.js';
import { showCurrentQuiz } from './quizManager.js';
import { showMainUserMenu, showSelectUserForm } from './uiRenderer.js';
import { state } from './state.js';
import { toggleSidebar } from './uiHelpers.js';

// Function to set up global event listeners
export function setupGlobalEventListeners() {
    // File input for loading data
    const loadFileInput = document.getElementById('load-file');
    loadFileInput.addEventListener('change', loadData);

    // Save button
    const saveButton = document.getElementById('save-button');
    saveButton.addEventListener('click', saveData);

    // Reset button
    const resetButton = document.getElementById('reset-button');
    resetButton.addEventListener('click', resetApp);

    // Hamburger button (if using a sidebar or mobile menu)
    const hamburgerButton = document.getElementById('hamburger-button');
    if (hamburgerButton) {
        hamburgerButton.addEventListener('click', toggleSidebar);
    }

    // Event listener for navigating to different sections (if applicable)
    // Example: navigation menu items
    // const navItems = document.querySelectorAll('.nav-item');
    // navItems.forEach(item => {
    //     item.addEventListener('click', (event) => {
    //         const section = event.target.getAttribute('data-section');
    //         navigateToSection(section);
    //     });
    // });

    // Handle quiz navigation if a quiz is in progress
    window.addEventListener('beforeunload', handleBeforeUnload);
}

// Function to handle actions before the window is unloaded
function handleBeforeUnload(event) {
    if (state.quizInProgress) {
        // Prompt the user if they are in the middle of a quiz
        event.preventDefault();
        event.returnValue = '';
    }
}
