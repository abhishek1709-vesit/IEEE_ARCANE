import { View, Text, TextInput, Alert, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon, Trash2, X, Upload, FileText } from 'lucide-react-native';
import { createReport, getUserReports, deleteReport, formatFileSize } from '../../services/reportService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

export default function InformationScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');

  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Camera roll permission is required to upload images');
      }
    })();

    fetchReports();
  }, []);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        setImage(selectedImage);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const removeImage = () => {
    setImage(null);
  };

  const handleSubmit = async () => {
    if (!image) {
      Alert.alert('Error', 'Please select an image to upload');
      return;
    }

    setLoading(true);
    try {
      const result = await createReport(image.uri, title, description);

      if (result.success) {
        Alert.alert('Success', 'Report uploaded successfully!');
        setTitle('');
        setDescription('');
        setImage(null);
        fetchReports();
        setActiveTab('gallery');
      } else {
        Alert.alert('Error', result.error || 'Failed to upload report');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while uploading the report');
      console.error('Report upload error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      setRefreshing(true);
      const result = await getUserReports();

      if (result.success) {
        setReports(result.data);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      Alert.alert('Error', 'Failed to fetch reports');
    } finally {
      setRefreshing(false);
    }
  };

  const handleDeleteReport = async (reportId) => {
    Alert.alert(
      'Delete Report',
      'Are you sure you want to delete this report?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await deleteReport(reportId);
              if (result.success) {
                Alert.alert('Success', 'Report deleted successfully');
                fetchReports();
              } else {
                Alert.alert('Error', result.error || 'Failed to delete report');
              }
            } catch (error) {
              console.error('Error deleting report:', error);
              Alert.alert('Error', 'Failed to delete report');
            }
          },
        },
      ]
    );
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
            <FileText size={24} color="#3b82f6" />
          </View>
          <Text className="text-2xl font-bold text-white">Health Reports</Text>
        </View>
        <Text className="text-blue-50 text-sm">Upload and manage your medical reports</Text>
      </View>

      {/* Tab Switcher */}
      <View className="px-6 -mt-4 mb-4">
        <View className="bg-white rounded-xl shadow-sm p-1 flex-row">
          <TouchableOpacity
            className={`flex-1 py-3.5 rounded-lg items-center ${
              activeTab === 'upload' ? 'bg-blue-500' : 'bg-transparent'
            }`}
            onPress={() => setActiveTab('upload')}
          >
            <Text
              className={`font-semibold text-sm ${
                activeTab === 'upload' ? 'text-white' : 'text-gray-600'
              }`}
            >
              Upload New
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-3.5 rounded-lg items-center ${
              activeTab === 'gallery' ? 'bg-blue-500' : 'bg-transparent'
            }`}
            onPress={() => setActiveTab('gallery')}
          >
            <Text
              className={`font-semibold text-sm ${
                activeTab === 'gallery' ? 'text-white' : 'text-gray-600'
              }`}
            >
              My Reports
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
      >
        {activeTab === 'upload' ? (
          <View>
            {/* Image Upload Card */}
            <View className="bg-white rounded-xl shadow-sm p-4 mb-4">
              <View className="flex-row items-center mb-3">
                <View className="bg-blue-50 p-1.5 rounded-lg mr-2">
                  <ImageIcon size={18} color="#3b82f6" />
                </View>
                <Text className="text-gray-800 font-semibold text-sm">Select Image</Text>
              </View>

              {image ? (
                <View className="relative mb-3">
                  <Image
                    source={{ uri: image.uri }}
                    className="w-full h-56 rounded-lg"
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-sm"
                    onPress={removeImage}
                  >
                    <X size={18} color="#ef4444" />
                  </TouchableOpacity>
                  <View className="absolute bottom-2 right-2 bg-black/70 rounded-lg px-2 py-1">
                    <Text className="text-white text-xs">
                      {formatFileSize(image.fileSize || 0)}
                    </Text>
                  </View>
                </View>
              ) : (
                <View className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 items-center mb-3">
                  <Camera size={40} color="#9ca3af" />
                  <Text className="text-gray-500 text-sm mt-2">No image selected</Text>
                </View>
              )}

              <TouchableOpacity
                onPress={pickImage}
                className="bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg p-3 flex-row items-center justify-center"
              >
                <Upload size={18} color="#3b82f6" />
                <Text className="text-blue-600 font-semibold ml-2 text-sm">
                  {image ? 'Change Image' : 'Select Image'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Title Card */}
            <View className="bg-white rounded-xl shadow-sm p-4 mb-4">
              <View className="flex-row items-center mb-2">
                <View className="bg-purple-50 p-1.5 rounded-lg mr-2">
                  <FileText size={18} color="#9333ea" />
                </View>
                <Text className="text-gray-800 font-semibold text-sm">Title (Optional)</Text>
              </View>
              <TextInput
                className="bg-gray-50 rounded-lg p-3 text-gray-800 text-base border border-gray-200"
                placeholder="e.g., Blood Test Report"
                placeholderTextColor="#9ca3af"
                value={title}
                onChangeText={setTitle}
              />
            </View>

            {/* Description Card */}
            <View className="bg-white rounded-xl shadow-sm p-4 mb-4">
              <View className="flex-row items-center mb-2">
                <View className="bg-green-50 p-1.5 rounded-lg mr-2">
                  <FileText size={18} color="#10b981" />
                </View>
                <Text className="text-gray-800 font-semibold text-sm">Description (Optional)</Text>
              </View>
              <TextInput
                className="bg-gray-50 rounded-lg p-3 text-gray-800 text-base border border-gray-200"
                placeholder="Add notes about this report..."
                placeholderTextColor="#9ca3af"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Upload Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading || !image}
              className={`rounded-xl p-4 shadow-sm mb-4 ${
                loading || !image ? 'bg-gray-400' : 'bg-green-500'
              }`}
            >
              <Text className="text-white text-center font-bold text-base">
                {loading ? 'Uploading...' : '✓ Upload Report'}
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
                • Select an image from your gallery{'\n'}
                • Add optional title and description{'\n'}
                • Max file size: 5MB{'\n'}
                • Supported formats: JPG, PNG
              </Text>
            </View>
          </View>
        ) : (
          <View>
            {reports.length === 0 ? (
              <View className="items-center justify-center py-16">
                <View className="bg-gray-100 p-6 rounded-full mb-4">
                  <FileText size={48} color="#9ca3af" />
                </View>
                <Text className="text-gray-600 text-lg font-semibold mb-2">No Reports Yet</Text>
                <Text className="text-gray-400 text-center">
                  Upload your first medical report{'\n'}to get started
                </Text>
                <TouchableOpacity
                  onPress={() => setActiveTab('upload')}
                  className="bg-blue-500 px-6 py-3 rounded-full mt-6"
                >
                  <Text className="text-white font-semibold">+ Upload Report</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="space-y-4">
                {reports.map((report, index) => (
                  <View
                    key={index}
                    className="bg-white rounded-xl shadow-sm overflow-hidden mb-4"
                  >
                    {/* Header */}
                    <View className="bg-blue-500 p-4">
                      <View className="flex-row items-start justify-between">
                        <View className="flex-1 mr-3">
                          <Text className="text-white text-lg font-bold mb-1" numberOfLines={2}>
                            {report.title || 'Untitled Report'}
                          </Text>
                          {report.description && (
                            <Text className="text-blue-50 text-sm" numberOfLines={2}>
                              {report.description}
                            </Text>
                          )}
                        </View>
                        <TouchableOpacity
                          className="bg-white/20 p-2 rounded-lg"
                          onPress={() => handleDeleteReport(report._id)}
                        >
                          <Trash2 size={18} color="#ffffff" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Image */}
                    <View className="p-4">
                      <Image
                        source={{ uri: report.image }}
                        className="w-full h-56 rounded-lg"
                        resizeMode="cover"
                      />
                    </View>

                    {/* Footer */}
                    <View className="px-4 pb-4">
                      <View className="flex-row items-center bg-gray-50 rounded-lg p-2">
                        <Camera size={14} color="#6b7280" />
                        <Text className="text-gray-600 text-xs ml-2">
                          Uploaded: {new Date(report.createdAt).toLocaleDateString()} at {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}