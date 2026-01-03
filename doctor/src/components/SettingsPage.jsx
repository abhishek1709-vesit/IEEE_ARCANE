import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Settings Section Component
const SettingsSection = ({ title, icon, children }) => {
  return (
    <div className="bg-white shadow-card rounded-lg p-6 mb-6">
      <div className="flex items-center mb-4">
        <div className="w-6 h-6 text-primary-500 mr-3">{icon}</div>
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  );
};

// Setting Item Component
const SettingItem = ({ label, description, children }) => {
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex justify-between items-center mb-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
          {description && (
            <p className="text-xs text-gray-500">{description}</p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
};

import { Sidebar } from "./Sidebar";

export const SettingsPage = () => {
  // State for all user settings with default values
  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: true,
    smsAlerts: false,
    darkMode: false,
    alertFrequency: "real-time",
    dataRefresh: "5-minutes",
    silentDeteriorationThreshold: "medium",
    riskScoringModel: "standard",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Apply dark mode from localStorage immediately on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("doctorSettings");
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      if (parsedSettings.darkMode) {
        document.documentElement.classList.add("dark");
      }
    }
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Simulate loading settings from API
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Load saved settings from localStorage if available
        const savedSettings = localStorage.getItem("doctorSettings");
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          setSettings(parsedSettings);
        } else {
          // Use default settings
          setSettings({
            notifications: true,
            emailAlerts: true,
            smsAlerts: false,
            darkMode: false,
            alertFrequency: "real-time",
            dataRefresh: "5-minutes",
            silentDeteriorationThreshold: "medium",
            riskScoringModel: "standard",
          });
        }
      } catch (err) {
        setError(err.message || "Failed to load settings");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Sync dark mode with settings state
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [settings.darkMode]);

  /**
   * Handle setting changes and persist to localStorage
   * @param {string} settingName - Name of the setting to change
   * @param {any} value - New value for the setting
   */
  const handleSettingChange = (settingName, value) => {
    // Handle notification toggles
    if (settingName === "notifications" && !value) {
      // If notifications are turned off, turn off email and SMS alerts too
      const newSettings = {
        ...settings,
        notifications: false,
        emailAlerts: false,
        smsAlerts: false,
      };
      setSettings(newSettings);
      // Persist changes immediately
      localStorage.setItem("doctorSettings", JSON.stringify(newSettings));
      return;
    }

    // Update state and persist to localStorage
    const newSettings = {
      ...settings,
      [settingName]: value,
    };
    setSettings(newSettings);
    // Persist changes immediately
    localStorage.setItem("doctorSettings", JSON.stringify(newSettings));
  };

  // Data refresh interval setup
  useEffect(() => {
    // Clear any existing interval when settings change
    const existingInterval = window.dataRefreshInterval;
    if (existingInterval) {
      clearInterval(existingInterval);
    }

    // Set up new interval based on data refresh setting
    if (settings.dataRefresh !== "manual") {
      let refreshRate;
      switch (settings.dataRefresh) {
        case "5-minutes":
          refreshRate = 5 * 60 * 1000; // 5 minutes
          break;
        case "15-minutes":
          refreshRate = 15 * 60 * 1000; // 15 minutes
          break;
        case "30-minutes":
          refreshRate = 30 * 60 * 1000; // 30 minutes
          break;
        default:
          refreshRate = 5 * 60 * 1000; // Default to 5 minutes
      }

      // Store the interval ID so we can clear it later
      window.dataRefreshInterval = setInterval(() => {
        console.log(`Refreshing data every ${settings.dataRefresh}`);
        // This would trigger your existing data fetch logic
        // For now, we'll just log it as the actual implementation would depend on your data fetching mechanism
      }, refreshRate);
    }

    // Cleanup on unmount
    return () => {
      if (window.dataRefreshInterval) {
        clearInterval(window.dataRefreshInterval);
        delete window.dataRefreshInterval;
      }
    };
  }, [settings.dataRefresh]);

  const handleLogout = () => {
    localStorage.removeItem("doctorToken");
    navigate("/");
  };

  const handleSaveSettings = () => {
    // Save settings to localStorage
    localStorage.setItem("doctorSettings", JSON.stringify(settings));

    // Show different messages based on settings
    const messages = [];
    if (settings.darkMode) messages.push("Dark mode enabled");
    if (settings.notifications) messages.push("Notifications enabled");
    if (settings.emailAlerts) messages.push("Email alerts enabled");
    if (settings.smsAlerts) messages.push("SMS alerts enabled");

    let message = "Settings saved successfully!";
    if (messages.length > 0) {
      message += "\n\n" + messages.join("\n");
    }

    alert(message);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

        if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative max-w-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium">{error}</p>
              <p className="text-sm mt-1">
                Please check your internet connection and try again.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <Sidebar />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Header */}
            <div className="bg-white shadow-card rounded-lg p-4 flex flex-col sm:flex-row justify-between items-center">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl font-bold text-gray-900">
                  Account Settings
                </h1>
                <p className="text-sm text-gray-500">
                  Customize your dashboard preferences
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleSaveSettings}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                  Save Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                  Logout
                </button>
              </div>
            </div>

            {/* Notification Settings */}
            <SettingsSection
              title="Notification Preferences"
              icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              }
            >
              <SettingItem
                label="Enable Notifications"
                description="Receive alerts for important patient updates"
              >
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications}
                    onChange={(e) =>
                      handleSettingChange("notifications", e.target.checked)
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </SettingItem>

              <SettingItem
                label="Email Alerts"
                description="Receive email notifications for critical alerts"
              >
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.emailAlerts}
                    onChange={(e) =>
                      handleSettingChange("emailAlerts", e.target.checked)
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </SettingItem>

              <SettingItem
                label="SMS Alerts"
                description="Receive text message alerts (carrier rates may apply)"
              >
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.smsAlerts}
                    onChange={(e) =>
                      handleSettingChange("smsAlerts", e.target.checked)
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </SettingItem>
            </SettingsSection>

            {/* Display Settings */}
            <SettingsSection
              title="Display Preferences"
              icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              }
            >
              <SettingItem
                label="Dark Mode"
                description="Enable dark theme for better night viewing"
              >
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.darkMode}
                    onChange={(e) =>
                      handleSettingChange("darkMode", e.target.checked)
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </SettingItem>
            </SettingsSection>

            {/* Alert Settings */}
            <SettingsSection
              title="Alert Configuration"
              icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
            >
              <SettingItem
                label="Alert Frequency"
                description="How often to receive alert notifications"
              >
                <select
                  value={settings.alertFrequency}
                  onChange={(e) =>
                    handleSettingChange("alertFrequency", e.target.value)
                  }
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="real-time">Real-time</option>
                  <option value="15-minutes">Every 15 minutes</option>
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily summary</option>
                </select>
              </SettingItem>

              <SettingItem
                label="Data Refresh Rate"
                description="How often dashboard data refreshes"
              >
                <select
                  value={settings.dataRefresh}
                  onChange={(e) =>
                    handleSettingChange("dataRefresh", e.target.value)
                  }
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="5-minutes">Every 5 minutes</option>
                  <option value="15-minutes">Every 15 minutes</option>
                  <option value="30-minutes">Every 30 minutes</option>
                  <option value="manual">Manual refresh only</option>
                </select>
              </SettingItem>
            </SettingsSection>

            {/* Clinical Settings */}
            <SettingsSection
              title="Clinical Settings"
              icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              }
            >
              <SettingItem
                label="Silent Deterioration Threshold"
                description="Sensitivity for detecting silent deterioration"
              >
                <select
                  value={settings.silentDeteriorationThreshold}
                  onChange={(e) =>
                    handleSettingChange(
                      "silentDeteriorationThreshold",
                      e.target.value
                    )
                  }
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="low">Low Sensitivity</option>
                  <option value="medium">Medium Sensitivity</option>
                  <option value="high">High Sensitivity</option>
                </select>
              </SettingItem>

              <SettingItem
                label="Risk Scoring Model"
                description="Algorithm used for patient risk assessment"
              >
                <select
                  value={settings.riskScoringModel}
                  onChange={(e) =>
                    handleSettingChange("riskScoringModel", e.target.value)
                  }
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="standard">Standard Model</option>
                  <option value="conservative">Conservative Model</option>
                  <option value="aggressive">Aggressive Model</option>
                </select>
              </SettingItem>
            </SettingsSection>

            {/* Account Information */}
            <SettingsSection
              title="Account Information"
              icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              }
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Status
                  </label>
                  <p className="text-sm text-green-600 font-medium">Active</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Login
                  </label>
                  <p className="text-sm text-gray-500">
                    {new Date().toLocaleString()}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Created
                  </label>
                  <p className="text-sm text-gray-500">
                    {new Date(
                      Date.now() - 30 * 24 * 60 * 60 * 1000
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </SettingsSection>
          </div>
        </div>
      </div>
    </div>
  );
};
