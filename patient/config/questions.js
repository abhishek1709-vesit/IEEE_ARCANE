// Daily recovery check-in questions configuration
// Each question has a unique ID, type, text, and answer options

export const DAILY_CHECKIN_QUESTIONS = [
    {
        id: 'overall_recovery',
        question: 'How would you rate your overall recovery today?',
        type: 'choice',
        answerType: 'choice',
        options: [
            { value: 1, label: 'Very poor' },
            { value: 2, label: 'Poor' },
            { value: 3, label: 'Fair' },
            { value: 4, label: 'Good' },
            { value: 5, label: 'Very good' }
        ],
        voicePrompt: 'How would you rate your overall recovery today? Please choose from very poor to very good.'
    },
    {
        id: 'sleep_quality',
        question: 'How was your sleep quality last night?',
        type: 'choice',
        answerType: 'choice',
        options: [
            { value: 1, label: 'Very restless' },
            { value: 2, label: 'Restless' },
            { value: 3, label: 'Average' },
            { value: 4, label: 'Restful' },
            { value: 5, label: 'Very restful' }
        ],
        voicePrompt: 'How was your sleep quality last night? Please choose from very restless to very restful.'
    },
    {
        id: 'pain_level',
        question: 'What is your current pain level? (0 = no pain, 10 = worst pain)',
        type: 'choice',
        answerType: 'choice',
        options: Array.from({ length: 11 }, (_, i) => ({
            value: i,
            label: i.toString()
        })),
        voicePrompt: 'What is your current pain level? Zero means no pain, ten means the worst pain imaginable.'
    },
    {
        id: 'compared_to_yesterday',
        question: 'Compared to yesterday, how do you feel today?',
        type: 'choice',
        answerType: 'choice',
        options: [
            { value: 'much_worse', label: 'Much worse' },
            { value: 'slightly_worse', label: 'Slightly worse' },
            { value: 'about_the_same', label: 'About the same' },
            { value: 'slightly_better', label: 'Slightly better' },
            { value: 'much_better', label: 'Much better' }
        ],
        voicePrompt: 'Compared to yesterday, how do you feel today? Please choose from much worse to much better.'
    },
    {
        id: 'medication_adherence',
        question: 'Have you taken your medications as prescribed today?',
        type: 'choice',
        answerType: 'choice',
        options: [
            { value: true, label: 'Yes, all medications' },
            { value: false, label: 'No, missed some' }
        ],
        voicePrompt: 'Have you taken your medications as prescribed today? Please choose yes or no.'
    },
    {
        id: 'warning_signs',
        question: 'Have you noticed any recovery-related warning signs today?',
        type: 'choice',
        answerType: 'choice',
        options: [
            { value: 'none', label: 'No warning signs' },
            { value: 'mild', label: 'Mild warning signs' },
            { value: 'moderate', label: 'Moderate warning signs' },
            { value: 'severe', label: 'Severe warning signs' }
        ],
        voicePrompt: 'Have you noticed any recovery-related warning signs today? Please choose from none to severe.'
    },
    {
        id: 'mobility_comfort',
        question: 'How comfortable are you with your mobility today? (0 = very uncomfortable, 10 = very comfortable)',
        type: 'choice',
        answerType: 'choice',
        options: Array.from({ length: 11 }, (_, i) => ({
            value: i,
            label: i.toString()
        })),
        voicePrompt: 'How comfortable are you with your mobility today? Zero means very uncomfortable, ten means very comfortable.'
    },
    {
        id: 'nutrition_hydration',
        question: 'How would you rate your nutrition and hydration today?',
        type: 'choice',
        answerType: 'choice',
        options: [
            { value: 1, label: 'Very poor' },
            { value: 2, label: 'Poor' },
            { value: 3, label: 'Average' },
            { value: 4, label: 'Good' },
            { value: 5, label: 'Excellent' }
        ],
        voicePrompt: 'How would you rate your nutrition and hydration today? Please choose from very poor to excellent.'
    },
    {
        id: 'emotional_state',
        question: 'How would you rate your emotional state today? (0 = very negative, 10 = very positive)',
        type: 'choice',
        answerType: 'choice',
        options: Array.from({ length: 11 }, (_, i) => ({
            value: i,
            label: i.toString()
        })),
        voicePrompt: 'How would you rate your emotional state today? Zero means very negative, ten means very positive.'
    },
    {
        id: 'open_input',
        question: 'Is there anything else you would like to share about your recovery today?',
        type: 'text',
        answerType: 'text',
        voicePrompt: 'Is there anything else you would like to share about your recovery today? You can speak or type your answer.'
    }
];

// Helper function to get question by ID
export const getQuestionById = (questionId) => {
    return DAILY_CHECKIN_QUESTIONS.find(q => q.id === questionId);
};

// Helper function to get question index by ID
export const getQuestionIndexById = (questionId) => {
    return DAILY_CHECKIN_QUESTIONS.findIndex(q => q.id === questionId);
};
