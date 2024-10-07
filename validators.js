// validators.js

// Function to validate the structure of loaded JSON data
export function validateJSONStructure(jsonData) {
    if (!jsonData) return false;

    const hasUsers = Array.isArray(jsonData.users);
    const hasTopics = Array.isArray(jsonData.topics);
    const hasQuestions = Array.isArray(jsonData.questions);

    if (!hasUsers || !hasTopics || !hasQuestions) return false;

    // Validate users
    const usersValid = jsonData.users.every(user =>
        typeof user.userId === 'string' &&
        typeof user.username === 'string' &&
        user.learningProgress &&
        Array.isArray(user.learningProgress.questionsAnsweredCorrectly) &&
        Array.isArray(user.learningProgress.questionsAnsweredWrong) &&
        Array.isArray(user.learningProgress.questionsNotAnswered)
    );

    // Validate topics
    const topicsValid = jsonData.topics.every(topic =>
        typeof topic.topicId === 'string' &&
        typeof topic.topicName === 'string' &&
        Array.isArray(topic.questions)
    );

    // Validate questions
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
