// ElevenLabs Text-to-Speech Utility
// This utility handles voice prompts for the daily check-in questions

import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import * as Speech from 'expo-speech';

// Configuration - these would come from environment variables in production
const ELEVENLABS_API_KEY = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY || '';
const VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // A friendly, calm voice suitable for healthcare
const BASE_URL = 'https://api.elevenlabs.io/v1/text-to-speech';

// Use fallback TTS for now to avoid API issues
const USE_ELEVENLABS = false;

// Sound object for audio playback
let soundObject = null;

// State tracking
let isMuted = false;
let isPlaying = false;

// Initialize the TTS system
export const initTTS = async () => {
    try {
        // For expo-speech, we don't need to set audio mode or request permissions
        // as it handles this internally
        console.log('TTS initialized successfully');
        return true;
    } catch (error) {
        console.error('Error initializing TTS:', error);
        return false;
    }
};

// Fallback TTS using device built-in speech synthesis
export const fallbackSpeak = async (text) => {
    if (isMuted || isPlaying) {
        console.log('TTS: Muted or already playing, skipping');
        return;
    }

    try {
        isPlaying = true;
        console.log('TTS: Starting speech for:', text);

        // Use SpeechSynthesis API if available (web)
        if (Platform.OS === 'web' && 'speechSynthesis' in window) {
            return new Promise((resolve) => {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.rate = 0.8; // Slightly slower for clarity
                utterance.pitch = 1;
                utterance.volume = 1;

                utterance.onend = () => {
                    isPlaying = false;
                    console.log('TTS: Web speech completed');
                    resolve();
                };

                utterance.onerror = () => {
                    isPlaying = false;
                    console.log('TTS: Web speech error');
                    resolve();
                };

                window.speechSynthesis.speak(utterance);
            });
        } else {
            // On mobile, use expo-speech for native TTS
            console.log('TTS: Using expo-speech on mobile');

            // Stop any existing speech first
            Speech.stop();

            try {
                await Speech.speak(text, {
                    language: 'en',
                    pitch: 1.2, // Slightly higher pitch for better audibility
                    rate: 0.7, // Even slower for clarity
                });
                console.log('TTS: Mobile speech completed successfully');
            } catch (error) {
                console.error('TTS: Mobile speech failed:', error);
                // Fallback to console logging if speech fails
                console.log('TTS Fallback:', text);
            } finally {
                isPlaying = false;
            }
        }
    } catch (error) {
        console.error('Error in fallback TTS:', error);
        isPlaying = false;
    }
};

// Speak text using ElevenLabs API or fallback
export const speakText = async (text) => {
    if (isMuted) {
        console.log('TTS: Muted, skipping speech');
        return;
    }

    if (isPlaying) {
        console.log('TTS: Already playing, skipping');
        return;
    }

    try {
        console.log('TTS: speakText called with:', text);
        await fallbackSpeak(text);
        console.log('TTS: speakText completed');
    } catch (error) {
        console.error('Error speaking text:', error);
        isPlaying = false;
    }
};

// Toggle mute state
export const toggleMute = () => {
    isMuted = !isMuted;
    return isMuted;
};

// Test TTS functionality
export const testTTS = async () => {
    console.log('TTS: Testing speech functionality');
    try {
        // Test with a louder, clearer message
        await fallbackSpeak('Testing text to speech. This is a test message. Can you hear me?');
        console.log('TTS: Test completed');
    } catch (error) {
        console.error('TTS: Test failed:', error);
    }
};

// Check if TTS is available
export const isTTSAvailable = () => {
    if (Platform.OS === 'web') {
        return 'speechSynthesis' in window;
    } else {
        // expo-speech is available on mobile
        return true;
    }
};

// Get current mute state
export const getMuteState = () => {
    return isMuted;
};

// Clean up resources
export const cleanupTTS = async () => {
    if (soundObject) {
        try {
            await soundObject.unloadAsync();
            soundObject = null;
        } catch (error) {
            console.error('Error cleaning up TTS:', error);
        }
    }
};
