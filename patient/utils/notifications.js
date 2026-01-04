import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

/* -------------------------------------------------------
   GLOBAL HANDLER
------------------------------------------------------- */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/* -------------------------------------------------------
   TIMEZONE-SAFE DATE BUILDER (CRITICAL FIX)
------------------------------------------------------- */
const buildLocalDateTime = (date, time) => {
  const [hour, minute] = time.split(":").map(Number);

  let year, month, day;

  if (date instanceof Date) {
    year = date.getFullYear();
    month = date.getMonth();
    day = date.getDate();
  } else if (typeof date === "string") {
    // 🔥 STRIP TIMEZONE / TIME PART COMPLETELY
    const cleanDate = date.split("T")[0]; // YYYY-MM-DD
    [year, month, day] = cleanDate.split("-").map(Number);
    month = month - 1; // JS months are 0-based
  } else {
    throw new Error("Invalid date format");
  }

  return new Date(year, month, day, hour, minute, 0, 0);
};

const formatTime = (date) =>
  date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

/* -------------------------------------------------------
   REQUEST PERMISSIONS + ANDROID CHANNELS
------------------------------------------------------- */
export const requestNotificationPermissions = async () => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();

    // Request permissions if not already granted
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") return false;
    }

    // Set up Android channels if needed
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("medicine_reminders", {
        name: "Medicine Reminders",
        importance: Notifications.AndroidImportance.HIGH,
      });

      await Notifications.setNotificationChannelAsync("doctor_visits", {
        name: "Doctor Visit Reminders",
        importance: Notifications.AndroidImportance.HIGH,
      });

      await Notifications.setNotificationChannelAsync("test_visits", {
        name: "Test Visit Reminders",
        importance: Notifications.AndroidImportance.HIGH,
      });

      await Notifications.setNotificationChannelAsync("daily_checkin", {
        name: "Daily Check-In",
        importance: Notifications.AndroidImportance.HIGH,
      });
    }

    return true;
  } catch (e) {
    console.error("❌ Permission error:", e);
    return false;
  }
};

/* -------------------------------------------------------
   MEDICINE REMINDER (DAILY) - FIXED TIMEZONE ISSUE
------------------------------------------------------- */
export const scheduleMedicineReminder = async (
  time,
  medicineName,
  reminderKey
) => {
  const [hour, minute] = time.split(':').map(Number);

  // 🔥 CRITICAL FIX: Build proper Date object with today's date + specified time
  const now = new Date();
  const triggerDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hour,
    minute,
    0,
    0
  );

  // Debug logging

  // If the scheduled time is in the past, schedule for tomorrow
  if (triggerDate <= now) {
    triggerDate.setDate(triggerDate.getDate() + 1);
  }

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Medicine Reminder 💊',
      body: `Take ${medicineName}.`,
      sound: 'default',
    },
    trigger: {
      hour,
      minute,
      repeats: true,
      channelId:
        Platform.OS === 'android' ? 'medicine_reminders' : undefined,
    },
  });

  await AsyncStorage.setItem(`medicine_${reminderKey}`, id);
};


/* -------------------------------------------------------
   DOCTOR VISIT REMINDER (ONE-TIME) ✅ FIXED
------------------------------------------------------- */
export const scheduleDoctorVisitReminder = async (
  date,
  time,
  doctorName,
  visitId
) => {
  try {
    const visitDate = buildLocalDateTime(date, time);
    const now = new Date();

    if (visitDate <= now) {
      return;
    }

    const timeLabel = formatTime(visitDate);

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Doctor Appointment Reminder 🩺",
        body: `Appointment with Dr. ${doctorName} at ${timeLabel}.`,
        sound: "default",
      },
      trigger: {
        date: visitDate,
        channelId: Platform.OS === "android" ? "doctor_visits" : undefined,
      },
    });

    await AsyncStorage.setItem(`doctor_visit_${visitId}`, notificationId);
  } catch (e) {
    console.error("❌ Doctor reminder error:", e);
  }
};

/* -------------------------------------------------------
   TEST VISIT REMINDER (ONE-TIME) ✅ FIXED
------------------------------------------------------- */
export const scheduleTestVisitReminder = async (
  date,
  time,
  testName,
  testId
) => {
  try {
    const visitDate = buildLocalDateTime(date, time);
    const now = new Date();

    if (visitDate <= now) {
      return;
    }

    const timeLabel = formatTime(visitDate);

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Lab Test Reminder 🧪",
        body: `${testName} test at ${timeLabel}.`,
        sound: "default",
      },
      trigger: {
        date: visitDate,
        channelId: Platform.OS === "android" ? "test_visits" : undefined,
      },
    });

    await AsyncStorage.setItem(`test_visit_${testId}`, notificationId);
  } catch (e) {
    console.error("❌ Test reminder error:", e);
  }
};

/* -------------------------------------------------------
   CANCEL DOCTOR VISIT ✅ WORKS
------------------------------------------------------- */
export const cancelDoctorVisitReminder = async (visitId) => {
  const id = await AsyncStorage.getItem(`doctor_visit_${visitId}`);
  if (!id) return;

  await Notifications.cancelScheduledNotificationAsync(id);
  await AsyncStorage.removeItem(`doctor_visit_${visitId}`);

};

/* -------------------------------------------------------
   CANCEL TEST VISIT ✅ WORKS
------------------------------------------------------- */
export const cancelTestVisitReminder = async (testId) => {
  const id = await AsyncStorage.getItem(`test_visit_${testId}`);
  if (!id) return;

  await Notifications.cancelScheduledNotificationAsync(id);
  await AsyncStorage.removeItem(`test_visit_${testId}`);

};

export const scheduleDailyCheckInReminder = async () => {
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Daily Recovery Check-In 🌱',
        body: 'Take 2 minutes to check in on your recovery today.',
        sound: 'default',
      },
      trigger: {
        hour: 9,
        minute: 0,
        repeats: true,
        channelId: Platform.OS === 'android' ? 'daily_checkin' : undefined,
      },
    });

    await AsyncStorage.setItem('daily_checkin_reminder', id);
  } catch (e) {
    console.error('❌ Daily check-in reminder error:', e);
  }
};

/* -------------------------------------------------------
   CANCEL ALL VISIT REMINDERS
------------------------------------------------------- */
export const cancelAllVisitReminders = async () => {
  const keys = await AsyncStorage.getAllKeys();
  const visitKeys = keys.filter(
    (k) => k.startsWith("doctor_visit_") || k.startsWith("test_visit_")
  );

  for (const key of visitKeys) {
    const id = await AsyncStorage.getItem(key);
    if (id) {
      await Notifications.cancelScheduledNotificationAsync(id);
    }
    await AsyncStorage.removeItem(key);
  }

};
