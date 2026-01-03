import { useState, useEffect } from 'react';
import { getToken } from '../services/authService';
import { API_BASE_URL } from '../config/api';

export const useDailyCheckInStatus = () => {
    const [checkInCompleted, setCheckInCompleted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const checkDailyCheckInStatus = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const token = await getToken();
            if (!token) {
                setCheckInCompleted(false);
                setIsLoading(false);
                return;
            }

        const response = await fetch(`${API_BASE_URL}/api/checkin/today`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to check daily check-in status');
            }

            const data = await response.json();
            setCheckInCompleted(data.exists);

        } catch (error) {
            console.error('Error checking daily check-in status:', error);
            setError('Failed to check check-in status');
            setCheckInCompleted(false);
        } finally {
            setIsLoading(false);
        }
    };

    // Check status on initial load
    useEffect(() => {
        checkDailyCheckInStatus();
    }, []);

    return {
        checkInCompleted,
        isLoading,
        error,
        refreshCheckInStatus: checkDailyCheckInStatus
    };
};
