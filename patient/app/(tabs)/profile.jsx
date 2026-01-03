import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { removeToken, getCurrentUser } from '../../services/authService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { User, LogOut, Settings, ShieldCheck, Moon, Sun, ChevronRight, CircleUserRound, Mail, CalendarDays, Clock, Shield, Bell } from 'lucide-react-native';


const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const bottomPadding = insets.bottom > 0 ? insets.bottom : 24;
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleLogout = async () => {
    await removeToken();
    router.replace('/login');
  };

  // Calculate days since account creation
  const calculateDaysActive = (createdAt) => {
    if (!createdAt) return 0;
    const createdDate = new Date(createdAt);
    const today = new Date();
    const timeDiff = today - createdDate;
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    return daysDiff;
  };

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getCurrentUser();

      if (result.success) {
        setUserData(result.user);
      } else {
        setError(result.error || 'Failed to fetch user data');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const menuItems = [
    { icon: <Settings size={22} color="#64748b" />, label: 'Settings', color: 'bg-slate-100' },
    { icon: <ShieldCheck size={22} color="#64748b" />, label: 'Privacy & Security', color: 'bg-slate-100' },
  ];

  return (
    <View className="flex-1 bg-slate-50">
      {/* HEADER: Matches Home/Medication tabs */}
      <View
        style={{ paddingTop: insets.top + 20 }}
        className="px-8 pb-8 bg-blue-600 rounded-b-[40px] shadow-lg shadow-blue-200"
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-3xl font-bold text-white tracking-tight">Profile</Text>
            <Text className="text-blue-100 text-sm mt-1 font-medium">Manage your account</Text>
          </View>
          <View className="bg-white/20 p-3 rounded-2xl">
            <User size={28} color="#ffffff" />
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
        {/* PROFILE CARD - Now shows real user data from backend */}
        <View
          style={{ elevation: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 }}
          className="bg-white rounded-[32px] p-8 border border-slate-100 -mt-14 mb-8 items-center"
        >
          <View className="bg-blue-50 p-4 rounded-full mb-4">
            <CircleUserRound size={80} color="#3b82f6" strokeWidth={1.5} />
          </View>

          {loading ? (
            <View className="py-8">
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text className="text-slate-500 mt-4">Loading user data...</Text>
            </View>
          ) : error ? (
            <View className="py-4">
              <Text className="text-red-500 text-center mb-2">Error loading user data</Text>
              <TouchableOpacity
                onPress={fetchUserData}
                className="bg-blue-500 px-4 py-2 rounded-lg"
              >
                <Text className="text-white text-sm">Retry</Text>
              </TouchableOpacity>
            </View>
          ) : userData ? (
            <>
              <Text className="text-2xl font-bold text-slate-900">{userData.username}</Text>
              {/* <Text className="text-slate-500 font-medium">Patient ID: #{userData._id?.slice(-4).toUpperCase()}</Text> */}

              {/* User Info Details */}
              <View className="w-full mt-6 bg-slate-50 rounded-xl p-4">
                <View className="flex-row items-center mb-3">
                  <Mail size={18} color="#64748b" className="mr-3" />
                  <Text className="text-slate-700 font-medium ml-2">{userData.email}</Text>
                </View>

                <View className="flex-row items-center mb-3">
                  <CalendarDays size={18} color="#64748b" className="mr-3" />
                  <Text className="text-slate-600 text-sm ml-2">
                    Member since: {new Date(userData.createdAt).toLocaleDateString()}
                  </Text>
                </View>

                <View className="flex-row items-center">
                  <Clock size={18} color="#64748b" className="mr-3" />
                  <Text className="text-slate-600 text-sm ml-2">
                    Account created: {new Date(userData.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>

              <View className="flex-row justify-between w-full mt-8 pt-6 border-t border-slate-50">
                <View className="items-center flex-1">
                  <Text className="text-blue-600 text-lg font-bold">
                    {calculateDaysActive(userData.createdAt)}
                  </Text>
                  <Text className="text-slate-400 text-[10px] mt-1 font-bold uppercase tracking-wider">Days Active</Text>
                </View>
              </View>
            </>
          ) : (
            <Text className="text-slate-500">No user data available</Text>
          )}
        </View>

        {/* ACCOUNT SETTINGS SECTION */}
        <Text className="text-slate-900 text-xl font-bold mb-4 ml-1">Account Settings</Text>

        <View className="bg-white rounded-[32px] p-2 shadow-sm border border-slate-100 mb-8">
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              activeOpacity={0.7}
              className={`flex-row items-center p-4 ${index !== menuItems.length - 1 ? 'border-b border-slate-50' : ''}`}
            >
              <View className={`${item.color} p-2.5 rounded-xl mr-4`}>
                {item.icon}
              </View>
              <Text className="flex-1 text-slate-700 font-bold text-base">{item.label}</Text>
              <ChevronRight size={20} color="#cbd5e1" />
            </TouchableOpacity>
          ))}

          {/* NOTIFICATIONS - Original menu item */}
          <TouchableOpacity
            activeOpacity={0.7}
            className="flex-row items-center p-4 border-t border-slate-50"
          >
            <View className="bg-slate-100 p-2.5 rounded-xl mr-4">
              <Bell size={22} color="#64748b" />
            </View>
            <Text className="flex-1 text-slate-700 font-bold text-base">Notifications</Text>
            <ChevronRight size={20} color="#cbd5e1" />
          </TouchableOpacity>
        </View>

        {/* LOGOUT BUTTON */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleLogout}
          className="bg-red-50 flex-row items-center justify-center py-5 rounded-[24px] border border-red-100"
        >
          <LogOut size={22} color="#ef4444" className="mr-3" />
          <Text className="text-red-500 font-bold text-lg ml-2">Sign Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}
