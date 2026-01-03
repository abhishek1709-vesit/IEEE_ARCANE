import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Base URL for the backend API
const API_BASE_URL = 'https://overweening-unmomentously-garfield.ngrok-free.dev/api/auth';

// Store token in AsyncStorage
export const storeToken = async (token) => {
  try {
    await AsyncStorage.setItem('token', token);
    return true;
  } catch (error) {
    console.error('Error storing token:', error);
    return false;
  }
};

// Get token from AsyncStorage
export const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    return token;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

// Remove token from AsyncStorage
export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem('token');
    return true;
  } catch (error) {
    console.error('Error removing token:', error);
    return false;
  }
};

// Register user
export const registerUser = async (username, email, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/register`, {
      username,
      email,
      password
    });

    if (response.data.token) {
      await storeToken(response.data.token);
    }

    return {
      success: true,
      data: response.data,
      token: response.data.token
    };
  } catch (error) {
    console.error('Registration error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || 'Registration failed'
    };
  }
};

// Login user
export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/login`, {
      email,
      password
    });

    if (response.data.token) {
      await storeToken(response.data.token);
    }

    return {
      success: true,
      data: response.data,
      token: response.data.token
    };
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || 'Login failed'
    };
  }
};

// Check if user is authenticated
export const isAuthenticated = async () => {
  try {
    const token = await getToken();
    return !!token; // Return true if token exists, false otherwise
  } catch (error) {
    console.error('Auth check error:', error);
    return false;
  }
};
