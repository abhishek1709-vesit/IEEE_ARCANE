import React, { useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Animated,
} from "react-native";
import { useDailyCheckIn } from "../hooks/useDailyCheckIn";
import { SafeAreaView } from "react-native-safe-area-context";
import { DAILY_CHECKIN_QUESTIONS } from "../config/questions";
import { cancelDailyCheckInReminder } from "../utils/notifications";
import { useRouter } from 'expo-router';

const DailyCheckInScreen = () => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

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

  // Initialize check-in and animate entrance
  useEffect(() => {
    initializeCheckIn();
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [initializeCheckIn]);

  // Animate on question change
  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentQuestionIndex]);

  const handleChoiceAnswer = (value) => {
    if (currentQuestion) {
      handleAnswer(currentQuestion.id, value);
    }
  };

  const handleTextAnswer = (text) => {
    if (currentQuestion) {
      handleAnswer(currentQuestion.id, text, text);
    }
  };

  const handleNext = () => {
    if (isCurrentQuestionAnswered) {
      goToNextQuestion();
    }
  };

  const handleSubmit = async () => {
    await submitCheckIn();
    await cancelDailyCheckInReminder();
  };

  // Loading state with elegant spinner
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center px-5">
          <View className="w-20 h-20 rounded-full bg-blue-50 justify-center items-center mb-6">
            <ActivityIndicator size="large" color="#5B8DEF" />
          </View>
          <Text className="text-xl font-semibold text-gray-800 mb-2">
            Preparing your check-in...
          </Text>
          <Text className="text-base text-gray-600">Just a moment</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state with retry option
  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center px-5">
          <View className="w-20 h-20 rounded-full bg-red-50 justify-center items-center mb-6">
            <Text className="text-4xl">⚠️</Text>
          </View>
          <Text className="text-2xl font-bold text-gray-800 mb-3">Oops!</Text>
          <Text className="text-base text-red-600 text-center mb-8 px-5">
            {error}
          </Text>
          <TouchableOpacity
            onPress={initializeCheckIn}
            className="bg-blue-500 px-8 py-3.5 rounded-xl shadow-lg active:opacity-80"
            activeOpacity={0.8}
          >
            <Text className="text-white text-base font-semibold">Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Summary/completion state
  if (summary) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <ScrollView 
          contentContainerClassName="flex-grow justify-center p-5"
          showsVerticalScrollIndicator={false}
        >
          <View className="items-center">
            <View className="w-20 h-20 rounded-full bg-green-100 justify-center items-center mb-6">
              <Text className="text-4xl font-bold text-green-800">✓</Text>
            </View>
            
            <Text className="text-3xl font-bold text-gray-800 mb-2">
              Check-In Complete!
            </Text>
            <Text className="text-base text-gray-600 mb-8">Great work today</Text>

            <View className="w-full bg-white rounded-2xl p-5 mb-4 shadow-sm">
              <Text className="text-sm font-semibold text-blue-500 mb-3 uppercase tracking-wider">
                Your Recovery Summary
              </Text>
              <Text className="text-base text-gray-800 leading-6">
                {summary.summary}
              </Text>
            </View>

            <View className="w-full bg-blue-50 rounded-2xl p-5 mb-8 border-l-4 border-blue-500">
              <Text className="text-sm font-semibold text-blue-800 mb-3 uppercase tracking-wider">
                Today's Reassurance
              </Text>
              <Text className="text-base text-gray-800 italic leading-6">
                "{summary.reassurance}"
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => {
                router.push("/(tabs)/home");
              }}
              className="w-full bg-blue-500 py-4 rounded-xl shadow-lg active:opacity-80"
              activeOpacity={0.8}
            >
              <Text className="text-white text-lg font-semibold text-center">
                Continue
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Main check-in interface
  const progress = ((currentQuestionIndex + 1) / DAILY_CHECKIN_QUESTIONS.length) * 100;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView 
        contentContainerClassName="flex-grow p-5"
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View className="mb-6">
          <View className="flex-row justify-between items-start mb-5">
            <View>
              <Text className="text-3xl font-bold text-gray-800 mb-1">
                Daily Check-In
              </Text>
              <Text className="text-base text-gray-600 font-medium">
                Question {currentQuestionIndex + 1} of {DAILY_CHECKIN_QUESTIONS.length}
              </Text>
            </View>
            <TouchableOpacity
              onPress={toggleMute}
              className="w-12 h-12 rounded-full bg-white justify-center items-center shadow-sm active:opacity-70"
              activeOpacity={0.7}
            >
              <Text className="text-2xl">
                {isMuted ? "🔇" : isTTSReady ? "🔊" : "🔈"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Progress Bar */}
          <View className="flex-row items-center">
            <View className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden mr-3">
              <View 
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </View>
            <Text className="text-sm font-semibold text-blue-500 min-w-[45px] text-right">
              {Math.round(progress)}%
            </Text>
          </View>
        </View>

        {/* Question Card */}
        <Animated.View 
          className="bg-white rounded-2xl p-6 mb-6 shadow-md"
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <Text className="text-2xl font-semibold text-gray-800 leading-8 mb-5">
            {currentQuestion?.question}
          </Text>

          {/* Re-speak button */}
          <TouchableOpacity
            onPress={speakCurrentQuestion}
            disabled={!isTTSReady || isMuted}
            className="self-start mb-6 active:opacity-70"
            activeOpacity={0.7}
          >
            <Text 
              className={`text-[15px] text-blue-500 font-medium ${
                (!isTTSReady || isMuted) ? 'opacity-40' : ''
              }`}
            >
              🔊 Tap to hear again
            </Text>
          </TouchableOpacity>

          {/* Answer Section */}
          <View className="mt-2">
            {currentQuestion?.type === "choice" && (
              <View className="w-full">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = answers[currentQuestion.id]?.value === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      onPress={() => handleChoiceAnswer(option.value)}
                      className={`flex-row items-center bg-gray-50 border-2 rounded-xl p-4 ${
                        isSelected 
                          ? 'bg-blue-50 border-blue-500' 
                          : 'border-gray-200'
                      } ${index > 0 ? 'mt-3' : ''}`}
                      activeOpacity={0.7}
                    >
                      <View className={`w-6 h-6 rounded-full border-2 mr-3 justify-center items-center ${
                        isSelected ? 'border-blue-500' : 'border-gray-300'
                      }`}>
                        {isSelected && (
                          <View className="w-3 h-3 rounded-full bg-blue-500" />
                        )}
                      </View>
                      <Text className={`flex-1 text-[17px] font-medium ${
                        isSelected ? 'text-blue-900 font-semibold' : 'text-gray-800'
                      }`}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {currentQuestion?.type === "text" && (
              <TextInput
                multiline
                numberOfLines={4}
                onChangeText={handleTextAnswer}
                value={answers[currentQuestion.id]?.value || ""}
                placeholder="Share your thoughts here..."
                placeholderTextColor="#A0AEC0"
                className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 text-[17px] text-gray-800 min-h-[120px]"
                textAlignVertical="top"
              />
            )}
          </View>
        </Animated.View>

        {/* Navigation Buttons */}
        <View className="flex gap-y-3">
          {!isFirstQuestion && (
            <TouchableOpacity
              onPress={goToPreviousQuestion}
              className="bg-white py-4 rounded-xl border-2 border-gray-200 active:opacity-70"
              activeOpacity={0.7}
            >
              <Text className="text-gray-700 text-base font-semibold text-center">
                ← Back
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={skipQuestion}
            className="bg-yellow-50 py-4 rounded-xl border-2 border-yellow-200 active:opacity-70"
            activeOpacity={0.7}
          >
            <Text className="text-yellow-900 text-base font-semibold text-center">
              Skip Question
            </Text>
          </TouchableOpacity>

          {isLastQuestion ? (
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting || !isCheckInComplete}
              className={`py-4 rounded-xl shadow-lg ${
                isSubmitting || !isCheckInComplete
                  ? 'bg-gray-400'
                  : 'bg-green-500 active:opacity-80'
              }`}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-white text-base font-semibold text-center">
                  Submit Check-In
                </Text>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleNext}
              disabled={!isCurrentQuestionAnswered}
              className={`py-4 rounded-xl shadow-lg ${
                !isCurrentQuestionAnswered
                  ? 'bg-gray-400'
                  : 'bg-blue-500 active:opacity-80'
              }`}
              activeOpacity={0.8}
            >
              <Text className="text-white text-base font-semibold text-center">
                Next →
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DailyCheckInScreen;