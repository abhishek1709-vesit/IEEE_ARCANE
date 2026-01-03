import {
  View,
  Text,
  TextInput,
  Alert,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from "react-native";
import { useState, useEffect } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  Clock,
  Plus,
  Trash2,
  Bell,
  Pill as PillIcon,
  Calendar,
  ChevronRight,
  Timer,
  Info,
  Pencil,
} from "lucide-react-native";
import {
  createMedicineReminder,
  formatTime24Hour,
  getUserMedicines,
  updateMedicineReminder,
  deleteMedicineReminder
} from "../../services/medicineService";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  scheduleMedicineReminder,
  cancelAllMedicineReminders
} from "../../utils/notifications";

const { width } = Dimensions.get("window");

export default function MedicationsScreen() {
  const [medicineName, setMedicineName] = useState("");
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [times, setTimes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("form");
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const insets = useSafeAreaInsets();
  const bottomPadding = insets.bottom > 0 ? insets.bottom + 20 : 100;

  const handleAddTime = () => setShowTimePicker(true);

  const handleTimeChange = (event, selectedDate) => {
    setShowTimePicker(false);
    if (selectedDate) {
      const formattedTime = formatTime24Hour(selectedDate);
      if (!times.includes(formattedTime)) {
        setTimes([...times, formattedTime].sort());
      }
    }
  };

  const handleRemoveTime = (index) => {
    const updatedTimes = [...times];
    updatedTimes.splice(index, 1);
    setTimes(updatedTimes);
  };

  const handleSubmit = async () => {
    if (!medicineName.trim()) {
      Alert.alert("Error", "What is the name of the medicine?");
      return;
    }
    if (times.length === 0) {
      Alert.alert("Error", "Please set at least one reminder time.");
      return;
    }

    setLoading(true);
    try {
      let result;
      if (editMode && editingMedicine) {
        // Update existing medicine
        result = await updateMedicineReminder(editingMedicine._id, medicineName, times);
        if (result.success) {
          Alert.alert("Success", "Reminder updated!");
          // Cancel old notifications and schedule new ones
          await cancelAllMedicineReminders();
          for (const time of times) {
            await scheduleMedicineReminder(time, medicineName);
          }
        }
      } else {
        // Create new medicine
        result = await createMedicineReminder(medicineName, times);
        if (result.success) {
          // Schedule notifications for each time
          for (const time of times) {
            await scheduleMedicineReminder(time, medicineName);
          }
          Alert.alert("Success", "Reminder active!");
        }
      }

      if (result.success) {
        setMedicineName("");
        setTimes([]);
        setEditMode(false);
        setEditingMedicine(null);
        fetchMedicines();
        setActiveTab("reminders");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to save reminder");
    } finally {
      setLoading(false);
    }
  };

  const handleEditMedicine = (medicine) => {
    setEditingMedicine(medicine);
    setMedicineName(medicine.name);
    setTimes([...medicine.times]);
    setEditMode(true);
    setActiveTab("form");
  };

  const handleDeleteMedicine = async (medicineId) => {
    Alert.alert(
      "Delete Reminder",
      "Are you sure you want to delete this medicine reminder?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const result = await deleteMedicineReminder(medicineId);
              if (result.success) {
                Alert.alert("Success", "Reminder deleted!");
                // Cancel the notifications for this medicine
                await cancelAllMedicineReminders();
                fetchMedicines();
              } else {
                Alert.alert("Error", result.error || "Failed to delete reminder");
              }
            } catch (error) {
              Alert.alert("Error", "Failed to delete reminder");
            }
          }
        }
      ]
    );
  };

  const calculateTimeRemaining = (timeString) => {
    const now = new Date();
    const [hours, minutes] = timeString.split(":").map(Number);
    const targetTime = new Date();
    targetTime.setHours(hours, minutes, 0, 0);
    if (targetTime < now) targetTime.setDate(targetTime.getDate() + 1);

    const diffInMs = targetTime.getTime() - now.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInMinutes = Math.floor(
      (diffInMs % (1000 * 60 * 60)) / (1000 * 60)
    );

    return diffInHours > 0
      ? `${diffInHours}h ${diffInMinutes}m`
      : `${diffInMinutes}m`;
  };

  const getNextTime = (timesArray) => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const sorted = [...timesArray].sort();
    for (const time of sorted) {
      const [hours, minutes] = time.split(":").map(Number);
      if (hours * 60 + minutes > currentTime) return time;
    }
    return sorted[0];
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      setRefreshing(true);
      const result = await getUserMedicines();
      if (result.success) setMedicines(result.data);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header - Matches your branding */}
      <View
        style={{ paddingTop: insets.top + 20 }}
        className="px-6 pb-12 bg-blue-600 rounded-b-[40px] shadow-lg shadow-blue-200"
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-3xl font-bold text-white">Medications</Text>
            <Text className="text-blue-100 text-sm mt-1">
              Manage your daily prescriptions
            </Text>
          </View>
          <View className="bg-white/20 p-3 rounded-2xl">
            <PillIcon size={28} color="#ffffff" />
          </View>
        </View>
      </View>

      {/* Tab Switcher - Floating Pill Style */}
      <View className="px-6 -mt-7 mb-6">
        <View className="bg-white rounded-3xl shadow-md shadow-slate-200 p-1.5 flex-row">
          <TouchableOpacity
            onPress={() => setActiveTab("form")}
            className={`flex-1 py-3 rounded-[22px] items-center flex-row justify-center ${
              activeTab === "form" ? "bg-blue-600" : ""
            }`}
          >
            <Plus
              size={16}
              color={activeTab === "form" ? "white" : "#64748b"}
            />
            <Text
              className={`font-bold ml-2 text-sm ${
                activeTab === "form" ? "text-white" : "text-slate-500"
              }`}
            >
              {editMode ? "Edit" : "Add New"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("reminders")}
            className={`flex-1 py-3 rounded-[22px] items-center flex-row justify-center ${
              activeTab === "reminders" ? "bg-blue-600" : ""
            }`}
          >
            <Calendar
              size={16}
              color={activeTab === "reminders" ? "white" : "#64748b"}
            />
            <Text
              className={`font-bold ml-2 text-sm ${
                activeTab === "reminders" ? "text-white" : "text-slate-500"
              }`}
            >
              Schedule
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: bottomPadding,
        }}
        refreshControl={
          activeTab === "reminders" ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={fetchMedicines}
              tintColor="#3b82f6"
            />
          ) : undefined
        }
      >
        {activeTab === "form" ? (
          <View>
            <View className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 mb-5">
              <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-4">
                Medication Details
              </Text>

              <View className="flex-row items-center bg-slate-50 rounded-2xl px-4 border border-slate-100 mb-6">
                <PillIcon size={20} color="#3b82f6" />
                <TextInput
                  className="flex-1 p-4 text-slate-900 font-bold text-base"
                  placeholder="e.g. Morning Vitamins"
                  value={medicineName}
                  onChangeText={setMedicineName}
                />
              </View>

              <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-4">
                Reminder Schedule
              </Text>

              <View className="flex-row flex-wrap gap-3 mb-4">
                {times.map((time, index) => (
                  <View
                    key={index}
                    className="bg-blue-50 border border-blue-100 flex-row items-center py-2 px-4 rounded-full"
                  >
                    <Text className="text-blue-600 font-bold mr-2">{time}</Text>
                    <TouchableOpacity onPress={() => handleRemoveTime(index)}>
                      <X size={14} color="#3b82f6" />
                    </TouchableOpacity>
                  </View>
                ))}

                <TouchableOpacity
                  onPress={handleAddTime}
                  className="bg-slate-100 py-2 px-4 rounded-full border border-dashed border-slate-300 flex-row items-center"
                >
                  <Plus size={16} color="#64748b" />
                  <Text className="text-slate-500 font-bold ml-1">
                    Add Time
                  </Text>
                </TouchableOpacity>
              </View>

              {showTimePicker && (
                <DateTimePicker
                  value={selectedTime}
                  mode="time"
                  is24Hour={true}
                  onChange={handleTimeChange}
                />
              )}
            </View>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
              className={`h-16 rounded-[24px] shadow-lg flex-row justify-center items-center ${
                loading ? "bg-slate-300" : "bg-blue-600 shadow-blue-200"
              }`}
            >
              <Text className="text-white font-bold text-lg mr-2 leading-[22px]">
                {loading ? "Saving..." : editMode ? "Update Reminder" : "Activate Reminder"}
              </Text>
              {!loading && (
                <View className="mt-[2px]">
                  <Bell size={20} color="white" />
                </View>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {medicines.length === 0 ? (
              <View className="items-center justify-center py-20">
                <View className="bg-slate-100 p-8 rounded-full mb-6">
                  <Bell size={40} color="#cbd5e1" />
                </View>
                <Text className="text-slate-900 text-xl font-bold">
                  Clear Schedule
                </Text>
                <Text className="text-slate-400 text-center mt-2 px-10">
                  No active medication reminders found.
                </Text>
              </View>
            ) : (
              medicines.map((medicine, index) => {
                const nextTime = getNextTime(medicine.times);
                const timeRemaining = calculateTimeRemaining(nextTime);

                return (
                  <View
                    key={index}
                    className="bg-white rounded-[32px] mb-5 overflow-hidden shadow-sm border border-slate-100"
                  >
                    <View className="p-6">
                      <View className="flex-row justify-between items-start mb-4">
                        <View className="flex-1">
                          <Text className="text-slate-900 font-bold text-xl">
                            {medicine.name}
                          </Text>
                          <View className="flex-row items-center mt-1">
                            <Clock size={14} color="#94a3b8" />
                            <Text className="text-slate-400 text-xs ml-1 font-medium">
                              {medicine.times.length} doses daily
                            </Text>
                          </View>
                        </View>
                        <View className="bg-green-100 px-3 py-1 rounded-full flex-row items-center">
                          <Timer size={12} color="#10b981" />
                          <Text className="text-green-700 text-[10px] font-bold ml-1 uppercase">
                            {timeRemaining} left
                          </Text>
                        </View>
                      </View>

                      <View className="bg-slate-50 rounded-2xl p-4 flex-row items-center justify-between">
                        <View>
                          <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-tighter">
                            Next Dose
                          </Text>
                          <Text className="text-slate-900 text-2xl font-black">
                            {nextTime}
                          </Text>
                        </View>
                        <View className="flex-row gap-2">
                          <TouchableOpacity
                            onPress={() => handleEditMedicine(medicine)}
                            className="bg-yellow-500 h-10 w-10 rounded-full items-center justify-center"
                          >
                            <Pencil size={20} color="white" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleDeleteMedicine(medicine._id)}
                            className="bg-red-500 h-10 w-10 rounded-full items-center justify-center"
                          >
                            <Trash2 size={20} color="white" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>

                    {medicine.times.length > 1 && (
                      <View className="px-6 pb-6 flex-row flex-wrap gap-2">
                        {medicine.times.map((t, idx) => (
                          <View
                            key={idx}
                            className={`px-3 py-1.5 rounded-xl border ${
                              t === nextTime
                                ? "bg-blue-50 border-blue-100"
                                : "bg-white border-slate-100"
                            }`}
                          >
                            <Text
                              className={`text-[11px] font-bold ${
                                t === nextTime
                                  ? "text-blue-600"
                                  : "text-slate-400"
                              }`}
                            >
                              {t}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const X = ({ size, color }) => (
  <View
    style={{
      width: size,
      height: size,
      alignItems: "center",
      justifyCenter: "center",
    }}
  >
    <Text style={{ color, fontSize: size, fontWeight: "bold" }}>×</Text>
  </View>
);
