import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useDailyCheckInStatus } from '../../hooks/useDailyCheckInStatus';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HeartPulse, CalendarCheck, Info } from 'lucide-react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { checkInCompleted, isLoading, error, refreshCheckInStatus } = useDailyCheckInStatus();

  const handleStartCheckIn = () => {
    router.push('/DailyCheckInScreen');
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 p-4">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-lg text-gray-600">Checking your daily check-in status...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 p-4">
        <Text className="text-red-500 text-lg mb-4">{error}</Text>
        <TouchableOpacity
          onPress={refreshCheckInStatus}
          className="bg-blue-500 px-6 py-3 rounded-lg"
        >
          <Text className="text-white text-lg">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View
        style={{ paddingTop: insets.top + 16 }}
        className="px-6 pb-6 bg-blue-500"
      >
        <View className="flex-row items-center mb-2">
          <View className="bg-white p-2 rounded-full mr-3">
            <HeartPulse size={24} color="#3b82f6" />
          </View>
          <Text className="text-2xl font-bold text-white">Recovery Dashboard</Text>
        </View>
        <Text className="text-blue-50 text-sm">Your daily health journey</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: tabBarHeight + 24,
        }}
      >
        {/* Daily Check-In Section */}
        <View className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <View className="flex-row items-center mb-3">
            <View className="bg-blue-50 p-1.5 rounded-lg mr-2">
              <CalendarCheck size={18} color="#3b82f6" />
            </View>
            <Text className="text-gray-800 font-semibold text-sm">Daily Health Check-In</Text>
          </View>

          {!checkInCompleted ? (
            <View>
              <Text className="text-gray-600 text-sm mb-3">
                Complete your daily recovery assessment to track your progress
              </Text>

              <TouchableOpacity
                onPress={handleStartCheckIn}
                className="bg-blue-500 px-6 py-3 rounded-lg mb-3"
              >
                <Text className="text-white text-center font-semibold text-base">
                  🩺 Start Today's Check-In
                </Text>
              </TouchableOpacity>

              <View className="bg-blue-50 rounded-lg p-3">
                <Text className="text-blue-700 text-xs font-semibold mb-1">
                  WHAT TO EXPECT:
                </Text>
                <Text className="text-blue-600 text-xs">
                  • 10 quick questions about your recovery{'\n'}
                  • Takes about 2-3 minutes{'\n'}
                  • Voice-guided experience{'\n'}
                  • Personalized recovery summary
                </Text>
              </View>
            </View>
          ) : (
            <View className="bg-green-50 rounded-lg p-3 border border-green-100">
              <View className="flex-row items-center mb-2">
                <View className="bg-green-500 p-1 rounded-full mr-2 w-5 h-5 items-center justify-center">
                  <Text className="text-white text-xs font-bold">✓</Text>
                </View>
                <Text className="text-green-800 font-semibold text-sm">Check-In Completed</Text>
              </View>
              <Text className="text-green-700 text-sm mb-2">
                Great job! Your recovery progress has been recorded for today.
              </Text>
              <Text className="text-gray-600 text-xs">
                Your next check-in will be available tomorrow.
              </Text>
            </View>
          )}
        </View>

        {/* Quick Stats Section */}
        <View className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <View className="flex-row items-center mb-3">
            <View className="bg-purple-50 p-1.5 rounded-lg mr-2">
              <HeartPulse size={18} color="#9333ea" />
            </View>
            <Text className="text-gray-800 font-semibold text-sm">Your Progress</Text>
          </View>

          <View className="bg-purple-50 rounded-lg p-4">
            <Text className="text-purple-700 text-center text-sm mb-3">
              Keep up the great work!{'\n'}
              Every check-in helps track your recovery journey.
            </Text>

            <View className="flex-row justify-around">
              <View className="items-center">
                <Text className="text-purple-600 text-2xl font-bold">📅</Text>
                <Text className="text-purple-700 text-xs mt-1">Daily</Text>
                <Text className="text-purple-700 text-xs">Tracking</Text>
              </View>

              <View className="items-center">
                <Text className="text-purple-600 text-2xl font-bold">💬</Text>
                <Text className="text-purple-700 text-xs mt-1">Voice</Text>
                <Text className="text-purple-700 text-xs">Guided</Text>
              </View>

              <View className="items-center">
                <Text className="text-purple-600 text-2xl font-bold">📊</Text>
                <Text className="text-purple-700 text-xs mt-1">Progress</Text>
                <Text className="text-purple-700 text-xs">Insights</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Tips Section */}
        <View className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <View className="flex-row items-center mb-3">
            <View className="bg-green-50 p-1.5 rounded-lg mr-2">
              <Info size={18} color="#10b981" />
            </View>
            <Text className="text-gray-800 font-semibold text-sm">Recovery Tips</Text>
          </View>

          <View className="bg-green-50 rounded-lg p-3 border border-green-100">
            <Text className="text-green-700 text-sm font-semibold mb-2">
              TODAY'S RECOVERY TIP:
            </Text>
            <Text className="text-green-800 text-sm leading-5">
              🌱 {"Every small step in your recovery is progress. "}{'\n'}
              💧 {"Stay hydrated and follow your medication schedule."}{'\n'}
              😊 {"Be patient and kind to yourself - healing takes time."}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
