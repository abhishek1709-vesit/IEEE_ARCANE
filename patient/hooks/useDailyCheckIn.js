import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { DAILY_CHECKIN_QUESTIONS } from '../config/questions';
import { getToken } from '../services/authService';
import { speakText, fallbackSpeak, initTTS, cleanupTTS } from '../utils/elevenlabsTTS';
import { API_BASE_URL } from '../config/api';

export const useDailyCheckIn = () => {
    const router = useRouter();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [summary, setSummary] = useState(null);
    const [error, setError] = useState(null);
    const [isTTSReady, setIsTTSReady] = useState(false);
    const [isMuted, setIsMuted] = useState(false);

    // Initialize the check-in process
    const initializeCheckIn = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Check if today's check-in already exists
            const token = await getToken();
            if (!token) {
                router.replace('/login');
                return;
            }


            const response = await fetch(`${API_BASE_URL}/api/checkin/today`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to check today\'s check-in status');
            }

            const data = await response.json();

            if (data.exists) {
                // Today's check-in already completed, redirect to home
                router.replace('/(tabs)/home');
                return;
            }

            // Initialize TTS
            const ttsReady = await initTTS();
            setIsTTSReady(ttsReady);

            // Start with first question
            setCurrentQuestionIndex(0);
            setIsLoading(false);

        } catch (error) {
            console.error('Error initializing check-in:', error);
            setError('Failed to initialize check-in. Please try again.');
            setIsLoading(false);
        }
    }, [router]);

    // Speak the current question
    const speakCurrentQuestion = useCallback(async () => {
        if (!isTTSReady || isMuted) return;

        const currentQuestion = DAILY_CHECKIN_QUESTIONS[currentQuestionIndex];
        if (currentQuestion) {
            try {
                await speakText(currentQuestion.voicePrompt);
            } catch (error) {
                await fallbackSpeak(currentQuestion.voicePrompt);
            }
        }
    }, [currentQuestionIndex, isTTSReady, isMuted]);

    // Handle answer selection
    const handleAnswer = useCallback((questionId, value, rawText = '') => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: {
                questionId,
                answerType: DAILY_CHECKIN_QUESTIONS.find(q => q.id === questionId)?.answerType || 'choice',
                value,
                rawText: rawText || (typeof value === 'string' ? value : '')
            }
        }));
    }, []);

    // Move to next question
    const goToNextQuestion = useCallback(() => {
        if (currentQuestionIndex < DAILY_CHECKIN_QUESTIONS.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    }, [currentQuestionIndex]);

    // Move to previous question
    const goToPreviousQuestion = useCallback(() => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    }, [currentQuestionIndex]);

    // Skip current question
    const skipQuestion = useCallback(() => {
        // Don't add an answer for skipped questions
        goToNextQuestion();
    }, [goToNextQuestion]);

    // Submit all answers
    const submitCheckIn = useCallback(async () => {
        try {
            setIsSubmitting(true);
            setError(null);

            const token = await getToken();
            if (!token) {
                throw new Error('Not authenticated');
            }


            // Get today's date in YYYY-MM-DD format
            const today = new Date();
            const todayDateString = today.toISOString().split('T')[0];

            // Convert answers array to the format expected by backend
            // Filter out skipped questions and ensure text questions have values
            const answersArray = Object.values(answers).filter(answer => {
                // Include all answered questions
                if (answer.value !== null) {
                    // For text questions, ensure value is a string
                    if (typeof answer.value !== 'string' && answer.answerType === 'text') {
                        answer.value = '';
                    }
                    return true;
                }
                return false;
            });

            const response = await fetch(`${API_BASE_URL}/api/checkin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    date: todayDateString,
                    answers: answersArray
                })
            });


            if (!response.ok) {
                const errorText = await response.text();
                console.error('Check-in submission failed:', {
                    status: response.status,
                    statusText: response.statusText,
                    responseBody: errorText
                });
                throw new Error(`Failed to submit check-in: ${response.status} ${response.statusText} - ${errorText}`);
            }

            const result = await response.json();

            // Generate summary
            const summaryResponse = await fetch(`${API_BASE_URL}/api/checkin/summary`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    date: todayDateString
                })
            });

            if (!summaryResponse.ok) {
                throw new Error('Failed to generate summary');
            }

            const summaryData = await summaryResponse.json();
            setSummary(summaryData);

            // Clean up TTS
            await cleanupTTS();

        } catch (error) {
            console.error('Error submitting check-in:', error);
            setError('Failed to submit check-in. Please try again.');
            setIsSubmitting(false);
        }
    }, [answers, router]);

    // Toggle mute state
    const toggleMute = useCallback(() => {
        setIsMuted(prev => !prev);
    }, []);

    // Get current question
    const getCurrentQuestion = useCallback(() => {
        return DAILY_CHECKIN_QUESTIONS[currentQuestionIndex];
    }, [currentQuestionIndex]);

    // Check if all questions are answered
    const isCheckInComplete = useCallback(() => {
        return currentQuestionIndex === DAILY_CHECKIN_QUESTIONS.length - 1 &&
               Object.keys(answers).length > 0;
    }, [currentQuestionIndex, answers]);

    // Check if current question is answered
    const isCurrentQuestionAnswered = useCallback(() => {
        const currentQuestion = getCurrentQuestion();
        return currentQuestion && answers[currentQuestion.id];
    }, [answers, getCurrentQuestion]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            cleanupTTS();
        };
    }, []);

    // Speak question when it changes
    useEffect(() => {
        if (isTTSReady && !isMuted) {
            speakCurrentQuestion();
        }
    }, [currentQuestionIndex, isTTSReady, isMuted, speakCurrentQuestion]);

    return {
        currentQuestionIndex,
        answers,
        isLoading,
        isSubmitting,
        summary,
        error,
        isTTSReady,
        isMuted,
        currentQuestion: getCurrentQuestion(),
        isFirstQuestion: currentQuestionIndex === 0,
        isLastQuestion: currentQuestionIndex === DAILY_CHECKIN_QUESTIONS.length - 1,
        isCheckInComplete: isCheckInComplete(),
        isCurrentQuestionAnswered: isCurrentQuestionAnswered(),
        initializeCheckIn,
        handleAnswer,
        goToNextQuestion,
        goToPreviousQuestion,
        skipQuestion,
        submitCheckIn,
        toggleMute,
        speakCurrentQuestion
    };
};
