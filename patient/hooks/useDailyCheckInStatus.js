import { useState, useEffect } from "react";
import { getToken } from "../services/authService";
import { API_BASE_URL } from "../config/api";

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
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => null);
        console.error("Check-in status request failed", {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        });
        setError(
          `Failed to check check-in status: ${response.status} ${
            response.statusText
          }${errorText ? " - " + errorText : ""}`
        );
        setCheckInCompleted(false);
        setIsLoading(false);
        return;
      }

      const data = await response.json().catch((err) => {
        console.error("Failed to parse check-in status JSON:", err);
        setError("Invalid response from server");
        setCheckInCompleted(false);
        return null;
      });

      if (data) {
        setCheckInCompleted(data.exists);
      }
    } catch (error) {
      console.error("Error checking daily check-in status:", error);
      setError("Failed to check check-in status");
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
    refreshCheckInStatus: checkDailyCheckInStatus,
  };
};
