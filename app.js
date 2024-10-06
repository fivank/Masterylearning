// app.js

// Global Variables
let data = {
    users: [],
    topics: [],
    questions: []
};
let currentQuestionIndex = 0;
let userAnswers = [];
let quizInProgress = false;
let activeUserId = null;
let currentSection = 'dashboard'; // Default section

// DOM Elements
const mainContent = document.getElementById('main-content');
const loadFileInput = document.getElementById('load-file');
const saveButton = document.getElementById('save-button');
const resetButton = document.getElementById('reset-button');
const messageBox = document.getElementById('message-box');
const sidebarLinks = document.querySelectorAll('#sidebar nav ul li a');

// Event Listeners
document.addEventListener('DOMContentLoaded', initializeApp);
loadFileInput.addEventListener('change', loadData);
saveButton.addEventListener('click', saveData);
resetButton.addEventListener('click', resetApp);
sidebarLinks.forEach(link => {
    link.addEventListener('click', navigateSection);
});

// Functions

/**
 * Initializes the application by setting up the initial state and displaying the default section.
 */
function initializeApp() {
    disableAllButtons();
    showWelcomeScreen();
    highlightActiveSidebarLink('dashboard');
}

/**
 * Disables buttons that should not be interactable at the start.
 */
function disableAllButtons() {
    saveButton.disabled = true;
    saveButton.setAttribute('aria-disabled', 'true');
}

/**
 * Enables buttons after data has been successfully loaded.
 */
function enableButtonsAfterLoad() {
    saveButton.disabled = false;
    saveButton.setAttribute('aria-disabled', 'false');
}

/**
 * Highlights the active link in the sidebar based on the current section.
 * @param {string} section - The current active section.
 */
