import { View, Text, TextInput, Button, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { loginUser } from '../services/authService';
import { Mail, Lock } from 'lucide-react-native';
import { requestNotificationPermissions } from '../utils/notifications';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const result = await loginUser(email, password);

      if (result.success) {
        // Request notification permissions after successful login
        const permissionsGranted = await requestNotificationPermissions();
        if (!permissionsGranted) {
          console.log('Notification permissions not granted');
        }

        router.replace('/(tabs)/home');
      } else {
        Alert.alert('Login Failed', result.error || 'Invalid credentials');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred during login');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white p-6 justify-center">
      <Text className="text-3xl font-bold text-center mb-8 text-blue-600">Login</Text>

      <View className="mb-6">
        <Text className="text-gray-700 mb-2">Email</Text>
        <View className="flex-row items-center border border-gray-300 rounded-lg p-3">
          <Mail size={20} color="#6b7280" className="mr-3" />
          <TextInput
            className="flex-1 text-gray-700"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      </View>

      <View className="mb-6">
        <Text className="text-gray-700 mb-2">Password</Text>
        <View className="flex-row items-center border border-gray-300 rounded-lg p-3">
          <Lock size={20} color="#6b7280" className="mr-3" />
          <TextInput
            className="flex-1 text-gray-700"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
      </View>

      <Button
        title={loading ? "Logging in..." : "Login"}
        onPress={handleLogin}
        disabled={loading}
        color="#3b82f6"
      />

      {loading && (
        <View className="mt-4">
          <ActivityIndicator size="small" color="#3b82f6" />
        </View>
      )}

      <View className="mt-6 flex-row justify-center">
        <Text className="text-gray-600">Don't have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/register')}>
          <Text className="text-blue-600 font-medium">Sign up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
