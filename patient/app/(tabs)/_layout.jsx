import { Tabs } from "expo-router";
import { Home, Info, Pill, User } from "lucide-react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from "expo-status-bar";


export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#0ea5e9', // primary-500
        tabBarInactiveTintColor: '#6b7280', // neutral-500
        tabBarStyle: {
          paddingBottom: 8 + insets.bottom,
          paddingTop: 8,
          height: 70 + insets.bottom,
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb', // neutral-200
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginBottom: 4,
        },
        headerShown: false,
      }}
    >
      <StatusBar style="light" />
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused, size }) => (
            <Home
              color={color}
              size={focused ? 28 : 24} // Larger when focused
            />
          ),
        }}
      />
        <Tabs.Screen
          name="medications"
          options={{
            title: 'Medications',
            tabBarIcon: ({ color, focused, size }) => (
              <Pill
                color={color}
                size={focused ? 28 : 24} // Larger when focused
              />
            ),
          }}
        />
        
      <Tabs.Screen
        name="information"
        options={{
          title: 'Information',
          tabBarIcon: ({ color, focused, size }) => (
            <Info
              color={color}
              size={focused ? 28 : 24} // Larger when focused
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused, size }) => (
            <User
              color={color}
              size={focused ? 28 : 24} // Larger when focused
            />
          ),
        }}
      />
    </Tabs>
  );
}
