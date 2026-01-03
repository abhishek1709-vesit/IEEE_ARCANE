import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDoctorPatients } from "../services/api";
import { transformPatientData } from "../utils/patientDataTransformer";

// Patient Card Component
const PatientCard = ({ patient }) => {
  const getStatusStyles = () => {
    switch (patient.trend) {
      case "IMPROVING":
        return "bg-green-100 text-green-800";
      case "STABLE":
        return "bg-yellow-100 text-yellow-800";
      case "NEEDS_ATTENTION":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = () => {
    switch (patient.trend) {
      case "IMPROVING":
        return "🟢";
      case "STABLE":
        return "🟡";
      case "NEEDS_ATTENTION":
        return "🔴";
      default:
        return "❓";
    }
  };

  return (
    <div className="bg-white shadow-card rounded-lg p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-600 font-medium">
              {patient.username.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{patient.username}</h3>
            <p className="text-sm text-gray-500">{patient.email}</p>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyles()}`}
        >
          {getStatusIcon()} {patient.trend.replace("_", " ")}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Days Since Discharge</p>
          <p className="font-medium text-gray-900">
            {patient.daysSinceDischarge}
          </p>
        </div>
        <div>
          <p className="text-gray-500">Missed Check-Ins</p>
          <p className="font-medium text-gray-900">{patient.missedCheckIns}</p>
        </div>
        <div>
          <p className="text-gray-500">Last Update</p>
          <p className="font-medium text-gray-900">
            {patient.lastUpdate
              ? new Date(patient.lastUpdate).toLocaleDateString()
              : "Never"}
          </p>
        </div>
        <div>
          <p className="text-gray-500">Follow-Up Status</p>
          <p className="font-medium text-gray-900">{patient.followUpStatus}</p>
        </div>
      </div>

      {patient.silentDeterioration && (
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-xs font-medium text-yellow-800 flex items-center">
            <svg
              className="w-4 h-4 text-yellow-500 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.493-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-4a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
            Silent deterioration suspected
          </p>
        </div>
      )}
    </div>
  );
};

// Filter Controls Component
const FilterControls = ({ filters, setFilters }) => {
  return (
    <div className="bg-white shadow-card rounded-lg p-4 mb-6">
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Status:</span>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Patients</option>
            <option value="NEEDS_ATTENTION">Needs Attention</option>
            <option value="STABLE">Stable</option>
            <option value="IMPROVING">Improving</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Risk:</span>
          <select
            value={filters.risk}
            onChange={(e) => setFilters({ ...filters, risk: e.target.value })}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Levels</option>
            <option value="high">High Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="low">Low Risk</option>
          </select>
        </div>

        <button
          onClick={() => setFilters({ status: "all", risk: "all", search: "" })}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-sm transition-colors"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};

export const PatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    risk: "all",
    search: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        // Get doctor token from localStorage
        const doctorToken = localStorage.getItem("doctorToken");
        if (!doctorToken) {
          throw new Error("No authentication token found");
        }

        // Fetch real patients from backend
        const response = await getDoctorPatients(doctorToken);

        // Transform backend data to match frontend expected format
        const transformedPatients = response.patients.map(transformPatientData);

        setPatients(transformedPatients);
      } catch (err) {
        console.error("Error fetching patients:", err);
        // Provide more specific error message for network issues
        if (err.message.includes("Failed to fetch") || err.message.includes("Network")) {
          setError("Unable to connect to the server. Please ensure the backend is running and check your network connection.");
        } else {
          setError(err.message || "Failed to load patients");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("doctorToken");
    navigate("/");
  };

  // Filter patients based on selected filters
  const filteredPatients = patients.filter((patient) => {
    // Status filter
    if (filters.status !== "all" && patient.trend !== filters.status) {
      return false;
    }

    // Search filter
    if (
      filters.search &&
      !patient.username.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }

    return true;
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
                  🏥 Health
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
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <span className="font-medium text-primary-600">
                      Patients
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <div
                    className="flex items-center space-x-3"
                    onClick={() => navigate("/alerts")}
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
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-gray-600">Alerts</span>
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
                  Patients Overview
                </h1>
                <p className="text-sm text-gray-500">
                  Comprehensive patient management
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
                  {patients.length}
                </p>
                <p className="text-sm text-gray-500">Total Patients</p>
              </div>
              <div className="bg-white shadow-card rounded-lg p-4">
                <p className="text-2xl font-bold text-red-600">
                  {patients.filter((p) => p.trend === "NEEDS_ATTENTION").length}
                </p>
                <p className="text-sm text-gray-500">Needs Attention</p>
              </div>
              <div className="bg-white shadow-card rounded-lg p-4">
                <p className="text-2xl font-bold text-yellow-600">
                  {patients.filter((p) => p.trend === "STABLE").length}
                </p>
                <p className="text-sm text-gray-500">Stable</p>
              </div>
              <div className="bg-white shadow-card rounded-lg p-4">
                <p className="text-2xl font-bold text-green-600">
                  {patients.filter((p) => p.trend === "IMPROVING").length}
                </p>
                <p className="text-sm text-gray-500">Improving</p>
              </div>
            </div>

            {/* Filter Controls */}
            <FilterControls filters={filters} setFilters={setFilters} />

            {/* Patients Grid */}
            <div className="bg-white shadow-card rounded-lg p-6">
              <div className="mb-4 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">
                  Patient List
                </h2>
                <p className="text-sm text-gray-500">
                  {filteredPatients.length} of {patients.length} patients shown
                </p>
              </div>

              {filteredPatients.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="w-6 h-6 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-500">
                    No patients match the current filters
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredPatients.map((patient) => (
                    <PatientCard key={patient.id} patient={patient} />
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
