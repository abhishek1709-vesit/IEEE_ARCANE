import { View, Text, TextInput, Alert, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useState, useEffect } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Clock, Plus, Trash2, Bell, Pill as PillIcon, Calendar } from 'lucide-react-native';
import { createMedicineReminder, formatTime24Hour, getUserMedicines } from '../../services/medicineService';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

export default function MedicationsScreen() {
  const [medicineName, setMedicineName] = useState('');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [times, setTimes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('form');

  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  const handleAddTime = () => {
    setShowTimePicker(true);
  };

  const handleTimeChange = (event, selectedDate) => {
    setShowTimePicker(false);
    if (selectedDate) {
      setSelectedTime(selectedDate);
      const formattedTime = formatTime24Hour(selectedDate);
      setTimes([...times, formattedTime]);
    }
  };

  const handleRemoveTime = (index) => {
    const updatedTimes = [...times];
    updatedTimes.splice(index, 1);
    setTimes(updatedTimes);
  };

  const handleSubmit = async () => {
    if (!medicineName.trim()) {
      Alert.alert('Error', 'Please enter medicine name');
      return;
    }

    if (times.length === 0) {
      Alert.alert('Error', 'Please add at least one time');
      return;
    }

    setLoading(true);
    try {
      const result = await createMedicineReminder(medicineName, times);

      if (result.success) {
        Alert.alert('Success', 'Medicine reminder created successfully!');
        setMedicineName('');
        setTimes([]);
        fetchMedicines();
        setActiveTab('reminders');
      } else {
        Alert.alert('Error', result.error || 'Failed to create reminder');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while creating the reminder');
      console.error('Medicine creation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTimeRemaining = (timeString) => {
    const now = new Date();
    const [hours, minutes] = timeString.split(':').map(Number);
    const targetTime = new Date();
    targetTime.setHours(hours, minutes, 0, 0);

    if (targetTime < now) {
      targetTime.setDate(targetTime.getDate() + 1);
    }

    const diffInMs = targetTime - now;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInMinutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffInHours > 0) {
      return `${diffInHours}h ${diffInMinutes}m`;
    } else {
      return `${diffInMinutes}m`;
    }
  };

  const getNextTime = (timesArray) => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    for (const time of timesArray) {
      const [hours, minutes] = time.split(':').map(Number);
      const timeInMinutes = hours * 60 + minutes;

      if (timeInMinutes > currentTime) {
        return time;
      }
    }

    return timesArray[0];
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      setRefreshing(true);
      const result = await getUserMedicines();

      if (result.success) {
        setMedicines(result.data);
      }
    } catch (error) {
      console.error('Error fetching medicines:', error);
      Alert.alert('Error', 'Failed to fetch medicine reminders');
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    fetchMedicines();
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View 
        style={{ paddingTop: insets.top + 16 }}
        className="px-6 pb-6 bg-blue-500"
      >
        <View className="flex-row items-center mb-2">
          <View className="bg-white p-2 rounded-full mr-3">
            <PillIcon size={24} color="#3b82f6" />
          </View>
          <Text className="text-2xl font-bold text-white">Medications</Text>
        </View>
        <Text className="text-blue-50 text-sm">Stay on track with your health</Text>
      </View>

      {/* Tab Switcher */}
      <View className="px-6 -mt-4 mb-4">
        <View className="bg-white rounded-xl shadow-sm p-1 flex-row">
          <TouchableOpacity
            className={`flex-1 py-3.5 rounded-lg items-center ${
              activeTab === 'form' ? 'bg-blue-500' : 'bg-transparent'
            }`}
            onPress={() => setActiveTab('form')}
          >
            <Text
              className={`font-semibold text-sm ${
                activeTab === 'form' ? 'text-white' : 'text-gray-600'
              }`}
            >
              Add New
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-3.5 rounded-lg items-center ${
              activeTab === 'reminders' ? 'bg-blue-500' : 'bg-transparent'
            }`}
            onPress={() => setActiveTab('reminders')}
          >
            <Text
              className={`font-semibold text-sm ${
                activeTab === 'reminders' ? 'text-white' : 'text-gray-600'
              }`}
            >
              My List
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: tabBarHeight + 24,
        }}
        refreshControl={
          activeTab === 'reminders' ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#3b82f6"
            />
          ) : undefined
        }
      >
        {activeTab === 'form' ? (
          <View>
            {/* Medicine Name Card */}
            <View className="bg-white rounded-xl shadow-sm p-4 mb-4">
              <View className="flex-row items-center mb-2">
                <View className="bg-blue-50 p-1.5 rounded-lg mr-2">
                  <PillIcon size={18} color="#3b82f6" />
                </View>
                <Text className="text-gray-800 font-semibold text-sm">Medicine Name</Text>
              </View>
              <TextInput
                className="bg-gray-50 rounded-lg p-3 text-gray-800 text-base border border-gray-200"
                placeholder="e.g., Aspirin, Vitamin D"
                placeholderTextColor="#9ca3af"
                value={medicineName}
                onChangeText={setMedicineName}
              />
            </View>

            {/* Times Card */}
            <View className="bg-white rounded-xl shadow-sm p-4 mb-4">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  <View className="bg-purple-50 p-1.5 rounded-lg mr-2">
                    <Clock size={18} color="#9333ea" />
                  </View>
                  <Text className="text-gray-800 font-semibold text-sm">Reminder Times</Text>
                </View>
                <Text className="text-gray-400 text-xs">{times.length} added</Text>
              </View>

              {times.length > 0 && (
                <View className="mb-3 space-y-2">
                  {times.map((time, index) => (
                    <View
                      key={index}
                      className="flex-row items-center justify-between bg-blue-50 rounded-lg p-3"
                    >
                      <View className="flex-row items-center">
                        <Bell size={16} color="#3b82f6" />
                        <Text className="text-gray-800 font-semibold text-base ml-2">{time}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleRemoveTime(index)}
                        className="bg-red-50 p-1.5 rounded-lg"
                      >
                        <Trash2 size={16} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              <TouchableOpacity
                onPress={handleAddTime}
                className="bg-white border-2 border-dashed border-blue-300 rounded-lg p-3 flex-row items-center justify-center"
              >
                <Plus size={18} color="#3b82f6" />
                <Text className="text-blue-600 font-semibold ml-2 text-sm">Add Time</Text>
              </TouchableOpacity>

              {showTimePicker && (
                <DateTimePicker
                  value={selectedTime}
                  mode="time"
                  is24Hour={true}
                  display="default"
                  onChange={handleTimeChange}
                />
              )}
            </View>

            {/* Create Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              className={`rounded-xl p-4 shadow-sm mb-4 ${
                loading ? 'bg-gray-400' : 'bg-green-500'
              }`}
            >
              <Text className="text-white text-center font-bold text-base">
                {loading ? 'Creating...' : '✓ Create Reminder'}
              </Text>
            </TouchableOpacity>

            {/* Info Card */}
            <View className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <View className="flex-row items-center mb-2">
                <View className="bg-blue-500 p-1 rounded-full mr-2 w-5 h-5 items-center justify-center">
                  <Text className="text-white text-xs font-bold">i</Text>
                </View>
                <Text className="text-blue-800 font-semibold text-sm">Quick Guide</Text>
              </View>
              <Text className="text-blue-700 text-sm leading-5">
                • Enter medicine name{'\n'}
                • Tap "Add Time" to set reminders{'\n'}
                • Add multiple times if needed{'\n'}
                • Hit create when ready!
              </Text>
            </View>
          </View>
        ) : (
          <View>
            {medicines.length === 0 ? (
              <View className="items-center justify-center py-16">
                <View className="bg-gray-100 p-6 rounded-full mb-4">
                  <Bell size={48} color="#9ca3af" />
                </View>
                <Text className="text-gray-600 text-lg font-semibold mb-2">No Reminders Yet</Text>
                <Text className="text-gray-400 text-center">
                  Create your first medicine reminder{'\n'}to get started
                </Text>
                <TouchableOpacity
                  onPress={() => setActiveTab('form')}
                  className="bg-blue-500 px-6 py-3 rounded-full mt-6"
                >
                  <Text className="text-white font-semibold">+ Add Reminder</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="space-y-4">
                {medicines.map((medicine, index) => {
                  const nextTime = getNextTime(medicine.times);
                  const timeRemaining = calculateTimeRemaining(nextTime);

                  return (
                    <View
                      key={index}
                      className="bg-white rounded-xl shadow-sm overflow-hidden mb-4"
                    >
                      {/* Header */}
                      <View className="bg-blue-500 p-4">
                        <View className="flex-row items-center">
                          <View className="bg-white p-1.5 rounded-lg mr-2">
                            <PillIcon size={20} color="#3b82f6" />
                          </View>
                          <Text className="text-white text-lg font-bold flex-1" numberOfLines={2}>
                            {medicine.name}
                          </Text>
                        </View>
                      </View>

                      {/* Next Dose */}
                      <View className="p-4 bg-green-50 border-b border-green-100">
                        <Text className="text-green-700 text-xs font-semibold mb-2 uppercase">
                          Next Dose
                        </Text>
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center">
                            <Clock size={18} color="#10b981" />
                            <Text className="text-gray-800 text-xl font-bold ml-2">{nextTime}</Text>
                          </View>
                          <View className="bg-green-100 px-3 py-1.5 rounded-full">
                            <Text className="text-green-700 font-semibold text-xs">
                              {timeRemaining}
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* All Times */}
                      {medicine.times.length > 1 && (
                        <View className="p-4">
                          <Text className="text-gray-500 text-xs font-semibold mb-2 uppercase">
                            All Scheduled Times
                          </Text>
                          <View className="flex-row flex-wrap gap-2">
                            {medicine.times.map((time, timeIndex) => (
                              <View
                                key={timeIndex}
                                className={`px-3 py-1.5 rounded-full ${
                                  time === nextTime
                                    ? 'bg-blue-500'
                                    : 'bg-gray-100'
                                }`}
                              >
                                <Text
                                  className={`font-semibold text-sm ${
                                    time === nextTime ? 'text-white' : 'text-gray-700'
                                  }`}
                                >
                                  {time}
                                </Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}