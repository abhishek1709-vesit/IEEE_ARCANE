import { API_BASE_URL } from '../config/api';
import { getToken } from './authService';

export const getPatientBills = async () => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/api/bills/patient`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch bills');
    }

    const data = await response.json();
    return {
      success: true,
      bills: data.bills || data.data || [],
    };
  } catch (error) {
    console.error('Error fetching patient bills:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch bills',
    };
  }
};

export const getBillDetails = async (billId) => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/api/bills/${billId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch bill details');
    }

    const data = await response.json();
    return {
      success: true,
      bill: data.bill || data.data,
    };
  } catch (error) {
    console.error('Error fetching bill details:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch bill details',
    };
  }
};

export const markBillAsPaid = async (billId) => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/api/bills/${billId}/pay`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        status: 'PAID'
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to mark bill as paid');
    }

    const data = await response.json();
    return {
      success: true,
      bill: data.bill || data.data,
    };
  } catch (error) {
    console.error('Error marking bill as paid:', error);
    return {
      success: false,
      error: error.message || 'Failed to mark bill as paid',
    };
  }
};
