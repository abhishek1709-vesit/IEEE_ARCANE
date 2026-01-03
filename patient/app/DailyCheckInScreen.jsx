import React, { useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  StyleSheet,
} from "react-native";
import { useDailyCheckIn } from "../hooks/useDailyCheckIn";
import { SafeAreaView } from "react-native-safe-area-context";
import { DAILY_CHECKIN_QUESTIONS } from "../config/questions";
import { testTTS } from "../utils/elevenlabsTTS";
import { useRouter } from "expo-router";

const DailyCheckInScreen = () => {
  const router = useRouter();

  const {
    currentQuestion,
    currentQuestionIndex,
    answers,
    isLoading,
    isSubmitting,
    summary,
    error,
    isTTSReady,
    isMuted,
    isFirstQuestion,
    isLastQuestion,
    isCheckInComplete,
    isCurrentQuestionAnswered,
    initializeCheckIn,
    handleAnswer,
    goToNextQuestion,
    goToPreviousQuestion,
    skipQuestion,
    submitCheckIn,
    toggleMute,
    speakCurrentQuestion,
  } = useDailyCheckIn();

  // Initialize check-in when component mounts
  useEffect(() => {
    initializeCheckIn();
  }, [initializeCheckIn]);

  // Handle answer selection for choice questions
  const handleChoiceAnswer = (value) => {
    if (currentQuestion) {
      handleAnswer(currentQuestion.id, value);
    }
  };

  // Handle text input for text questions
  const handleTextAnswer = (text) => {
    if (currentQuestion) {
      handleAnswer(currentQuestion.id, text, text);
    }
  };

  // Handle next button press
  const handleNext = () => {
    if (isCurrentQuestionAnswered) {
      goToNextQuestion();
    }
  };

  // Handle submit
  const handleSubmit = async () => {
    await submitCheckIn();
  };

  // Render loading state
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text className="mt-4 text-lg text-gray-600">
          Loading your daily check-in...
        </Text>
      </SafeAreaView>
    );
  }

  // Render error state
  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center px-4">
        <Text className="text-red-500 text-lg mb-4">{error}</Text>
        <TouchableOpacity
          onPress={initializeCheckIn}
          className="bg-blue-500 px-6 py-3 rounded-lg"
        >
          <Text className="text-white text-lg">Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Render summary state
  if (summary) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center px-6">
        <View className="bg-green-50 p-6 rounded-xl w-full max-w-md">
          <Text className="text-green-800 text-xl font-semibold mb-4">
            Daily Check-In Complete!
          </Text>

          <Text className="text-green-700 text-lg mb-4">
            Your Recovery Summary:
          </Text>
          <Text className="text-gray-700 text-base mb-6">
            {summary.summary}
          </Text>

          <Text className="text-green-700 text-lg mb-2">
            Today's Reassurance:
          </Text>
          <Text className="text-gray-700 text-base italic">
            "{summary.reassurance}"
          </Text>

          <TouchableOpacity
            onPress={() => router.replace("/(tabs)/home")}
            className="bg-blue-500 px-6 py-3 rounded-lg mt-8"
          >
            <Text className="text-white text-lg text-center">
              Continue to Home
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Render main check-in interface
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-between p-4">
          {/* Header with progress and mute button */}
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-blue-600 text-lg font-medium">
              Question {currentQuestionIndex + 1} of{" "}
              {DAILY_CHECKIN_QUESTIONS.length}
            </Text>
            <TouchableOpacity
              onPress={toggleMute}
              className="p-2 bg-gray-100 rounded-full"
            >
              <Text className="text-gray-600">
                {isMuted ? "🔇" : isTTSReady ? "🔊" : "🔈"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Question display */}
          <View className="mb-8">
            <Text className="text-2xl font-semibold text-gray-800 mb-4">
              {currentQuestion?.question}
            </Text>

            {/* Re-speak button */}
            <TouchableOpacity
              onPress={speakCurrentQuestion}
              disabled={!isTTSReady || isMuted}
              className="mb-2"
            >
              <Text
                className={`text-blue-600 text-base ${
                  !isTTSReady || isMuted ? "opacity-50" : ""
                }`}
              >
                🔊 Tap to hear question again
              </Text>
            </TouchableOpacity>

            {/* Test TTS button */}
            <TouchableOpacity onPress={testTTS} className="mb-6">
              <Text className="text-green-600 text-base">
                🧪 Test TTS System
              </Text>
            </TouchableOpacity>

            {/* Answer options */}
            {currentQuestion?.type === "choice" && (
              <View className="space-y-3">
                {currentQuestion.options.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => handleChoiceAnswer(option.value)}
                    className={`p-4 rounded-lg border-2 ${
                      answers[currentQuestion.id]?.value === option.value
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <Text className="text-lg text-gray-700">
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {currentQuestion?.type === "text" && (
              <TextInput
                multiline
                numberOfLines={4}
                onChangeText={handleTextAnswer}
                value={answers[currentQuestion.id]?.value || ""}
                placeholder="Type your answer here..."
                className="border border-gray-300 rounded-lg p-4 text-lg"
              />
            )}
          </View>

          {/* Navigation buttons */}
          <View className="space-y-3">
            {!isFirstQuestion && (
              <TouchableOpacity
                onPress={goToPreviousQuestion}
                className="bg-gray-200 px-6 py-3 rounded-lg"
              >
                <Text className="text-gray-700 text-lg text-center">Back</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={skipQuestion}
              className="bg-yellow-100 px-6 py-3 rounded-lg"
            >
              <Text className="text-yellow-800 text-lg text-center">
                Skip Question
              </Text>
            </TouchableOpacity>

            {isLastQuestion ? (
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isSubmitting || !isCheckInComplete}
                className={`px-6 py-3 rounded-lg ${
                  isSubmitting || !isCheckInComplete
                    ? "bg-blue-300"
                    : "bg-blue-500"
                }`}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="text-white text-lg text-center">
                    Submit Check-In
                  </Text>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={handleNext}
                disabled={!isCurrentQuestionAnswered}
                className={`px-6 py-3 rounded-lg ${
                  !isCurrentQuestionAnswered ? "bg-blue-300" : "bg-blue-500"
                }`}
              >
                <Text className="text-white text-lg text-center">
                  Next Question
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DailyCheckInScreen;
