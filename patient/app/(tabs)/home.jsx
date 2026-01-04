import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  TextInput,
  Platform,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDailyCheckInStatus } from '../../hooks/useDailyCheckInStatus';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  HeartPulse,
  CalendarCheck,
  ChevronRight,
  Star,
  Activity,
  Mic2,
  BarChart3,
  Clock,
  Stethoscope,
  ClipboardList,
  BellRing,
  Plus,
  Calendar,
  Clock4,
  Trash2
} from 'lucide-react-native';
import { scheduleDailyCheckInReminder, scheduleDoctorVisitReminder, scheduleTestVisitReminder, cancelDoctorVisitReminder, cancelTestVisitReminder } from '../../utils/notifications';
import * as Notifications from 'expo-notifications';

// Debug: Check if functions are properly imported
console.log('scheduleDailyCheckInReminder function:', typeof scheduleDailyCheckInReminder);
console.log('scheduleDoctorVisitReminder function:', typeof scheduleDoctorVisitReminder);
console.log('scheduleTestVisitReminder function:', typeof scheduleTestVisitReminder);
import DateTimePicker from '@react-native-community/datetimepicker';
import { getDoctorVisits, createDoctorVisit, deleteDoctorVisit, getTestVisits, createTestVisit, deleteTestVisit } from '../../services/visitService';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const bottomPadding = insets.bottom > 0 ? insets.bottom : 24;

  const { checkInCompleted, isLoading, error, refreshCheckInStatus } = useDailyCheckInStatus();

  // Form States
  const [doctorName, setDoctorName] = useState('');
  const [testName, setTestName] = useState('');
  const [doctorDate, setDoctorDate] = useState(new Date());
  const [doctorTime, setDoctorTime] = useState(new Date());
  const [testDate, setTestDate] = useState(new Date());
  const [testTime, setTestTime] = useState(new Date());
  const [showDoctorDatePicker, setShowDoctorDatePicker] = useState(false);
  const [showDoctorTimePicker, setShowDoctorTimePicker] = useState(false);
  const [showTestDatePicker, setShowTestDatePicker] = useState(false);
  const [showTestTimePicker, setShowTestTimePicker] = useState(false);
  const [doctorVisits, setDoctorVisits] = useState([]);
  const [testVisits, setTestVisits] = useState([]);
  const [loadingVisits, setLoadingVisits] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Refs for input fields
  const doctorNameRef = React.useRef(null);
  const testNameRef = React.useRef(null);

  const handleStartCheckIn = () => {
    router.push('/DailyCheckInScreen');
  };

  const fetchVisits = async () => {
    try {
      setLoadingVisits(true);
      const doctorResponse = await getDoctorVisits();
      const testResponse = await getTestVisits();

      // Debug logging to check date formats
      console.log('Doctor visits data:', doctorResponse.data);
      console.log('Test visits data:', testResponse.data);

      if (testResponse.data && testResponse.data.length > 0) {
        testResponse.data.forEach((visit, index) => {
          console.log(`Test visit ${index}:`, visit);
          console.log(`Test visit ${index} dateOfTest:`, visit.dateOfTest, 'Type:', typeof visit.dateOfTest);
        });
      }

      setDoctorVisits(doctorResponse.data || []);
      setTestVisits(testResponse.data || []);
    } catch (error) {
      console.error('Error fetching visits:', error);
      Alert.alert('Error', 'Failed to load visit reminders');
    } finally {
      setLoadingVisits(false);
      setRefreshing(false);
    }
  };

  const handleCreateDoctorVisit = async () => {
    if (!doctorName.trim()) {
      Alert.alert('Error', 'Please enter doctor name');
      return;
    }

    try {
      // Format date and time for API
      const formattedDate = doctorDate.toISOString().split('T')[0];
      const formattedTime = `${String(doctorTime.getHours()).padStart(2, '0')}:${String(doctorTime.getMinutes()).padStart(2, '0')}`;

      // Create the visit in the backend
      const response = await createDoctorVisit(doctorName, formattedDate, formattedTime);
      const visitId = response.data._id;

      // Schedule local notification
      await scheduleDoctorVisitReminder(
        formattedDate,
        formattedTime,
        doctorName,
        `doctor-visit-${visitId}`
      );

      // Reset form and refresh
      setDoctorName('');
      setDoctorDate(new Date());
      setDoctorTime(new Date());
      fetchVisits();
      Alert.alert('Success', 'Doctor visit reminder created successfully');
    } catch (error) {
      console.error('Error creating doctor visit:', error);
      Alert.alert('Error', error.message || 'Failed to create doctor visit');
    }
  };

  const handleCreateTestVisit = async () => {
    if (!testName.trim()) {
      Alert.alert('Error', 'Please enter test name');
      return;
    }

    try {
      // Format date and time for API
      const formattedDate = testDate.toISOString().split('T')[0];
      const formattedTime = `${String(testTime.getHours()).padStart(2, '0')}:${String(testTime.getMinutes()).padStart(2, '0')}`;

      // Create the visit in the backend
      const response = await createTestVisit(testName, formattedDate, formattedTime);
      const visitId = response.data._id;

      // Schedule local notification
      await scheduleTestVisitReminder(
        formattedDate,
        formattedTime,
        testName,
        `test-visit-${visitId}`
      );

      // Reset form and refresh
      setTestName('');
      setTestDate(new Date());
      setTestTime(new Date());
      fetchVisits();
      Alert.alert('Success', 'Test visit reminder created successfully');
    } catch (error) {
      console.error('Error creating test visit:', error);
      Alert.alert('Error', error.message || 'Failed to create test visit');
    }
  };

  const handleDeleteDoctorVisit = async (visitId) => {
    try {
      // Cancel the local notification first
      await cancelDoctorVisitReminder(`doctor-visit-${visitId}`);

      // Delete from backend
      await deleteDoctorVisit(visitId);
      fetchVisits();
      Alert.alert('Success', 'Doctor visit reminder deleted successfully');
    } catch (error) {
      console.error('Error deleting doctor visit:', error);
      Alert.alert('Error', error.message || 'Failed to delete doctor visit');
    }
  };

  const handleDeleteTestVisit = async (visitId) => {
    try {
      // Cancel the local notification first
      await cancelTestVisitReminder(`test-visit-${visitId}`);

      // Delete from backend
      await deleteTestVisit(visitId);
      fetchVisits();
      Alert.alert('Success', 'Test visit reminder deleted successfully');
    } catch (error) {
      console.error('Error deleting test visit:', error);
      Alert.alert('Error', error.message || 'Failed to delete test visit');
    }
  };

  const onDoctorDateChange = (event, selectedDate) => {
    setShowDoctorDatePicker(false);
    if (selectedDate) {
      setDoctorDate(selectedDate);
    }
  };

  const onDoctorTimeChange = (event, selectedTime) => {
    setShowDoctorTimePicker(false);
    if (selectedTime) {
      setDoctorTime(selectedTime);
    }
  };

  const onTestDateChange = (event, selectedDate) => {
    setShowTestDatePicker(false);
    if (selectedDate) {
      setTestDate(selectedDate);
    }
  };

  const onTestTimeChange = (event, selectedTime) => {
    setShowTestTimePicker(false);
    if (selectedTime) {
      setTestTime(selectedTime);
    }
  };

  const formatDate = (dateString) => {
    try {
      // Debug logging for test visits
      console.log(`formatDate called with: "${dateString}" (type: ${typeof dateString})`);

      // Handle both ISO format and date-only format
      const date = new Date(dateString);
      console.log(`Date object created: ${date}, isNaN: ${isNaN(date.getTime())}`);

      if (isNaN(date.getTime())) {
        // If parsing fails, try splitting date-only format (YYYY-MM-DD)
        const [year, month, day] = dateString.split('-').map(Number);
        console.log(`Manual parsing: year=${year}, month=${month}, day=${day}`);
        if (year && month && day) {
          const manualDate = new Date(year, month - 1, day);
          console.log(`Manual date created: ${manualDate}`);
          return manualDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          });
        }
        console.log(`Fallback to original string: ${dateString}`);
        return dateString; // Fallback to original string
      }

      const result = date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
      console.log(`Format result: ${result}`);
      return result;
    } catch (error) {
      console.error('Date formatting error:', error);
      console.log(`Returning original string: ${dateString}`);
      return dateString; // Return original string if formatting fails
    }
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  // Schedule notifications for existing visits when they are loaded
  const scheduleNotificationsForExistingVisits = async () => {
    try {
      // Get all currently scheduled notifications to avoid duplicates
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const scheduledIds = scheduledNotifications.map(n => n.identifier);

      // Schedule notifications for doctor visits (only if not already scheduled)
      for (const visit of doctorVisits) {
        const reminderId = `doctor-visit-${visit._id}`;
        if (!scheduledIds.includes(reminderId)) {
          await scheduleDoctorVisitReminder(
            visit.dateOfVisit,
            visit.timeOfVisit,
            visit.doctorName,
            reminderId
          );
        } else {
          console.log(`ℹ️  Doctor visit notification already scheduled: ${visit.doctorName} (${reminderId})`);
        }
      }

      // Schedule notifications for test visits (only if not already scheduled)
      for (const visit of testVisits) {
        const reminderId = `test-visit-${visit._id}`;
        if (!scheduledIds.includes(reminderId)) {
          await scheduleTestVisitReminder(
            visit.dateOfTest,
            visit.timeOfTest,
            visit.testName,
            reminderId
          );
        } else {
          console.log(`ℹ️  Test visit notification already scheduled: ${visit.testName} (${reminderId})`);
        }
      }
    } catch (error) {
      console.error('Error scheduling notifications for existing visits:', error);
    }
  };

  useEffect(() => {
    if (!checkInCompleted && !isLoading && !error) {
      scheduleDailyCheckInReminder();
    }
    fetchVisits();
  }, [checkInCompleted, isLoading, error]);

  // Schedule notifications when visits are loaded
  useEffect(() => {
    if (doctorVisits.length > 0 || testVisits.length > 0) {
      scheduleNotificationsForExistingVisits();
    }
  }, [doctorVisits, testVisits]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-4">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-base text-slate-500 font-medium">Analyzing your recovery...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View
        style={{ paddingTop: insets.top + 20 }}
        className="px-8 pb-10 bg-blue-600 rounded-b-[40px] shadow-lg shadow-blue-200"
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-3xl font-bold text-white tracking-tight">Recovery</Text>
            <Text className="text-blue-100 text-sm mt-1 font-medium">Your daily health journey</Text>
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
          paddingTop: 60,
          paddingBottom: bottomPadding + 40,
        }}
      >
        {/* Daily Check-In Card (Original) */}
        <View
          style={{ elevation: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 }}
          className="bg-white rounded-[32px] p-8 border border-slate-100 -mt-14 mb-8"
        >
          <View className="flex-row justify-between items-start mb-6">
            <View>
              <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-[2px] mb-1">Current Status</Text>
              <Text className="text-slate-900 text-2xl font-bold">Daily Check-In</Text>
            </View>
            <View className={`p-3 rounded-2xl ${checkInCompleted ? 'bg-green-100' : 'bg-orange-100'}`}>
              <CalendarCheck size={26} color={checkInCompleted ? '#10b981' : '#f59e0b'} />
            </View>
          </View>

          {!checkInCompleted ? (
            <View>
              <Text className="text-slate-500 text-[15px] leading-6 mb-8">
                Your recovery data is incomplete. Share your feeling to get insights.
              </Text>
              <TouchableOpacity
                onPress={handleStartCheckIn}
                className="bg-blue-600 flex-row items-center justify-center py-4 rounded-2xl shadow-lg shadow-blue-300"
              >
                <Text className="text-white font-bold text-lg mr-2">Start Session</Text>
                <ChevronRight size={20} color="white" />
              </TouchableOpacity>
            </View>
          ) : (
            <View className="bg-green-50 border border-green-100 rounded-[24px] p-6">
               <View className="flex-row items-center mb-3">
                <Star size={16} color="#10b981" fill="#10b981" className="mr-2" />
                <Text className="text-green-800 font-bold ml-2">Daily Goal Reached</Text>
              </View>
              <Text className="text-green-700/80 text-[15px] leading-6">Vitals and recovery markers logged.</Text>
            </View>
          )}
        </View>

        {/* NEW: UPCOMING REMINDERS SECTION */}
        <Text className="text-slate-900 text-xl font-bold mb-5 ml-1">Upcoming Reminders</Text>

        {/* Loading state for reminders */}
        {loadingVisits && (
          <View className="bg-white rounded-[32px] p-6 mb-6 shadow-sm border border-slate-100">
            <ActivityIndicator size="small" color="#3b82f6" />
            <Text className="text-slate-500 text-sm mt-2">Loading your reminders...</Text>
          </View>
        )}

        {/* No Reminders Placeholder - Only show when not loading and no reminders exist */}
        {!loadingVisits && doctorVisits.length === 0 && testVisits.length === 0 && (
          <View className="bg-white rounded-[32px] p-3 mb-6 shadow-sm border border-slate-100">
            <View className="items-center justify-center py-8">
              <View className="bg-blue-100 p-4 rounded-2xl mb-4">
                <BellRing size={32} color="#3b82f6" />
              </View>
              <Text className="text-slate-900 font-bold text-lg mb-2">No Upcoming Reminders</Text>
              <Text className="text-slate-500 text-center text-sm">
                You don't have any scheduled doctor appointments or lab tests.
              </Text>
            </View>
          </View>
        )}

        {/* Doctor Visit Reminders */}
        {doctorVisits.length > 0 && (
          <View className="bg-white rounded-[32px] p-6 mb-6 shadow-sm border border-slate-100">
            <Text className="text-slate-900 font-bold text-lg mb-4">Doctor Appointments</Text>

            {doctorVisits.map((visit) => (
              <View key={visit._id} className="bg-blue-50 rounded-[20px] p-4 mb-3 border border-blue-100">
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <Text className="text-blue-800 font-bold mb-1">{visit.doctorName}</Text>
                    <View className="flex-row items-center">
                      <Calendar size={14} color="#3b82f6" className="mr-1" />
                      <Text className="text-blue-600 text-sm">{formatDate(visit.dateOfVisit)}</Text>
                    </View>
                    <View className="flex-row items-center mt-1">
                      <Clock4 size={14} color="#3b82f6" className="mr-1" />
                      <Text className="text-blue-600 text-sm">{formatTime(visit.timeOfVisit)}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeleteDoctorVisit(visit._id)}
                    className="bg-red-100 p-2 rounded-full"
                  >
                    <Trash2 size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Test Visit Reminders */}
        {testVisits.length > 0 && (
          <View className="bg-slate-900 rounded-[32px] p-6 mb-6 shadow-xl shadow-slate-300">
            <Text className="text-white font-bold text-lg mb-4">Lab Tests & Checkups</Text>

            {testVisits.map((visit) => (
              <View key={visit._id} className="bg-white/10 rounded-[20px] p-4 mb-3 border border-white/10">
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <Text className="text-white font-bold mb-1">{visit.testName}</Text>
                    <View className="flex-row items-center">
                      <Calendar size={14} color="#ffffff" className="mr-1" />
                      <Text className="text-white/80 text-sm">{formatDate(visit.dateOfTest)}</Text>
                    </View>
                    <View className="flex-row items-center mt-1">
                      <Clock4 size={14} color="#ffffff" className="mr-1" />
                      <Text className="text-white/80 text-sm">{formatTime(visit.timeOfTest)}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeleteTestVisit(visit._id)}
                    className="bg-red-200/20 p-2 rounded-full"
                  >
                    <Trash2 size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* NEW: MEDICAL MANAGEMENT SECTION */}
        <Text className="text-slate-900 text-xl font-bold mb-5 ml-1">Medical Management</Text>

        {/* Doctor Visit Form */}
        <View className="bg-white rounded-[32px] p-6 mb-6 shadow-sm border border-slate-100">
          <View className="flex-row items-center mb-4">
            <View className="bg-blue-100 p-2.5 rounded-xl mr-3">
              <Stethoscope size={20} color="#3b82f6" />
            </View>
            <Text className="text-slate-900 font-bold text-lg">Doctor Appointment</Text>
          </View>

          <View className="flex-column gap-y-4">
            <View>
              <Text className="text-slate-400 text-[10px] font-bold uppercase mb-2 ml-1">Physician Name</Text>
              <TextInput
                placeholder="e.g. Dr. Smith"
                value={doctorName}
                onChangeText={setDoctorName}
                className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-900"
                ref={doctorNameRef}
              />
            </View>

            <View className="flex-row gap-x-3">
              <View className="flex-1">
                <TouchableOpacity
                  onPress={() => setShowDoctorDatePicker(true)}
                  className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex-row items-center justify-between"
                >
                  <Text className="text-slate-500">{doctorDate.toLocaleDateString()}</Text>
                  <Calendar size={18} color="#64748b" />
                </TouchableOpacity>
              </View>
              <View className="flex-1">
                <TouchableOpacity
                  onPress={() => setShowDoctorTimePicker(true)}
                  className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex-row items-center justify-between"
                >
                  <Text className="text-slate-500">{doctorTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</Text>
                  <Clock4 size={18} color="#64748b" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleCreateDoctorVisit}
              activeOpacity={0.7}
              className="bg-blue-600 py-4 rounded-2xl flex-row justify-center items-center mt-2"
            >
              <Plus size={18} color="white"/>
              <Text className="text-white font-bold ml-2">Set Visit Reminder</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Health Test/Checkup Form */}
        <View className="bg-slate-900 rounded-[32px] p-6 mb-8 shadow-xl shadow-slate-300">
          <View className="flex-row items-center mb-4">
            <View className="bg-white/10 p-2.5 rounded-xl mr-3">
              <ClipboardList size={20} color="#ffffff" />
            </View>
            <Text className="text-white font-bold text-lg">Lab Tests & Checkups</Text>
          </View>

          <View className="flex-column gap-y-4">
            <View>
              <Text className="text-slate-400 text-[10px] font-bold uppercase mb-2 ml-1">Test Description</Text>
              <TextInput
                placeholder="e.g. Blood Work or MRI"
                placeholderTextColor="#64748b"
                value={testName}
                onChangeText={setTestName}
                className="bg-white/10 border border-white/10 rounded-2xl p-4 text-white"
                ref={testNameRef}
              />
            </View>

            <View className="flex-row gap-x-3">
              <View className="flex-1">
                <TouchableOpacity
                  onPress={() => setShowTestDatePicker(true)}
                  className="bg-white/10 border border-white/10 rounded-2xl p-4 flex-row items-center justify-between"
                >
                  <Text className="text-white">{testDate.toLocaleDateString()}</Text>
                  <Calendar size={18} color="#ffffff" />
                </TouchableOpacity>
              </View>
              <View className="flex-1">
                <TouchableOpacity
                  onPress={() => setShowTestTimePicker(true)}
                  className="bg-white/10 border border-white/10 rounded-2xl p-4 flex-row items-center justify-between"
                >
                  <Text className="text-white">{testTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</Text>
                  <Clock4 size={18} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleCreateTestVisit}
              activeOpacity={0.7}
              className="bg-white py-4 rounded-2xl flex-row justify-center items-center mt-2"
            >
              <BellRing size={18} color="#0f172a" className="mr-2" />
              <Text className="text-slate-900 font-bold ml-2">Schedule Test Alert</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Analytics Section (Original) */}
        <Text className="text-slate-900 text-xl font-bold mb-5 ml-1">Insights & Activity</Text>
        <View className="flex-row justify-between mb-4">
          <View className="bg-white rounded-[32px] p-6 w-[48%] shadow-sm border border-slate-100">
            <View className="bg-purple-100 self-start p-3 rounded-2xl mb-4">
              <BarChart3 size={22} color="#8b5cf6" />
            </View>
            <Text className="text-slate-900 font-bold text-lg">Trends</Text>
          </View>
          <View className="bg-white rounded-[32px] p-6 w-[48%] shadow-sm border border-slate-100">
            <View className="bg-rose-100 self-start p-3 rounded-2xl mb-4">
              <Activity size={22} color="#f43f5e" />
            </View>
            <Text className="text-slate-900 font-bold text-lg">Vitals</Text>
          </View>
        </View>
      </ScrollView>

      {/* Date Time Pickers */}
      {showDoctorDatePicker && (
        <DateTimePicker
          value={doctorDate}
          mode="date"
          display="default"
          onChange={onDoctorDateChange}
          minimumDate={new Date()}
        />
      )}

      {showDoctorTimePicker && (
        <DateTimePicker
          value={doctorTime}
          mode="time"
          display="default"
          onChange={onDoctorTimeChange}
          is24Hour={false}
        />
      )}

      {showTestDatePicker && (
        <DateTimePicker
          value={testDate}
          mode="date"
          display="default"
          onChange={onTestDateChange}
          minimumDate={new Date()}
        />
      )}

      {showTestTimePicker && (
        <DateTimePicker
          value={testTime}
          mode="time"
          display="default"
          onChange={onTestTimeChange}
          is24Hour={false}
        />
      )}
    </View>
  );
}
