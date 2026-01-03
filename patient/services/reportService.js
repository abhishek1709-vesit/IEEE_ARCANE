import { getToken } from './authService';
import axios from 'axios';

const API_BASE_URL = 'https://overweening-unmomentously-garfield.ngrok-free.dev/api/reports';

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

    const response = await axios.post(`${API_BASE_URL}/create`, formData, {
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

    const response = await axios.get(`${API_BASE_URL}/my-reports`, {
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

    const response = await axios.delete(`${API_BASE_URL}/${reportId}`, {
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
