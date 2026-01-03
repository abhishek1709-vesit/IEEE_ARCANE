import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { removeToken } from '../../services/authService';

export default function ProfileScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    await removeToken();
    router.replace('/login');
  };

  return (
    <View className="flex-1 items-center justify-center bg-white p-4">
      <Text className="text-2xl font-bold text-gray-800">Profile Screen</Text>
      <Text className="text-gray-600 mt-2">User profile information</Text>

      <View className="mt-8">
        <Button
          title="Logout"
          onPress={handleLogout}
          color="#ef4444"
        />
      </View>
    </View>
  );
}
