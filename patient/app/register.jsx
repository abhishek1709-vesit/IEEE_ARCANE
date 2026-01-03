import { View, Text, TextInput, Button, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { registerUser } from '../services/authService';
import { User, Mail, Lock } from 'lucide-react-native';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (!username || !email || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (username.length < 3) {
      Alert.alert('Error', 'Username must be at least 3 characters');
      return;
    }

    setLoading(true);
    try {
      const result = await registerUser(username, email, password);

      if (result.success) {
        Alert.alert('Success', 'Registration successful!');
        router.replace('/(tabs)/home');
      } else {
        Alert.alert('Registration Failed', result.error || 'Registration failed');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred during registration');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white p-6 justify-center">
      <Text className="text-3xl font-bold text-center mb-8 text-blue-600">Sign Up</Text>

      <View className="mb-6">
        <Text className="text-gray-700 mb-2">Username</Text>
        <View className="flex-row items-center border border-gray-300 rounded-lg p-3">
          <User size={20} color="#6b7280" className="mr-3" />
          <TextInput
            className="flex-1 text-gray-700"
            placeholder="Enter your username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>
      </View>

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
        title={loading ? "Registering..." : "Sign Up"}
        onPress={handleRegister}
        disabled={loading}
        color="#3b82f6"
      />

      {loading && (
        <View className="mt-4">
          <ActivityIndicator size="small" color="#3b82f6" />
        </View>
      )}

      <View className="mt-6 flex-row justify-center">
        <Text className="text-gray-600">Already have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/login')}>
          <Text className="text-blue-600 font-medium">Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
