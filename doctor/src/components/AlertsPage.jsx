import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { mockPatients } from "../data/mockData";

// Alert Card Component
const AlertCard = ({ alert }) => {
  const getPriorityStyles = () => {
    switch (alert.priority) {
      case "high":
        return "border-red-400 bg-red-50";
      case "medium":
        return "border-yellow-400 bg-yellow-50";
      case "low":
        return "border-blue-400 bg-blue-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  const getPriorityText = () => {
    switch (alert.priority) {
      case "high":
        return "High Priority";
      case "medium":
        return "Medium Priority";
      case "low":
        return "Low Priority";
      default:
        return "Unknown Priority";
    }
  };

  return (
    <div
      className={`border-l-4 ${getPriorityStyles()} rounded-lg p-4 shadow-card`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-900">{alert.title}</h3>
        <span
          className={`text-xs font-medium px-2 py-1 rounded-full ${
            alert.priority === "high"
              ? "bg-red-100 text-red-800"
              : alert.priority === "medium"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {getPriorityText()}
        </span>
      </div>

      <p className="text-sm text-gray-600 mb-3">{alert.description}</p>

      <div className="flex flex-wrap gap-4 text-xs">
        <div className="flex items-center space-x-1">
          <svg
            className="w-3 h-3 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-gray-500">
            {new Date(alert.timestamp).toLocaleString()}
          </span>
        </div>

        <div className="flex items-center space-x-1">
          <svg
            className="w-3 h-3 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span className="text-gray-500">{alert.patient}</span>
        </div>

        {alert.type && (
          <div className="flex items-center space-x-1">
            <svg
              className="w-3 h-3 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
            <span className="text-gray-500">{alert.type}</span>
          </div>
        )}
      </div>

      {alert.actionRequired && (
        <div className="mt-3 p-2 bg-gray-50 rounded border border-gray-200">
          <p className="text-xs text-gray-600">⚠️ {alert.actionRequired}</p>
        </div>
      )}
    </div>
  );
};

// Filter Controls Component
const AlertFilterControls = ({ filters, setFilters }) => {
  return (
    <div className="bg-white shadow-card rounded-lg p-4 mb-6">
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Priority:</span>
          <select
            value={filters.priority}
            onChange={(e) =>
              setFilters({ ...filters, priority: e.target.value })
            }
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Type:</span>
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Types</option>
            <option value="silent_deterioration">Silent Deterioration</option>
            <option value="medication">Medication</option>
            <option value="check_in">Check-In</option>
            <option value="symptom">Symptom</option>
          </select>
        </div>

        <button
          onClick={() =>
            setFilters({ priority: "all", type: "all", status: "all" })
          }
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-sm transition-colors"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};

export const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    priority: "all",
    type: "all",
    status: "all",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        // Generate mock alerts from patient data
        const generatedAlerts = [];

        // Add silent deterioration alerts
        mockPatients.forEach((patient) => {
          if (patient.silentDeterioration) {
            generatedAlerts.push({
              id: `alert-${patient.id}-silent`,
              title: `Silent Deterioration Detected`,
              description: `Patient ${patient.username} reports "No issues" but system detects worsening trends and reduced engagement.`,
              patient: patient.username,
              priority: "high",
              type: "silent_deterioration",
              timestamp: new Date(
                Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000
              ),
              actionRequired: "Immediate follow-up recommended",
            });
          }
        });

        // Add medication alerts for patients with missed check-ins
        mockPatients.forEach((patient) => {
          if (patient.missedCheckIns > 2) {
            generatedAlerts.push({
              id: `alert-${patient.id}-medication`,
              title: `Medication Adherence Concern`,
              description: `Patient ${patient.username} has missed ${patient.missedCheckIns} check-ins, indicating potential medication adherence issues.`,
              patient: patient.username,
              priority: patient.missedCheckIns > 3 ? "high" : "medium",
              type: "medication",
              timestamp: new Date(
                Date.now() - Math.floor(Math.random() * 3) * 24 * 60 * 60 * 1000
              ),
              actionRequired:
                patient.missedCheckIns > 3
                  ? "Contact patient immediately"
                  : "Monitor closely",
            });
          }
        });

        // Add some general alerts
        generatedAlerts.push({
          id: "alert-system-1",
          title: "System Performance Normal",
          description:
            "All monitoring systems are operating normally with no detected issues.",
          patient: "System",
          priority: "low",
          type: "system",
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        });

        setAlerts(generatedAlerts);
      } catch (err) {
        setError(err.message || "Failed to load alerts");
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("doctorToken");
    navigate("/");
  };

  // Filter alerts based on selected filters
  const filteredAlerts = alerts.filter((alert) => {
    // Priority filter
    if (filters.priority !== "all" && alert.priority !== filters.priority) {
      return false;
    }

    // Type filter
    if (filters.type !== "all" && alert.type !== filters.type) {
      return false;
    }

    return true;
  });

  // Sort alerts by priority (high first) and timestamp (newest first)
  const sortedAlerts = [...filteredAlerts].sort((a, b) => {
    // Priority order
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }

    // Timestamp order (newest first)
    return new Date(b.timestamp) - new Date(a.timestamp);
  });

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
            <button
              onClick={() => window.location.reload()}
              className="ml-4 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
            >
              Retry
            </button>
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
            <div className="w-64 bg-white shadow-card rounded-lg p-6 h-full">
              <div className="mb-8">
                <h1 className="text-xl font-bold text-primary-600">
                  🏥 HealthSentry
                </h1>
                <p className="text-xs text-gray-500 mt-1">
                  Post-Discharge Monitoring
                </p>
              </div>

              <nav className="space-y-2">
                <div className="p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <div
                    className="flex items-center space-x-3"
                    onClick={() => navigate("/dashboard")}
                  >
                    <svg
                      className="w-5 h-5 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                    <span className="text-gray-600">Dashboard</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <div
                    className="flex items-center space-x-3"
                    onClick={() => navigate("/patients")}
                  >
                    <svg
                      className="w-5 h-5 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <span className="text-gray-600">Patients</span>
                  </div>
                </div>

                <div className="bg-primary-50 rounded-lg p-3">
                  <div className="flex items-center space-x-3">
                    <svg
                      className="w-5 h-5 text-primary-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="font-medium text-primary-600">Alerts</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <div
                    className="flex items-center space-x-3"
                    onClick={() => navigate("/settings")}
                  >
                    <svg
                      className="w-5 h-5 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="text-gray-600">Settings</span>
                  </div>
                </div>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Header */}
            <div className="bg-white shadow-card rounded-lg p-4 flex flex-col sm:flex-row justify-between items-center">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl font-bold text-gray-900">
                  Alerts Center
                </h1>
                <p className="text-sm text-gray-500">
                  Real-time patient monitoring alerts
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                  Logout
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white shadow-card rounded-lg p-4">
                <p className="text-2xl font-bold text-gray-900">
                  {alerts.length}
                </p>
                <p className="text-sm text-gray-500">Total Alerts</p>
              </div>
              <div className="bg-white shadow-card rounded-lg p-4">
                <p className="text-2xl font-bold text-red-600">
                  {alerts.filter((a) => a.priority === "high").length}
                </p>
                <p className="text-sm text-gray-500">High Priority</p>
              </div>
              <div className="bg-white shadow-card rounded-lg p-4">
                <p className="text-2xl font-bold text-yellow-600">
                  {alerts.filter((a) => a.priority === "medium").length}
                </p>
                <p className="text-sm text-gray-500">Medium Priority</p>
              </div>
              <div className="bg-white shadow-card rounded-lg p-4">
                <p className="text-2xl font-bold text-green-600">
                  {alerts.filter((a) => a.priority === "low").length}
                </p>
                <p className="text-sm text-gray-500">Low Priority</p>
              </div>
            </div>

            {/* Filter Controls */}
            <AlertFilterControls filters={filters} setFilters={setFilters} />

            {/* Alerts List */}
            <div className="bg-white shadow-card rounded-lg p-6">
              <div className="mb-4 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">
                  Active Alerts
                </h2>
                <p className="text-sm text-gray-500">
                  {filteredAlerts.length} of {alerts.length} alerts shown
                </p>
              </div>

              {sortedAlerts.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-green-600 font-medium">
                    No alerts match the current filters
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    All systems operating normally
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedAlerts.map((alert) => (
                    <AlertCard key={alert.id} alert={alert} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
