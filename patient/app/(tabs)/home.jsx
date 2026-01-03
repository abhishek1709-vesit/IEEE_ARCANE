import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useDailyCheckInStatus } from '../../hooks/useDailyCheckInStatus';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HeartPulse, CalendarCheck, ChevronRight, Star, Activity, Mic2, BarChart3, Clock } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const bottomPadding = insets.bottom > 0 ? insets.bottom : 24;

  const { checkInCompleted, isLoading, error, refreshCheckInStatus } =
    useDailyCheckInStatus();

  const handleStartCheckIn = () => {
    router.push('/DailyCheckInScreen');
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-4">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-base text-slate-500 font-medium">
          Analyzing your recovery...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-6">
        <View className="bg-red-50 p-6 rounded-[32px] items-center border border-red-100">
          <Text className="text-red-600 text-center font-medium mb-4">{error}</Text>
          <TouchableOpacity
            onPress={refreshCheckInStatus}
            className="bg-red-500 px-8 py-3 rounded-2xl shadow-sm"
          >
            <Text className="text-white font-bold">Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      {/* Updated Header - Matches Medication/Information Tabs */}
      <View
        style={{ paddingTop: insets.top + 20 }}
        className="px-6 pb-12 bg-blue-600 rounded-b-[40px] shadow-lg shadow-blue-200"
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-3xl font-bold text-white">
              Recovery
            </Text>
            <Text className="text-blue-100 text-sm mt-1">
              Your daily health journey
            </Text>
          </View>
          <View className="bg-white/20 p-3 rounded-2xl">
            <HeartPulse size={28} color="#ffffff" />
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 40,
          paddingBottom: bottomPadding + 40,
        }}
      >
        {/* Main Action Card - Floating above the scroll view slightly */}
        <View 
          style={{ elevation: 4 }}
          className="bg-white rounded-[32px] p-6 shadow-xl shadow-slate-200 border border-slate-100 -mt-6 mb-6"
        >
          <View className="flex-row justify-between items-start mb-4">
            <View>
              <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-[2px] mb-1">
                Current Status
              </Text>
              <Text className="text-slate-900 text-xl font-bold">Daily Check-In</Text>
            </View>
            <View className={`p-2.5 rounded-2xl ${checkInCompleted ? 'bg-green-100' : 'bg-orange-100'}`}>
              <CalendarCheck size={24} color={checkInCompleted ? '#10b981' : '#f59e0b'} />
            </View>
          </View>

          {!checkInCompleted ? (
            <View>
              <Text className="text-slate-500 text-[15px] leading-6 mb-6">
                Your recovery data is incomplete for today. Share how you're feeling to get personalized insights.
              </Text>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleStartCheckIn}
                className="bg-blue-600 flex-row items-center justify-center py-4 rounded-2xl shadow-lg shadow-blue-200"
              >
                <Text className="text-white font-bold text-lg mr-2">Start Session</Text>
                <ChevronRight size={20} color="white" />
              </TouchableOpacity>

              <View className="flex-row justify-between mt-6 pt-6 border-t border-slate-50">
                <View className="items-center flex-1">
                  <Mic2 size={18} color="#94a3b8" />
                  <Text className="text-slate-400 text-[10px] mt-1 font-bold uppercase">Voice</Text>
                </View>
                <View className="items-center flex-1 border-x border-slate-100">
                  <Activity size={18} color="#94a3b8" />
                  <Text className="text-slate-400 text-[10px] mt-1 font-bold uppercase">Stats</Text>
                </View>
                <View className="items-center flex-1">
                  <Clock size={18} color="#94a3b8" />
                  <Text className="text-slate-400 text-[10px] mt-1 font-bold uppercase">3 Mins</Text>
                </View>
              </View>
            </View>
          ) : (
            <View className="bg-green-50 border border-green-100 rounded-[24px] p-5">
              <View className="flex-row items-center mb-3">
                <View className="bg-green-500 rounded-full p-1 mr-3">
                  <Star size={14} color="white" fill="white" />
                </View>
                <Text className="text-green-800 font-bold">Daily Goal Reached</Text>
              </View>
              <Text className="text-green-700/80 text-sm leading-5">
                Excellent! You've logged your vitals and recovery markers. See you tomorrow!
              </Text>
            </View>
          )}
        </View>

        {/* Analytics/Progress Section */}
        <Text className="text-slate-900 text-lg font-bold mb-4 ml-1">Insights & Activity</Text>
        
        <View className="flex-row justify-between">
          <View className="bg-white rounded-[28px] p-5 w-[48%] shadow-sm shadow-slate-200 border border-slate-100">
            <View className="bg-purple-100 self-start p-2.5 rounded-xl mb-3">
              <BarChart3 size={20} color="#8b5cf6" />
            </View>
            <Text className="text-slate-900 font-bold text-base">Trends</Text>
            <Text className="text-slate-500 text-xs mt-1 leading-4">Weekly progress looks stable.</Text>
          </View>

          <View className="bg-white rounded-[28px] p-5 w-[48%] shadow-sm shadow-slate-200 border border-slate-100">
            <View className="bg-rose-100 self-start p-2.5 rounded-xl mb-3">
              <Activity size={20} color="#f43f5e" />
            </View>
            <Text className="text-slate-900 font-bold text-base">Vitals</Text>
            <Text className="text-slate-500 text-xs mt-1 leading-4">Consistency is key to recovery.</Text>
          </View>
        </View>

        {/* Small Tip Card */}
        <TouchableOpacity 
          activeOpacity={0.9}
          className="mt-6 bg-slate-900 rounded-[28px] p-6 flex-row items-center shadow-lg shadow-slate-400"
        >
          <View className="flex-1">
            <Text className="text-white font-bold text-base mb-1">Recovery Tip</Text>
            <Text className="text-slate-400 text-xs leading-4">Proper hydration speeds up muscle recovery by up to 20%.</Text>
          </View>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}