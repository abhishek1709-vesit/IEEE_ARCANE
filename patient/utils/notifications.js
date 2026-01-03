import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/* -------------------------------------------------------
   Global notification handler
------------------------------------------------------- */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/* -------------------------------------------------------
   Request Notification Permissions
------------------------------------------------------- */
export const requestNotificationPermissions = async () => {
  try {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowSound: true,
          allowBadge: false,
        },
      });
      finalStatus = status;
    }

    // ANDROID CHANNELS (MANDATORY)
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('daily_checkin', {
        name: 'Daily Check-In Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#3b82f6',
      });

      await Notifications.setNotificationChannelAsync('medicine_reminders', {
        name: 'Medicine Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#22c55e',
      });
    }

    return finalStatus === 'granted';
  } catch (error) {
    console.error('Notification permission error:', error);
    return false;
  }
};

/* -------------------------------------------------------
   DAILY CHECK-IN REMINDER (9:00 AM)
------------------------------------------------------- */
export const scheduleDailyCheckInReminder = async () => {
  try {
    // Prevent duplicates
    await cancelDailyCheckInReminder();

    await Notifications.scheduleNotificationAsync({
      identifier: 'daily-checkin-reminder',
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

    console.log('✅ Daily check-in reminder scheduled');
  } catch (error) {
    console.error('❌ Error scheduling daily check-in:', error);
  }
};

export const cancelDailyCheckInReminder = async () => {
  try {
    await Notifications.cancelScheduledNotificationAsync(
      'daily-checkin-reminder'
    );
  } catch (error) {
    console.error('Error cancelling daily check-in reminder:', error);
  }
};

/* -------------------------------------------------------
   MEDICINE REMINDER (REPEATING DAILY)
------------------------------------------------------- */
export const scheduleMedicineReminder = async (
  time,
  medicineName,
  reminderId
) => {
  try {
    const [hour, minute] = time.split(':').map(Number);

    await Notifications.scheduleNotificationAsync({
      identifier: reminderId,
      content: {
        title: 'Medicine Reminder 💊',
        body: `It's time to take ${medicineName}.`,
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

    console.log(`✅ Medicine reminder scheduled: ${medicineName} at ${time}`);
  } catch (error) {
    console.error('❌ Error scheduling medicine reminder:', error);
  }
};

/* -------------------------------------------------------
   CANCEL ALL MEDICINE REMINDERS
------------------------------------------------------- */
export const cancelAllMedicineReminders = async () => {
  try {
    const scheduled =
      await Notifications.getAllScheduledNotificationsAsync();

    const medicineReminders = scheduled.filter((n) =>
      n.identifier.startsWith('medicine-reminder-')
    );

    for (const reminder of medicineReminders) {
      await Notifications.cancelScheduledNotificationAsync(
        reminder.identifier
      );
    }

    console.log('✅ All medicine reminders cancelled');
  } catch (error) {
    console.error('❌ Error cancelling medicine reminders:', error);
  }
};
