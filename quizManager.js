// quizManager.js

// Import necessary modules
import { state } from './state.js';
import { showMessage, setFocus } from './uiHelpers.js';
import { getAvailableQuestions, shuffleArray } from './utils.js';
import { saveDataToLocalStorage } from './dataManager.js';
import { showMainUserMenu } from './uiRenderer.js';

// Get reference to the main content area
const mainContent = document.getElementById('main-content');

// Function to start the quiz
export function startQuiz() {
    if (state.data.questions.length === 0) {
        showMessage('No questions available. Please add questions first.', 'error');
        return;
    }

    if (!state.activeUserId) {
        showMessage('Please select an active user first.', 'error');
        return;
    }

    const activeUser = state.data.users.find(u => u.userId === state.activeUserId);
    if (!activeUser) {
        showMessage('Active user not found.', 'error');
        return;
    }

    const availableQuestions = getAvailableQuestions(activeUser);
    if (availableQuestions.length === 0) {
        showMessage('No new questions to answer. All questions have been answered.', 'success');
        showMainUserMenu();
        return;
    }

    state.quizInProgress = true;
    state.currentQuestionIndex = 0;
    state.userAnswers = [];

    // Shuffle questions
    shuffleArray(availableQuestions);

    // Store the shuffled questions in state
    state.quizQuestions = availableQuestions;

    showQuestion();
}

// Function to show the current quiz question
export function showQuestion() {
    mainContent.innerHTML = '';

    const question = state.quizQuestions[state.currentQuestionIndex];

    const quizContainer = document.createElement('div');
    quizContainer.classList.add('quiz-container');
    quizContainer.innerHTML = `
        <div class="question-number">Question ${state.currentQuestionIndex + 1} of ${state.quizQuestions.length}</div>
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
            <div class="progress-bar" id="quiz-progress-bar" style="width: ${(state.currentQuestionIndex / state.quizQuestions.length) * 100}%;"></div>
        </div>

        <div class="button-group action-buttons">
            <button id="next-question-button" disabled aria-disabled="true">${state.currentQuestionIndex < state.quizQuestions.length - 1 ? 'Next Question' : 'Submit'}</button>
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
        state.userAnswers.push({
            questionId: question.questionId,
            selectedAnswer: selectedAnswer
        });
        state.currentQuestionIndex++;
        updateProgressBar();
        if (state.currentQuestionIndex < state.quizQuestions.length) {
            showQuestion();
        } else {
            showResults();
        }
    });

    document.getElementById('finish-quiz-button').addEventListener('click', () => {
        finishQuizEarly();
    });
}

// Function to update the progress bar
function updateProgressBar() {
    const progressBar = document.getElementById('quiz-progress-bar');
    const progressPercentage = ((state.currentQuestionIndex) / state.quizQuestions.length) * 100;
    progressBar.style.width = `${progressPercentage}%`;
}

// Function to finish the quiz early
export function finishQuizEarly() {
    showResults(true);
}

// Function to show quiz results
export function showResults(isPartial = false) {
    state.quizInProgress = false;
    mainContent.innerHTML = '';

    let score = 0;
    const activeUser = state.data.users.find(u => u.userId === state.activeUserId);
    const resultsContainer = document.createElement('div');
    resultsContainer.classList.add('results-container');
    resultsContainer.innerHTML = '<h2>Quiz Results</h2>';

    state.quizQuestions.forEach((question, index) => {
        const userAnswerObj = state.userAnswers[index];
        if (!userAnswerObj) return; // Skip unanswered questions

        const isCorrect = userAnswerObj.selectedAnswer === question.correctAnswer;
        if (isCorrect) score++;

        const reviewItem = document.createElement('div');
        reviewItem.classList.add('review-item');
        reviewItem.classList.add(isCorrect ? 'correct' : 'incorrect');
        reviewItem.innerHTML = `
            <h3>${index + 1}. ${question.questionText}</h3>
            <p>Your Answer: <strong>${userAnswerObj.selectedAnswer} - ${question.options[userAnswerObj.selectedAnswer]}</strong></p>
            <p>Correct Answer: <strong>${question.correctAnswer} - ${question.options[question.correctAnswer]}</strong></p>
            <p>${isCorrect ? 'Correct' : 'Incorrect'}</p>
            <p>Question Score: <strong>${question.score}</strong></p>
        `;
        resultsContainer.appendChild(reviewItem);

        // Update user's learning progress
        if (isCorrect) {
            // Remove from questionsNotAnswered
            activeUser.learningProgress.questionsNotAnswered = activeUser.learningProgress.questionsNotAnswered.filter(qId => qId !== question.questionId);
            // Add to questionsAnsweredCorrectly
            activeUser.learningProgress.questionsAnsweredCorrectly.push({
                questionId: question.questionId,
                dateTime: new Date().toISOString(),
                score: question.score
            });
        } else {
            // Remove from questionsNotAnswered
            activeUser.learningProgress.questionsNotAnswered = activeUser.learningProgress.questionsNotAnswered.filter(qId => qId !== question.questionId);
            // Add to questionsAnsweredWrong
            activeUser.learningProgress.questionsAnsweredWrong.push({
                questionId: question.questionId,
                dateTime: new Date().toISOString(),
                score: question.score
            });
        }
    });

    const scoreSummary = document.createElement('div');
    scoreSummary.classList.add('score-summary');
    scoreSummary.innerHTML = `You got <span>${score}</span> out of <span>${state.quizQuestions.length}</span> correct!`;
    resultsContainer.insertBefore(scoreSummary, resultsContainer.firstChild);

    if (isPartial) {
        // List of not answered questions
        const notAnswered = state.quizQuestions.slice(state.userAnswers.length);
        if (notAnswered.length > 0) {
            const notAnsweredSection = document.createElement('div');
            notAnsweredSection.classList.add('review-item');
            notAnsweredSection.innerHTML = `
                <h3>Unanswered Questions (${notAnswered.length})</h3>
                <ul>
                    ${notAnswered.map((q, idx) => `<li>${state.userAnswers.length + idx + 1}. ${q.questionText}</li>`).join('')}
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

    // Save updated data to localStorage
    saveDataToLocalStorage();
}

// Function to handle resuming a quiz in progress
export function showCurrentQuiz() {
    if (state.quizInProgress && state.quizQuestions && state.quizQuestions.length > 0) {
        showQuestion();
    } else {
        showMainUserMenu();
    }
}