function highlightActiveSidebarLink(section) {
    sidebarLinks.forEach(link => {
        if (link.getAttribute('href') === `#${section}`) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

/**
 * Navigates to the selected section when a sidebar link is clicked.
 * @param {Event} event - The click event.
 */
function navigateSection(event) {
    event.preventDefault();
    const targetSection = event.currentTarget.getAttribute('href').substring(1);
    currentSection = targetSection;
    highlightActiveSidebarLink(targetSection);
    renderSection(targetSection);
}

/**
 * Renders the specified section in the main content area.
 * @param {string} section - The section to render.
 */
function renderSection(section) {
    switch(section) {
        case 'dashboard':
            showDashboard();
            break;
        case 'quizzes':
            if (quizInProgress) {
                showCurrentQuiz();
            } else {
                showMainUserMenu();
            }
            break;
        case 'user-progress':
            showUserProgress();
            break;
        case 'settings':
            showSettings();
            break;
        default:
            showDashboard();
    }
}

/**
 * Displays the welcome screen prompting the user to load data.
 */
function showWelcomeScreen() {
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

/**
 * Resets the application to its initial state.
 */
function resetApp() {
    // Reset global variables
    data = {
        users: [],
        topics: [],
        questions: []
    };
    currentQuestionIndex = 0;
    userAnswers = [];
    quizInProgress = false;
    activeUserId = null;
    currentSection = 'dashboard';

    // Reset UI
    disableAllButtons();
    loadFileInput.value = '';
    showWelcomeScreen();
    highlightActiveSidebarLink('dashboard');
    showMessage('Application reset to initial state.', 'success');
}

/**
 * Displays the dashboard section.
 */
function showDashboard() {
    mainContent.innerHTML = '';
    const dashboardContainer = document.createElement('div');
    dashboardContainer.classList.add('dashboard-container');
    dashboardContainer.innerHTML = `
        <h2>Dashboard</h2>
        <p>Welcome to the Mastery Learning Coach Lite! Use the sidebar to navigate through the app.</p>
    `;
    mainContent.appendChild(dashboardContainer);
    setFocus(dashboardContainer);
}

/**
 * Displays the user selection form.
 */
function showSelectUserForm() {
    mainContent.innerHTML = '';
    const selectContainer = document.createElement('div');
    selectContainer.classList.add('center');
    selectContainer.innerHTML = `
        <h2>Select Active User</h2>
        <div class="form-group">
            <label for="user-select">Choose a user:</label>
            <select id="user-select" required aria-required="true">
                <option value="">--Select User--</option>
                ${data.users.map(user => `<option value="${user.userId}">${user.username}</option>`).join('')}
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
        activeUserId = selectedUserId;
        const selectedUser = data.users.find(u => u.userId === selectedUserId);
        showMessage(`Active user set to "${selectedUser.username}"`, 'success');
        showMainUserMenu();
    });

    // Store the current activeUserId before opening the Select User form
    const previousActiveUserId = activeUserId;

    // Disable "Cancel" button if there is no previously active user
    if (!previousActiveUserId) {
        cancelButton.disabled = true;
    } else {
        cancelButton.disabled = false;
    }

    cancelButton.addEventListener('click', () => {
        activeUserId = previousActiveUserId; // Restore previous activeUserId
        if (activeUserId) {
            showMainUserMenu();
        } else {
            showWelcomeScreen();
        }
    });

    document.getElementById('add-user-button').addEventListener('click', showAddUserForm);
}

/**
 * Displays the form to add a new user.
 */
function showAddUserForm() {
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

/**
 * Adds a new user to the data and updates the UI.
 * @param {Event} event - The form submission event.
 */
function addNewUser(event) {
    event.preventDefault();

    const usernameInput = document.getElementById('username');
    const username = usernameInput.value.trim();

    if (username) {
        // Check for unique username
        const isDuplicate = data.users.some(user => user.username.toLowerCase() === username.toLowerCase());
        if (isDuplicate) {
            showMessage(`The username "${username}" is already taken. Please choose a different one.`, 'error');
            usernameInput.focus();
            return;
        }

        // Generate a unique userId (using UUID for better uniqueness)
        const userId = generateUUID();

        const newUser = {
            userId: userId,
            username: username,
            learningProgress: {
                questionsAnsweredCorrectly: [],
                questionsAnsweredWrong: [],
                questionsNotAnswered: data.questions.map(q => q.questionId)
            }
        };

        data.users.push(newUser);

        showMessage(`User "${username}" added successfully!`, 'success');
        showSelectUserForm();
    } else {
        showMessage('Please enter a username.', 'error');
        document.getElementById('username').focus();
    }
}

/**
 * Displays the main user menu with options like starting a quiz, adding questions, etc.
 */
function showMainUserMenu() {
    if (!activeUserId) {
        showSelectUserForm();
        return;
    }

    mainContent.innerHTML = '';
    const userMenu = document.createElement('div');
    const activeUser = data.users.find(u => u.userId === activeUserId);
    userMenu.classList.add('center');
    userMenu.innerHTML = `
        <h2>Welcome, ${activeUser.username}!</h2>
        <div class="button-group menu-buttons">
            <button id="start-quiz-button" ${data.questions.length === 0 ? 'disabled aria-disabled="true"' : ''}>Start Quiz</button>
            <button id="add-question-button">Add New Question</button>
            <button id="user-progress-button">User Progress</button>
            <button id="select-user-button">Select Active User</button>
        </div>
    `;
    mainContent.appendChild(userMenu);
    setFocus(userMenu);

    document.getElementById('start-quiz-button').addEventListener('click', startQuiz);
    document.getElementById('add-question-button').addEventListener('click', showAddQuestionForm);
    document.getElementById('user-progress-button').addEventListener('click', showUserProgress);
    document.getElementById('select-user-button').addEventListener('click', showSelectUserForm);
}

/**
 * Displays the form to add a new question.
 */
function showAddQuestionForm() {
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
                ${data.topics.map(topic => `<option value="${topic.topicId}">${topic.topicName}</option>`).join('')}
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

/**
 * Adds a new question to the data and updates the UI.
 * @param {Event} event - The form submission event.
 */
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
        const isDuplicateCategory = data.topics.some(topic => topic.topicName.toLowerCase() === newCategoryName.toLowerCase());
        if (isDuplicateCategory) {
            showMessage(`The category "${newCategoryName}" already exists. Please choose a different name.`, 'error');
            document.getElementById('new-category-name').focus();
            return;
        }
        // Generate a unique topicId using UUID
        topicId = generateUUID();
        const newTopic = {
            topicId: topicId,
            topicName: newCategoryName,
            questions: []
        };
        data.topics.push(newTopic);
    } else if (categorySelect.value) {
        topicId = categorySelect.value;
    } else {
        showMessage('Please select or add a category.', 'error');
        document.getElementById('category-select').focus();
        return;
    }

    if (questionText && optionA && optionB && optionC && optionD && correctAnswer) {
        // Check for duplicate question text
        const isDuplicateQuestion = data.questions.some(q => q.questionText.toLowerCase() === questionText.toLowerCase());
        if (isDuplicateQuestion) {
            showMessage('A question with the same text already exists. Please enter a unique question.', 'error');
            document.getElementById('question-text').focus();
            return;
        }

        // Calculate Score
        const rawScore = difficultyLevel * effortLevel;
        const maxRawScore = 5 * 300; // 1500
        const score = parseFloat(((rawScore / maxRawScore) * 9 + 1).toFixed(2)); // Normalize to 1-10

        // Generate a unique questionId using UUID
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

        data.questions.push(newQuestion);

        // Add questionId to the selected topic
        const topic = data.topics.find(t => t.topicId === topicId);
        if (topic) {
            topic.questions.push(questionId);
        }

        // Update all users' questionsNotAnswered
        data.users.forEach(user => {
            user.learningProgress.questionsNotAnswered.push(questionId);
        });

        showMessage('Question added successfully!', 'success');
        renderSection(currentSection);
    } else {
        showMessage('Please fill in all fields.', 'error');
    }
}

/**
 * Starts the quiz for the active user.
 */
function startQuiz() {
    if (data.questions.length === 0) {
        showMessage('No questions available. Please add questions first.', 'error');
        return;
    }

    if (!activeUserId) {
        showMessage('Please select an active user first.', 'error');
        return;
    }

    const activeUser = data.users.find(u => u.userId === activeUserId);
    if (!activeUser) {
        showMessage('Active user not found.', 'error');
        return;
    }

    quizInProgress = true;
    currentQuestionIndex = 0;
    userAnswers = [];

    // Filter questions not yet answered
    const questionsToAsk = data.questions.filter(q => activeUser.learningProgress.questionsNotAnswered.includes(q.questionId));

    if (questionsToAsk.length === 0) {
        showMessage('No new questions to answer. All questions have been answered.', 'success');
        renderSection(currentSection);
        return;
    }

    // Shuffle questions
    shuffleArray(questionsToAsk);

    showQuestion(questionsToAsk);
    highlightActiveSidebarLink('quizzes');
}

/**
 * Displays the current quiz question along with answer options and progress bar.
 * @param {Array} questionsToAsk - The array of questions to be asked.
 */
function showQuestion(questionsToAsk) {
    mainContent.innerHTML = '';

    const question = questionsToAsk[currentQuestionIndex];

    const quizContainer = document.createElement('div');
    quizContainer.classList.add('quiz-container');
    quizContainer.innerHTML = `
        <div class="question-number">Question ${currentQuestionIndex + 1} of ${questionsToAsk.length}</div>
        <div class="question-text" id="question-text">${question.questionText}</div>
        <div class="question-score">Difficulty & Effort Score: <span class="score-value">${question.score}</span></div>
        
        <div class="options" role="radiogroup" aria-labelledby="question-text">
            <label><input type="radio" name="answer" value="A"> <span>A. ${question.options.A}</span></label>
            <label><input type="radio" name="answer" value="B"> <span>B. ${question.options.B}</span></label>
            <label><input type="radio" name="answer" value="C"> <span>C. ${question.options.C}</span></label>
            <label><input type="radio" name="answer" value="D"> <span>D. ${question.options.D}</span></label>
        </div>

        <!-- Progress Bar -->
        <div class="progress-bar-container" aria-label="Quiz Progress">
            <div class="progress-bar" id="quiz-progress-bar" style="width: ${(currentQuestionIndex / questionsToAsk.length) * 100}%;"></div>
        </div>

        <div class="button-group action-buttons">
            <button id="next-question-button" disabled aria-disabled="true">${currentQuestionIndex < questionsToAsk.length - 1 ? 'Next Question' : 'Submit'}</button>
            <button id="finish-quiz-button" type="button">Finish Quiz Early</button>
        </div>
    `;
    mainContent.appendChild(quizContainer);
    setFocus(quizContainer);

    const answerInputs = document.getElementsByName('answer');
    answerInputs.forEach(input => {
        input.addEventListener('change', () => {
            document.getElementById('next-question-button').disabled = false;
            document.getElementById('next-question-button').setAttribute('aria-disabled', 'false');
        });
    });

    document.getElementById('next-question-button').addEventListener('click', () => {
        const selectedAnswer = document.querySelector('input[name="answer"]:checked').value;
        userAnswers.push({
            questionId: question.questionId,
            selectedAnswer: selectedAnswer
        });
        currentQuestionIndex++;
        updateProgressBar(questionsToAsk.length);
        if (currentQuestionIndex < questionsToAsk.length) {
            showQuestion(questionsToAsk);
        } else {
            showResults(questionsToAsk);
        }
    });

    document.getElementById('finish-quiz-button').addEventListener('click', () => {
        finishQuizEarly(questionsToAsk);
    });
}

/**
 * Updates the progress bar based on the current question index.
 * @param {number} totalQuestions - The total number of questions in the quiz.
 */
function updateProgressBar(totalQuestions) {
    const progressBar = document.getElementById('quiz-progress-bar');
    const progressPercentage = ((currentQuestionIndex) / totalQuestions) * 100;
    progressBar.style.width = `${progressPercentage}%`;
}

/**
 * Displays the quiz results after completion or early finish.
 * @param {Array} questionsToAsk - The array of questions that were asked.
 * @param {boolean} [isPartial=false] - Indicates if the quiz was finished early.
 */
function showResults(questionsToAsk, isPartial = false) {
    quizInProgress = false;
    mainContent.innerHTML = '';

    let score = 0;
    const activeUser = data.users.find(u => u.userId === activeUserId);
    const resultsContainer = document.createElement('div');
    resultsContainer.classList.add('results-container');
    resultsContainer.innerHTML = '<h2>Quiz Results</h2>';

    questionsToAsk.forEach((question, index) => {
        const userAnswerObj = userAnswers[index];
        if (!userAnswerObj) return; // Skip unanswered questions

        const isCorrect = userAnswerObj.selectedAnswer === question.correctAnswer;
        if (isCorrect) score++;

        const reviewItem = document.createElement('div');
        reviewItem.classList.add('review-item');
        reviewItem.innerHTML = `
            <h3>${index + 1}. ${question.questionText}</h3>
            <p>Your Answer: <strong>${userAnswerObj.selectedAnswer} - ${question.options[userAnswerObj.selectedAnswer]}</strong></p>
            <p>Correct Answer: <strong>${question.correctAnswer} - ${question.options[question.correctAnswer]}</strong></p>
            <p class="${isCorrect ? 'correct' : 'incorrect'}">${isCorrect ? 'Correct' : 'Incorrect'}</p>
            <p>Question Score: <strong>${question.score}</strong></p>
        `;
        resultsContainer.appendChild(reviewItem);

        // Remove answered questions from 'questionsNotAnswered'
        activeUser.learningProgress.questionsNotAnswered = activeUser.learningProgress.questionsNotAnswered.filter(qId => qId !== question.questionId);

        // Update answered correctly/wrong
        if (isCorrect) {
            activeUser.learningProgress.questionsAnsweredCorrectly.push({
                questionId: question.questionId,
                dateTime: new Date().toISOString(),
                score: question.score
            });
        } else {
            activeUser.learningProgress.questionsAnsweredWrong.push({
                questionId: question.questionId,
                dateTime: new Date().toISOString(),
                score: question.score
            });
        }
    });

    const scoreSummary = document.createElement('div');
    scoreSummary.classList.add('score-summary');
    scoreSummary.innerHTML = `You got <span>${score}</span> out of <span>${questionsToAsk.length}</span> correct!`;
    resultsContainer.insertBefore(scoreSummary, resultsContainer.firstChild);

    if (isPartial) {
        // List of not answered questions
        const notAnswered = data.questions.filter(q => activeUser.learningProgress.questionsNotAnswered.includes(q.questionId));
        if (notAnswered.length > 0) {
            const notAnsweredSection = document.createElement('div');
            notAnsweredSection.classList.add('review-item');
            notAnsweredSection.innerHTML = `
                <h3>Unanswered Questions (${notAnswered.length})</h3>
                <ul>
                    ${notAnswered.map((q, idx) => `<li>${idx + 1}. ${q.questionText}</li>`).join('')}
                </ul>
            `;
            resultsContainer.appendChild(notAnsweredSection);
        }
    }

    // Calculate Average Scores
    const totalCorrectScores = activeUser.learningProgress.questionsAnsweredCorrectly.reduce((acc, curr) => acc + curr.score, 0);
    const totalIncorrectScores = activeUser.learningProgress.questionsAnsweredWrong.reduce((acc, curr) => acc + curr.score, 0);
    const totalNotAnswered = activeUser.learningProgress.questionsNotAnswered.length;

    const averageCorrectScore = activeUser.learningProgress.questionsAnsweredCorrectly.length > 0 ? (totalCorrectScores / activeUser.learningProgress.questionsAnsweredCorrectly.length).toFixed(2) : 0;
    const averageIncorrectScore = activeUser.learningProgress.questionsAnsweredWrong.length > 0 ? (totalIncorrectScores / activeUser.learningProgress.questionsAnsweredWrong.length).toFixed(2) : 0;
    const averageNotAnsweredScore = totalNotAnswered > 0 ? (1).toFixed(2) : 0; // Assuming minimum score for not answered

    // Add Average Scores to Results
    const averageScoresSection = document.createElement('div');
    averageScoresSection.classList.add('review-item');
    averageScoresSection.innerHTML = `
        <h3>Average Scores</h3>
        <ul>
            <li>Correct Answers: <strong>${averageCorrectScore}</strong></li>
            <li>Incorrect Answers: <strong>${averageIncorrectScore}</strong></li>
            <li>Not Yet Answered: <strong>${averageNotAnsweredScore}</strong></li>
        </ul>
    `;
    resultsContainer.appendChild(averageScoresSection);

    const returnButton = document.createElement('button');
    returnButton.textContent = 'Return to Main Menu';
    returnButton.classList.add('return-button');
    returnButton.addEventListener('click', showMainUserMenu);

    mainContent.appendChild(resultsContainer);
    mainContent.appendChild(returnButton);
    setFocus(returnButton);
}

/**
 * Displays the user progress section with detailed statistics.
 */
function showUserProgress() {
    if (!activeUserId) {
        showSelectUserForm();
        return;
    }

    mainContent.innerHTML = '';

    const activeUser = data.users.find(u => u.userId === activeUserId);
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

/**
 * Displays the settings section where users can customize app settings.
 */
function showSettings() {
    mainContent.innerHTML = '';
    const settingsContainer = document.createElement('div');
    settingsContainer.classList.add('settings-container');
    settingsContainer.innerHTML = `
        <h2>Settings</h2>
        <p>Customize your application settings here.</p>
        <!-- Future settings can be added here -->
    `;
    mainContent.appendChild(settingsContainer);
    setFocus(settingsContainer);
}

/**
 * Handles the current ongoing quiz if the user navigates back to quizzes.
 */
function showCurrentQuiz() {
    // Logic to resume or display the current quiz state
    const activeUser = data.users.find(u => u.userId === activeUserId);
    if (!activeUser) {
        showMessage('Active user not found.', 'error');
        return;
    }

    // Find unanswered questions
    const questionsToAsk = data.questions.filter(q => activeUser.learningProgress.questionsNotAnswered.includes(q.questionId));

    if (questionsToAsk.length === 0) {
        showMessage('No new questions to answer. All questions have been answered.', 'success');
        showMainUserMenu();
        return;
    }

    showQuestion(questionsToAsk);
}

/**
 * Displays a confirmation or error message to the user.
 * @param {string} message - The message to display.
 * @param {string} type - The type of message ('success' or 'error').
 */
function showMessage(message, type) {
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

/**
 * Shuffles an array in place using the Fisher-Yates algorithm.
 * @param {Array} array - The array to shuffle.
 * @returns {Array} The shuffled array.
 */
function shuffleArray(array) {
    // Fisher-Yates shuffle algorithm
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/**
 * Validates the structure of the loaded JSON data.
 * @param {Object} jsonData - The JSON data to validate.
 * @returns {boolean} True if valid, false otherwise.
 */
function validateJSONStructure(jsonData) {
    if (!jsonData) return false;

    const hasUsers = Array.isArray(jsonData.users);
    const hasTopics = Array.isArray(jsonData.topics);
    const hasQuestions = Array.isArray(jsonData.questions);

    if (!hasUsers || !hasTopics || !hasQuestions) return false;

    // Further validation: Check each user, topic, and question
    const usersValid = jsonData.users.every(user => 
        typeof user.userId === 'string' &&
        typeof user.username === 'string' &&
        user.learningProgress &&
        Array.isArray(user.learningProgress.questionsAnsweredCorrectly) &&
        Array.isArray(user.learningProgress.questionsAnsweredWrong) &&
        Array.isArray(user.learningProgress.questionsNotAnswered)
    );

    const topicsValid = jsonData.topics.every(topic => 
        typeof topic.topicId === 'string' &&
        typeof topic.topicName === 'string' &&
        Array.isArray(topic.questions)
    );

    const questionsValid = jsonData.questions.every(question => 
        typeof question.questionId === 'string' &&
        typeof question.topicId === 'string' &&
        typeof question.questionText === 'string' &&
        question.options &&
        typeof question.options.A === 'string' &&
        typeof question.options.B === 'string' &&
        typeof question.options.C === 'string' &&
        typeof question.options.D === 'string' &&
        typeof question.correctAnswer === 'string' &&
        ['A', 'B', 'C', 'D'].includes(question.correctAnswer) &&
        typeof question.difficultyLevel === 'number' &&
        typeof question.effortLevel === 'number' &&
        typeof question.score === 'number'
    );

    return usersValid && topicsValid && questionsValid;
}

/**
 * Generates a UUID for unique identifiers.
 * @returns {string} A UUID string.
 */
function generateUUID() { // Public Domain/MIT
    var d = new Date().getTime();//Timestamp
    var d2 = (performance && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16;//random number between 0 and 16
        if(d > 0){
            r = (d + r)%16 | 0;
            d = Math.floor(d/16);
        } else {
            r = (d2 + r)%16 | 0;
            d2 = Math.floor(d2/16);
        }
        return (c==='x' ? r : (r&0x3|0x8)).toString(16);
    });
}

/**
 * Sets focus to the first focusable element within a container for accessibility.
 * @param {HTMLElement} element - The container element.
 */
function setFocus(element) {
    // Utility function to set focus to the first focusable element in the container
    const focusable = element.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable.length) {
        focusable[0].focus();
    } else {
        element.focus();
    }
}

/**
 * Loads data from a selected JSON file.
 */
function loadData() {
    const file = loadFileInput.files[0];
    if (!file) {
        showMessage('Please select a JSON file to load.', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const loadedData = JSON.parse(event.target.result);
            if (validateJSONStructure(loadedData)) {
                data = loadedData;
                enableButtonsAfterLoad();
                showMessage('Data loaded successfully!', 'success');
                showSelectUserForm(); // Automatically navigate to Select Active User
                highlightActiveSidebarLink('quizzes');
            } else {
                showMessage('Invalid data format. Please ensure the JSON has users, topics, and questions arrays with the correct structure.', 'error');
            }
        } catch (e) {
            showMessage('Error parsing JSON file. Please ensure the file is valid JSON.', 'error');
        }
    };
    reader.onerror = function() {
        showMessage('Error reading the file. Please try again.', 'error');
    };
    reader.readAsText(file);
}

/**
 * Saves the current data state to a JSON file.
 */
function saveData() {
    try {
        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'mastery_learning_data.json';
        a.click();

        URL.revokeObjectURL(url);
        showMessage('Data saved successfully!', 'success');
    } catch (error) {
        showMessage('Failed to save data. Please try again.', 'error');
    }
}

/**
 * Finishes the quiz early, showing results based on answered questions.
 * @param {Array} questionsToAsk - The array of questions that were asked.
 */
function finishQuizEarly(questionsToAsk) {
    if (userAnswers.length === 0) {
        showMessage('You have not answered any questions yet.', 'error');
        return;
    }

    const answeredQuestions = userAnswers.map(answer => {
        return data.questions.find(q => q.questionId === answer.questionId);
    }).filter(q => q !== undefined);

    showResults(answeredQuestions, true);
    highlightActiveSidebarLink('quizzes');
}

/**
 * Starts the quiz and navigates to the quizzes section.
 */
function startQuiz() {
    if (data.questions.length === 0) {
        showMessage('No questions available. Please add questions first.', 'error');
        return;
    }

    if (!activeUserId) {
        showMessage('Please select an active user first.', 'error');
        return;
    }

    const activeUser = data.users.find(u => u.userId === activeUserId);
    if (!activeUser) {
        showMessage('Active user not found.', 'error');
        return;
    }

    quizInProgress = true;
    currentQuestionIndex = 0;
    userAnswers = [];

    // Filter questions not yet answered
    const questionsToAsk = data.questions.filter(q => activeUser.learningProgress.questionsNotAnswered.includes(q.questionId));

    if (questionsToAsk.length === 0) {
        showMessage('No new questions to answer. All questions have been answered.', 'success');
        renderSection(currentSection);
        return;
    }

    // Shuffle questions
    shuffleArray(questionsToAsk);

    showQuestion(questionsToAsk);
    highlightActiveSidebarLink('quizzes');
}
