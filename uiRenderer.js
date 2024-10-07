// uiRenderer.js

// Import necessary modules
import { state } from './state.js';
import { showMessage, setFocus } from './uiHelpers.js';
import { getAvailableQuestions, generateUUID } from './utils.js';
import { saveDataToLocalStorage } from './dataManager.js';
import { startQuiz } from './quizManager.js';

// Get reference to the main content area
const mainContent = document.getElementById('main-content');

// Function to display the dashboard
export function showDashboard() {
    mainContent.innerHTML = '';
    const dashboardContainer = document.createElement('div');
    dashboardContainer.classList.add('dashboard-container');
    dashboardContainer.innerHTML = `
        <h2>Dashboard</h2>
        <p>Welcome to the Mastery Learning Coach Lite! Use the options below to navigate through the app.</p>
        <div class="button-group menu-buttons">
            <button id="select-user-button">Select Active User</button>
        </div>
    `;
    mainContent.appendChild(dashboardContainer);
    setFocus(dashboardContainer);

    document.getElementById('select-user-button').addEventListener('click', showSelectUserForm);
}

// Function to display the select user form
export function showSelectUserForm() {
    mainContent.innerHTML = '';
    const selectContainer = document.createElement('div');
    selectContainer.classList.add('center');
    selectContainer.innerHTML = `
        <h2>Select Active User</h2>
        <div class="form-group">
            <label for="user-select">Choose a user:</label>
            <select id="user-select" required aria-required="true">
                <option value="">--Select User--</option>
                ${state.data.users.map(user => `<option value="${user.userId}">${user.username}</option>`).join('')}
            </select>
        </div>
        <div class="button-group">
            <button id="confirm-user-button" disabled aria-disabled="true">Confirm</button>
            <button type="button" id="cancel-button">Cancel</button>
        </div>
        <div style="margin-top: 20px;">
            <button id="add-user-button">Add New User</button>
        </div>
    `;
    mainContent.appendChild(selectContainer);
    setFocus(selectContainer);

    const userSelect = document.getElementById('user-select');
    const confirmUserButton = document.getElementById('confirm-user-button');
    const cancelButton = document.getElementById('cancel-button');

    userSelect.addEventListener('change', () => {
        if (userSelect.value) {
            confirmUserButton.disabled = false;
            confirmUserButton.setAttribute('aria-disabled', 'false');
        } else {
            confirmUserButton.disabled = true;
            confirmUserButton.setAttribute('aria-disabled', 'true');
        }
    });

    confirmUserButton.addEventListener('click', () => {
        const selectedUserId = userSelect.value;
        state.activeUserId = selectedUserId;
        const selectedUser = state.data.users.find(u => u.userId === selectedUserId);
        showMessage(`Active user set to "${selectedUser.username}"`, 'success');
        showMainUserMenu();
    });

    // Store the current activeUserId before opening the Select User form
    const previousActiveUserId = state.activeUserId;

    // Disable "Cancel" button if there is no previously active user
    if (!previousActiveUserId) {
        cancelButton.disabled = true;
    } else {
        cancelButton.disabled = false;
    }

    cancelButton.addEventListener('click', () => {
        state.activeUserId = previousActiveUserId; // Restore previous activeUserId
        if (state.activeUserId) {
            showMainUserMenu();
        } else {
            showDashboard();
        }
    });

    document.getElementById('add-user-button').addEventListener('click', showAddUserForm);
}

// Function to display the add user form
export function showAddUserForm() {
    mainContent.innerHTML = '';
    const form = document.createElement('form');
    form.setAttribute('aria-labelledby', 'add-user-title');
    form.innerHTML = `
        <h2 id="add-user-title">Add New User</h2>
        <div class="form-group">
            <label for="username">Username:</label>
            <input type="text" id="username" required aria-required="true">
        </div>
        <div class="button-group">
            <button type="submit">Add User</button>
            <button type="button" id="cancel-button">Cancel</button>
        </div>
    `;
    mainContent.appendChild(form);
    setFocus(form);

    form.addEventListener('submit', addNewUser);
    document.getElementById('cancel-button').addEventListener('click', showSelectUserForm);
}

