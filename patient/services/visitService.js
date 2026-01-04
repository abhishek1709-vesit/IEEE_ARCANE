import { API_BASE_URL } from '../config/api';
import { getToken } from './authService';

const API_URL = `${API_BASE_URL}/api/visits`;

// Doctor Visit Service Functions
export const createDoctorVisit = async (doctorName, dateOfVisit, timeOfVisit) => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/doctor-visit/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        doctorName,
        dateOfVisit,
        timeOfVisit
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create doctor visit');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating doctor visit:', error);
    throw error;
  }
};

export const getDoctorVisits = async () => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/doctor-visits`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    // Check if response is HTML (indicating backend error)
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      const text = await response.text();
      console.error('Backend returned HTML instead of JSON:', text);
      throw new Error('Backend server error - received HTML response');
    }

    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch doctor visits');
      } catch (jsonError) {
        // If we can't parse JSON, it might be HTML or other content
        const text = await response.text();
        console.error('Non-JSON error response:', text);
        throw new Error(`Failed to fetch doctor visits: ${response.status} ${response.statusText}`);
      }
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching doctor visits:', error);
    // Return empty array instead of throwing to allow app to continue
    return { success: false, data: [] };
  }
};

export const deleteDoctorVisit = async (visitId) => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/doctor-visit/${visitId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete doctor visit');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting doctor visit:', error);
    throw error;
  }
};

// Test Visit Service Functions
export const createTestVisit = async (testName, dateOfTest, timeOfTest) => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/test-visit/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        testName,
        dateOfTest,
        timeOfTest
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create test visit');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating test visit:', error);
    throw error;
  }
};

export const getTestVisits = async () => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/test-visits`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    // Check if response is HTML (indicating backend error)
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      const text = await response.text();
      console.error('Backend returned HTML instead of JSON:', text);
      throw new Error('Backend server error - received HTML response');
    }

    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch test visits');
      } catch (jsonError) {
        // If we can't parse JSON, it might be HTML or other content
        const text = await response.text();
        console.error('Non-JSON error response:', text);
        throw new Error(`Failed to fetch test visits: ${response.status} ${response.statusText}`);
      }
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching test visits:', error);
    // Return empty array instead of throwing to allow app to continue
    return { success: false, data: [] };
  }
};

export const deleteTestVisit = async (visitId) => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/test-visit/${visitId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete test visit');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting test visit:', error);
    throw error;
  }
};
