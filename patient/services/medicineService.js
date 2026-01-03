import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { getToken } from './authService';
import { API_BASE_URL } from '../config/api';

const API_BASE_URL_MEDICINE = `${API_BASE_URL}/api/medicine`;

export const createMedicineReminder = async (name, times) => {
  try {
    const token = await getToken();

    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.post(
      `${API_BASE_URL_MEDICINE}/reminder/create`,
      { name, times },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('Error creating medicine reminder:', error.response?.data || error.message);

    return {
      success: false,
      error: error.response?.data?.message || 'Failed to create medicine reminder',
    };
  }
};

export const getUserMedicines = async () => {
  try {
    const token = await getToken();

    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.get(`${API_BASE_URL_MEDICINE}/reminders`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    console.error('Error fetching medicines:', error.response?.data || error.message);

    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch medicines',
    };
  }
};

// Helper function to format time in 24-hour format
export const formatTime24Hour = (date) => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};