// Function to add a new user
function addNewUser(event) {
    event.preventDefault();

    const usernameInput = document.getElementById('username');
    const username = usernameInput.value.trim();

    if (username) {
        // Check for unique username
        const isDuplicate = state.data.users.some(user => user.username.toLowerCase() === username.toLowerCase());
        if (isDuplicate) {
            showMessage(`The username "${username}" is already taken. Please choose a different one.`, 'error');
            usernameInput.focus();
            return;
        }

        // Generate a unique userId
        const userId = generateUUID();

        const newUser = {
            userId: userId,
            username: username,
            learningProgress: {
                questionsAnsweredCorrectly: [],
                questionsAnsweredWrong: [],
                questionsNotAnswered: state.data.questions.map(q => q.questionId)
            }
        };

        state.data.users.push(newUser);
        state.activeUserId = userId; // Automatically select the new user
        saveDataToLocalStorage();

        showMessage(`User "${username}" added and selected as active user!`, 'success');
        showMainUserMenu();
    } else {
        showMessage('Please enter a username.', 'error');
        document.getElementById('username').focus();
    }
}

// Function to display the main user menu
export function showMainUserMenu() {
    if (!state.activeUserId) {
        showSelectUserForm();
        return;
    }

    mainContent.innerHTML = '';
    const userMenu = document.createElement('div');
    const activeUser = state.data.users.find(u => u.userId === state.activeUserId);
    userMenu.classList.add('center');
    userMenu.innerHTML = `
        <div class="button-row">
            <h1>Hello, ${activeUser.username}!</h1>
            <br><br>
        </div>
        <div class="button-row">
            <button id="start-quiz-button" ${getAvailableQuestions(activeUser).length === 0 ? 'disabled aria-disabled="true"' : ''}>Start Quiz</button>
            <button id="add-question-button">Add New Question</button>
        </div>
        <div class="button-row">
            <button id="user-progress-button">User Progress</button>
            <button id="select-user-button">Select Active User</button>
        </div>
    `;
    mainContent.appendChild(userMenu);
    setFocus(userMenu);

    document.getElementById('start-quiz-button').addEventListener('click', () => {
        startQuiz();
    });
    document.getElementById('add-question-button').addEventListener('click', showAddQuestionForm);
    document.getElementById('user-progress-button').addEventListener('click', showUserProgress);
    document.getElementById('select-user-button').addEventListener('click', showSelectUserForm);
}

// Function to display the add question form
export function showAddQuestionForm() {
    mainContent.innerHTML = '';
    const form = document.createElement('form');
    form.setAttribute('aria-labelledby', 'add-question-title');
    form.innerHTML = `
        <h2 id="add-question-title">Add New Question</h2>
        <div class="form-group">
            <label for="question-text">Question Text:</label>
            <input type="text" id="question-text" required aria-required="true">
        </div>
        <div class="form-group">
            <label for="option-a">Option A:</label>
            <input type="text" id="option-a" required aria-required="true">
        </div>
        <div class="form-group">
            <label for="option-b">Option B:</label>
            <input type="text" id="option-b" required aria-required="true">
        </div>
        <div class="form-group">
            <label for="option-c">Option C:</label>
            <input type="text" id="option-c" required aria-required="true">
        </div>
        <div class="form-group">
            <label for="option-d">Option D:</label>
            <input type="text" id="option-d" required aria-required="true">
        </div>
        <div class="form-group">
            <label for="correct-answer">Correct Answer:</label>
            <select id="correct-answer" required aria-required="true">
                <option value="">Select Correct Option</option>
                <option value="A">Option A</option>
                <option value="B">Option B</option>
                <option value="C">Option C</option>
                <option value="D">Option D</option>
            </select>
        </div>
        <div class="form-group">
            <label for="difficulty-level">Difficulty Level (1-5):</label>
            <select id="difficulty-level" required aria-required="true">
                <option value="">Select Difficulty Level</option>
                <option value="1">1 (Very Easy)</option>
                <option value="2">2 (Easy)</option>
                <option value="3">3 (Moderate)</option>
                <option value="4">4 (Hard)</option>
                <option value="5">5 (Very Hard)</option>
            </select>
        </div>
        <div class="form-group">
            <label for="effort-level">Effort Level (10-300 seconds):</label>
            <input type="number" id="effort-level" min="10" max="300" required aria-required="true">
        </div>
        <div class="form-group">
            <label for="category-select">Category:</label>
            <select id="category-select" required aria-required="true">
                <option value="">Select Category</option>
                ${state.data.topics.map(topic => `<option value="${topic.topicId}">${topic.topicName}</option>`).join('')}
                <option value="add_new">Add New Category</option>
            </select>
        </div>
        <div class="form-group" id="new-category-group" style="display: none;">
            <label for="new-category-name">New Category Name:</label>
            <input type="text" id="new-category-name" aria-required="true">
        </div>
        <div class="button-group">
            <button type="submit">Submit</button>
            <button type="button" id="cancel-button">Cancel</button>
        </div>
    `;
    mainContent.appendChild(form);
    setFocus(form);

    const categorySelect = document.getElementById('category-select');
    const newCategoryGroup = document.getElementById('new-category-group');

    categorySelect.addEventListener('change', () => {
        if (categorySelect.value === 'add_new') {
            newCategoryGroup.style.display = 'block';
            document.getElementById('new-category-name').required = true;
            document.getElementById('new-category-name').focus();
        } else {
            newCategoryGroup.style.display = 'none';
            document.getElementById('new-category-name').required = false;
        }
    });

    form.addEventListener('submit', addNewQuestion);
    document.getElementById('cancel-button').addEventListener('click', showMainUserMenu);
}

