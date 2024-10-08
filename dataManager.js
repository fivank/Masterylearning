// dataManager.js

// Import necessary modules
import { state } from './state.js';
import { showMessage, enableButtonsAfterLoad, disableAllButtons } from './uiHelpers.js';
import { validateJSONStructure } from './validators.js';
import { showSelectUserForm, showWelcomeScreen } from './uiRenderer.js';

// Function to load initial data
export async function loadInitialData() {
    const storedData = localStorage.getItem('appData');
    if (storedData) {
        try {
            const parsedData = JSON.parse(storedData);
            if (validateJSONStructure(parsedData)) {
                state.data = parsedData;
                enableButtonsAfterLoad();
                showMessage('Data loaded from local storage.', 'success');
                showSelectUserForm();
            } else {
                throw new Error('Invalid data structure in local storage.');
            }
        } catch (error) {
            console.error('Error parsing stored data:', error);
            showMessage('Failed to load stored data. Loading default data.', 'error');
            await fetchDefaultData();
        }
    } else {
        await fetchDefaultData();
    }
}

// Function to fetch default data from default_data.json
async function fetchDefaultData() {
    try {
        const response = await fetch('default_data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const defaultData = await response.json();
        if (validateJSONStructure(defaultData)) {
            state.data = defaultData;
            saveDataToLocalStorage();
            enableButtonsAfterLoad();
            showMessage('Default data loaded successfully!', 'success');
            showSelectUserForm();
        } else {
            showMessage('Invalid default data format.', 'error');
            showWelcomeScreen();
        }
    } catch (error) {
        console.error('Error fetching default data:', error);
        showMessage('Failed to load default data. Please load a JSON file manually.', 'error');
        showWelcomeScreen();
    }
}

// Function to save data to localStorage
export function saveDataToLocalStorage() {
    try {
        const dataStr = JSON.stringify(state.data);
        localStorage.setItem('appData', dataStr);
    } catch (error) {
        console.error('Error saving data to localStorage:', error);
        showMessage('Failed to save data locally.', 'error');
    }
}

// Function to save data to a JSON file
export function saveData() {
    try {
        const dataStr = JSON.stringify(state.data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'mastery_learning_data.json';
        a.click();

        URL.revokeObjectURL(url);
        showMessage('Data saved successfully!', 'success');
        saveDataToLocalStorage();
    } catch (error) {
        console.error('Error saving data:', error);
        showMessage('Failed to save data. Please try again.', 'error');
    }
}

// Function to reset the application
export function resetApp() {
    // Reset global state
    state.data = {
        users: [],
        topics: [],
        questions: []
    };
    state.currentQuestionIndex = 0;
    state.userAnswers = [];
    state.quizInProgress = false;
    state.activeUserId = null;
    state.currentSection = 'dashboard';

    // Reset UI
    disableAllButtons();
    document.getElementById('load-file').value = '';
    localStorage.removeItem('appData');
    showWelcomeScreen();
    showMessage('Application reset to initial state.', 'success');
}

// Function to load data from a selected JSON file
export function loadData(event) {
    const file = event.target.files[0];
    if (!file) {
        showMessage('Please select a JSON file to load.', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const loadedData = JSON.parse(e.target.result);
            if (validateJSONStructure(loadedData)) {
                state.data = loadedData;
                saveDataToLocalStorage();
                enableButtonsAfterLoad();
                showMessage('Data loaded successfully!', 'success');
                showSelectUserForm();
            } else {
                showMessage('Invalid data format. Please ensure the JSON has the correct structure.', 'error');
            }
        } catch (error) {
            console.error('Error parsing JSON file:', error);
            showMessage('Error parsing JSON file. Please ensure the file is valid JSON.', 'error');
        }
    };
    reader.onerror = function() {
        showMessage('Error reading the file. Please try again.', 'error');
    };
    reader.readAsText(file);
}
