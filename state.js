// state.js

// Global state object
export const state = {
    data: {
        users: [],
        topics: [],
        questions: []
    },
    currentQuestionIndex: 0,
    userAnswers: [],
    quizInProgress: false,
    activeUserId: null,
    currentSection: 'dashboard'
};
