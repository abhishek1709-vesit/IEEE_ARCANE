import { View, Text } from 'react-native';

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white p-4">
      <Text className="text-2xl font-bold text-gray-800">Home Screen</Text>
      <Text className="text-gray-600 mt-2">Welcome to the home screen</Text>
    </View>
  );
}