// Function to add a new question
function addNewQuestion(event) {
    event.preventDefault();

    const questionText = document.getElementById('question-text').value.trim();
    const optionA = document.getElementById('option-a').value.trim();
    const optionB = document.getElementById('option-b').value.trim();
    const optionC = document.getElementById('option-c').value.trim();
    const optionD = document.getElementById('option-d').value.trim();
    const correctAnswer = document.getElementById('correct-answer').value;
    const difficultyLevel = parseInt(document.getElementById('difficulty-level').value);
    const effortLevel = parseInt(document.getElementById('effort-level').value);
    const categorySelect = document.getElementById('category-select');
    const newCategoryName = document.getElementById('new-category-name').value.trim();

    let topicId = null;

    // Validate Difficulty Level
    if (isNaN(difficultyLevel) || difficultyLevel < 1 || difficultyLevel > 5) {
        showMessage('Please select a valid Difficulty Level between 1 and 5.', 'error');
        document.getElementById('difficulty-level').focus();
        return;
    }

    // Validate Effort Level
    if (isNaN(effortLevel) || effortLevel < 10 || effortLevel > 300) {
        showMessage('Please enter a valid Effort Level between 10 and 300 seconds.', 'error');
        document.getElementById('effort-level').focus();
        return;
    }

    if (categorySelect.value === 'add_new') {
        if (!newCategoryName) {
            showMessage('Please enter a new category name.', 'error');
            document.getElementById('new-category-name').focus();
            return;
        }
        // Check for unique category name
        const isDuplicateCategory = state.data.topics.some(topic => topic.topicName.toLowerCase() === newCategoryName.toLowerCase());
        if (isDuplicateCategory) {
            showMessage(`The category "${newCategoryName}" already exists. Please choose a different name.`, 'error');
            document.getElementById('new-category-name').focus();
            return;
        }
        // Generate a unique topicId
        topicId = generateUUID();
        const newTopic = {
            topicId: topicId,
            topicName: newCategoryName,
            questions: []
        };
        state.data.topics.push(newTopic);
    } else if (categorySelect.value) {
        topicId = categorySelect.value;
    } else {
        showMessage('Please select or add a category.', 'error');
        document.getElementById('category-select').focus();
        return;
    }

    if (questionText && optionA && optionB && optionC && optionD && correctAnswer) {
        // Check for duplicate question text
        const isDuplicateQuestion = state.data.questions.some(q => q.questionText.toLowerCase() === questionText.toLowerCase());
        if (isDuplicateQuestion) {
            showMessage('A question with the same text already exists. Please enter a unique question.', 'error');
            document.getElementById('question-text').focus();
            return;
        }

        // Calculate Score
        const rawScore = difficultyLevel * effortLevel;
        const maxRawScore = 5 * 300; // 1500
        const score = parseFloat(((rawScore / maxRawScore) * 9 + 1).toFixed(2)); // Normalize to 1-10

        // Generate a unique questionId
        const questionId = generateUUID();

        const newQuestion = {
            questionId: questionId,
            topicId: topicId,
            questionText: questionText,
            options: {
                A: optionA,
                B: optionB,
                C: optionC,
                D: optionD
            },
            correctAnswer: correctAnswer,
            difficultyLevel: difficultyLevel,
            effortLevel: effortLevel,
            score: score
        };

        state.data.questions.push(newQuestion);

        // Add questionId to the selected topic
        const topic = state.data.topics.find(t => t.topicId === topicId);
        if (topic) {
            topic.questions.push(questionId);
        }

        // Update all users' questionsNotAnswered
        state.data.users.forEach(user => {
            user.learningProgress.questionsNotAnswered.push(questionId);
        });

        saveDataToLocalStorage();

        showMessage('Question added successfully!', 'success');
        showMainUserMenu();
    } else {
        showMessage('Please fill in all fields.', 'error');
    }
}

