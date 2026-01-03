import { View, Text, TextInput, Alert, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon, Trash2, X, Upload, FileText, ChevronRight, Calendar, Info } from 'lucide-react-native';
import { createReport, getUserReports, deleteReport, formatFileSize } from '../../services/reportService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function InformationScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');

  const insets = useSafeAreaInsets();
  // Fallback padding if not in a tab bar, ensures content isn't cut off
  const bottomPadding = insets.bottom > 0 ? insets.bottom + 20 : 100;

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
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const removeImage = () => setImage(null);

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
      Alert.alert('Error', 'An error occurred while uploading');
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      setRefreshing(true);
      const result = await getUserReports();
      if (result.success) setReports(result.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch reports');
    } finally {
      setRefreshing(false);
    }
  };

  const handleDeleteReport = (reportId) => {
    Alert.alert('Delete Report', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const result = await deleteReport(reportId);
          if (result.success) fetchReports();
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View 
        style={{ paddingTop: insets.top + 20 }}
        className="px-6 pb-10 bg-blue-600 rounded-b-[40px]"
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-3xl font-bold text-white">Reports</Text>
            <Text className="text-blue-100 text-sm mt-1">Medical records & documentation</Text>
          </View>
          <View className="bg-white/20 p-3 rounded-2xl">
            <FileText size={28} color="#ffffff" />
          </View>
        </View>
      </View>

      {/* Modern Tab Switcher */}
      <View className="px-6 -mt-7 mb-6">
        <View className="bg-white rounded-3xl shadow-md shadow-slate-200 p-1.5 flex-row">
          <TouchableOpacity
            onPress={() => setActiveTab('upload')}
            className={`flex-1 py-3 rounded-[22px] items-center flex-row justify-center ${activeTab === 'upload' ? 'bg-blue-600' : ''}`}
          >
            <Upload size={16} color={activeTab === 'upload' ? 'white' : '#64748b'} />
            <Text className={`font-bold ml-2 text-sm ${activeTab === 'upload' ? 'text-white' : 'text-slate-500'}`}>Upload</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('gallery')}
            className={`flex-1 py-3 rounded-[22px] items-center flex-row justify-center ${activeTab === 'gallery' ? 'bg-blue-600' : ''}`}
          >
            <ImageIcon size={16} color={activeTab === 'gallery' ? 'white' : '#64748b'} />
            <Text className={`font-bold ml-2 text-sm ${activeTab === 'gallery' ? 'text-white' : 'text-slate-500'}`}>Archive</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: bottomPadding }}
      >
        {activeTab === 'upload' ? (
          <View>
            {/* Image Selector */}
            <TouchableOpacity 
              onPress={image ? null : pickImage}
              activeOpacity={0.9}
              className={`bg-white rounded-[32px] p-2 border-2 border-dashed ${image ? 'border-transparent' : 'border-slate-200'} mb-5 overflow-hidden`}
            >
              {image ? (
                <View className="relative">
                  <Image source={{ uri: image.uri }} className="w-full h-64 rounded-[28px]" resizeMode="cover" />
                  <TouchableOpacity 
                    onPress={removeImage}
                    className="absolute top-4 right-4 bg-white/90 p-2 rounded-full shadow-lg"
                  >
                    <X size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View className="py-12 items-center">
                  <View className="bg-blue-50 p-5 rounded-full mb-4">
                    <Camera size={32} color="#3b82f6" />
                  </View>
                  <Text className="text-slate-900 font-bold text-lg">Snap or Pick Photo</Text>
                  <Text className="text-slate-400 text-sm mt-1">Upload JPG or PNG up to 5MB</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Form Fields */}
            <View className="bg-white rounded-[32px] p-6 shadow-sm shadow-slate-200 mb-5">
              <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-4">Report Details</Text>
              
              <View className="mb-4">
                <TextInput
                  className="bg-slate-50 rounded-2xl p-4 text-slate-900 font-medium border border-slate-100"
                  placeholder="Report Title (e.g. Lab Results)"
                  value={title}
                  onChangeText={setTitle}
                />
              </View>

              <View>
                <TextInput
                  className="bg-slate-50 rounded-2xl p-4 text-slate-900 font-medium border border-slate-100 h-24"
                  placeholder="Add a description or notes..."
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  textAlignVertical="top"
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading || !image}
              className={`py-4 rounded-[24px] shadow-lg flex-row justify-center items-center ${loading || !image ? 'bg-slate-300' : 'bg-green-500 shadow-green-200'}`}
            >
              <Text className="text-white font-bold text-lg mr-2">{loading ? 'Processing...' : 'Secure Upload'}</Text>
              {!loading && <ChevronRight size={20} color="white" />}
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {reports.length === 0 ? (
              <View className="items-center justify-center py-20">
                <View className="bg-slate-100 p-8 rounded-full mb-6">
                  <FileText size={40} color="#cbd5e1" />
                </View>
                <Text className="text-slate-900 text-xl font-bold">No reports yet</Text>
                <Text className="text-slate-400 text-center mt-2 px-10">
                  Your uploaded medical documents will appear here for easy access.
                </Text>
              </View>
            ) : (
              reports.map((report, index) => (
                <View key={index} className="bg-white rounded-[32px] mb-5 overflow-hidden shadow-sm shadow-slate-200 border border-slate-100">
                  <View className="p-5 flex-row justify-between items-center border-b border-slate-50">
                    <View className="flex-1 mr-4">
                      <Text className="text-slate-900 font-bold text-lg" numberOfLines={1}>
                        {report.title || 'Untitled Report'}
                      </Text>
                      <View className="flex-row items-center mt-1">
                        <Calendar size={12} color="#94a3b8" />
                        <Text className="text-slate-400 text-[11px] ml-1 font-medium">
                          {new Date(report.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity 
                      onPress={() => handleDeleteReport(report._id)}
                      className="bg-rose-50 p-3 rounded-2xl"
                    >
                      <Trash2 size={18} color="#fb7185" />
                    </TouchableOpacity>
                  </View>

                  <View className="p-2">
                    <Image source={{ uri: report.image }} className="w-full h-48 rounded-[24px]" resizeMode="cover" />
                  </View>

                  {report.description && (
                    <View className="px-5 pb-5 pt-2">
                      <Text className="text-slate-500 text-sm leading-5">{report.description}</Text>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}