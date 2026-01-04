import { getToken } from './authService';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const API_BASE_URL_REPORTS = `${API_BASE_URL}/api/reports`;

export const createReport = async (imageUri, title = '', description = '') => {
  try {
    const token = await getToken();

    if (!token) {
      throw new Error('No authentication token found');
    }

    // Create FormData for file upload
    const formData = new FormData();

    // Append the image file
    const fileName = imageUri.split('/').pop();
    const fileType = fileName.split('.').pop();

    formData.append('image', {
      uri: imageUri,
      name: fileName,
      type: `image/${fileType}`,
    });

    // Append optional fields
    if (title) formData.append('title', title);
    if (description) formData.append('description', description);

    const response = await axios.post(`${API_BASE_URL_REPORTS}/create`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('Error creating report:', error.response?.data || error.message);

    return {
      success: false,
      error: error.response?.data?.message || 'Failed to create report',
    };
  }
};

export const getUserReports = async () => {
  try {
    const token = await getToken();

    if (!token) {
      throw new Error('No authentication token found');
    }


    const response = await axios.get(`${API_BASE_URL_REPORTS}/my-reports`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });


    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    console.error('Error fetching reports:', error.response?.data || error.message);

    // Enhanced error handling for different scenarios
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      console.error('Response headers:', error.response.headers);

      if (error.response.status === 404) {
        return {
          success: false,
          error: 'Reports endpoint not found. Please check if the backend server is running and the endpoint is correct.',
        };
      } else if (error.response.status === 401) {
        return {
          success: false,
          error: 'Unauthorized. Please login again.',
        };
      } else if (error.response.status === 500) {
        return {
          success: false,
          error: 'Server error. Please try again later.',
        };
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      return {
        success: false,
        error: 'No response from server. Please check your internet connection and backend server status.',
      };
    } else {
      // Something happened in setting up the request
      console.error('Request setup error:', error.message);
      return {
        success: false,
        error: `Failed to fetch reports: ${error.message}`,
      };
    }

    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch reports',
    };
  }
};

export const deleteReport = async (reportId) => {
  try {
    const token = await getToken();

    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.delete(`${API_BASE_URL_REPORTS}/${reportId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return {
      success: true,
      message: response.data.message,
    };
  } catch (error) {
    console.error('Error deleting report:', error.response?.data || error.message);

    return {
      success: false,
      error: error.response?.data?.message || 'Failed to delete report',
    };
  }
};

// Helper function to format file size
export const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} bytes`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