// Function to display the user progress
export function showUserProgress() {
    if (!state.activeUserId) {
        showSelectUserForm();
        return;
    }

    mainContent.innerHTML = '';

    const activeUser = state.data.users.find(u => u.userId === state.activeUserId);
    if (!activeUser) {
        showMessage('Active user not found.', 'error');
        return;
    }

    const progress = activeUser.learningProgress;

    // Calculate Average Scores
    const totalCorrectScores = progress.questionsAnsweredCorrectly.reduce((acc, curr) => acc + curr.score, 0);
    const totalIncorrectScores = progress.questionsAnsweredWrong.reduce((acc, curr) => acc + curr.score, 0);
    const totalNotAnswered = progress.questionsNotAnswered.length;

    const averageCorrectScore = progress.questionsAnsweredCorrectly.length > 0 ? (totalCorrectScores / progress.questionsAnsweredCorrectly.length).toFixed(2) : 0;
    const averageIncorrectScore = progress.questionsAnsweredWrong.length > 0 ? (totalIncorrectScores / progress.questionsAnsweredWrong.length).toFixed(2) : 0;
    const averageNotAnsweredScore = totalNotAnswered > 0 ? (1).toFixed(2) : 0; // Assuming minimum score for not answered

    const userProgressContainer = document.createElement('div');
    userProgressContainer.classList.add('user-progress-container');
    userProgressContainer.innerHTML = `
        <h2>User Progress</h2>
        <ul>
            <li>Total Questions Answered Correctly: <strong>${progress.questionsAnsweredCorrectly.length}</strong></li>
            <li>Total Questions Answered Incorrectly: <strong>${progress.questionsAnsweredWrong.length}</strong></li>
            <li>Total Questions Not Yet Answered: <strong>${progress.questionsNotAnswered.length}</strong></li>
        </ul>
        <div class="average-stat">
            <h3>Average Scores</h3>
            <ul>
                <li>Correct Answers: <strong>${averageCorrectScore}</strong></li>
                <li>Incorrect Answers: <strong>${averageIncorrectScore}</strong></li>
                <li>Not Yet Answered: <strong>${averageNotAnsweredScore}</strong></li>
            </ul>
        </div>
        <button id="return-main-menu-button">Return to Main Menu</button>
    `;
    mainContent.appendChild(userProgressContainer);
    setFocus(userProgressContainer);

    // Event Listener for Return Button
    document.getElementById('return-main-menu-button').addEventListener('click', showMainUserMenu);
}

// Function to display the welcome screen
export function showWelcomeScreen() {
    mainContent.innerHTML = '';
    const welcomeContainer = document.createElement('div');
    welcomeContainer.classList.add('center');
    welcomeContainer.innerHTML = `
        <h2>Welcome to the Mastery Learning Coach Lite!</h2>
        <p>Please load your data to get started.</p>
    `;
    mainContent.appendChild(welcomeContainer);
    setFocus(welcomeContainer);
}
