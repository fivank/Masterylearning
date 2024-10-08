// uiHelpers.js

// Function to show messages to the user
export function showMessage(message, type) {
    const messageBox = document.getElementById('message-box');
    messageBox.textContent = message;
    messageBox.className = `message ${type}`;
    messageBox.style.display = 'block';

    // Accessibility: Focus on message box for screen readers
    messageBox.setAttribute('tabindex', '-1');
    messageBox.focus();

    setTimeout(() => {
        messageBox.style.display = 'none';
        messageBox.removeAttribute('tabindex');
    }, 5000);
}

// Function to set focus to the first focusable element
export function setFocus(element) {
    const focusable = element.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable.length) {
        focusable[0].focus();
    } else {
        element.focus();
    }
}

// Function to disable all buttons at the start
export function disableAllButtons() {
    const saveButton = document.getElementById('save-button');
    saveButton.disabled = true;
    saveButton.setAttribute('aria-disabled', 'true');
}

// Function to enable buttons after data has been loaded
export function enableButtonsAfterLoad() {
    const saveButton = document.getElementById('save-button');
    saveButton.disabled = false;
    saveButton.setAttribute('aria-disabled', 'false');
}

// Function to toggle the sidebar (if applicable)
export function toggleSidebar() {
    // Sidebar functionality removed or not implemented
}
