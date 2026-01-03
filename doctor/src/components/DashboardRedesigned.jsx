import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDoctorDashboard, getPatientSummary } from "../services/api";
import { PatientOverviewTableRedesigned } from "./PatientOverviewTableRedesigned";
import { PatientDetailViewRedesigned } from "./PatientDetailViewRedesigned";
import { Sidebar } from "./Sidebar";
import {
  mockPatients,
  getMockPatientDetails,
  mockDisclaimer,
} from "../data/mockData";

// Header Component
const Header = ({ onLogout, useMockData, toggleMockData }) => {
  return (
    <div className="bg-white shadow-card rounded-lg p-4 flex flex-col sm:flex-row justify-between items-center">
      <div className="mb-4 sm:mb-0">
        <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
        <p className="text-sm text-gray-500">
          Post-Discharge Patient Monitoring System
        </p>
      </div>

      <div className="flex items-center space-x-3">
        <button
          onClick={toggleMockData}
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          {useMockData ? "Use Real Data" : "Use Mock Data"}
        </button>
        <button
          onClick={onLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

// Disclaimer Banner Component
const DisclaimerBanner = ({ disclaimer }) => {
  if (!disclaimer) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start space-x-3">
      <div className="flex-shrink-0">
        <svg
          className="w-5 h-5 text-yellow-500 mt-0.5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.493-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-4a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <div>
        <p className="text-sm text-yellow-800">{disclaimer}</p>
      </div>
    </div>
  );
};

// Quick Stats Cards Component
const QuickStats = ({ patients }) => {
  const stats = [
    {
      title: "Total Patients",
      value: patients.length,
      icon: (
        <svg
          className="w-6 h-6 text-primary-500"
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
      ),
      color: "text-gray-900",
    },
    {
      title: "Needs Attention",
      value: patients.filter((p) => p.trend === "NEEDS_ATTENTION").length,
      icon: (
        <svg
          className="w-6 h-6 text-red-500"
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
      ),
      color: "text-red-600",
    },
    {
      title: "Stable",
      value: patients.filter((p) => p.trend === "STABLE").length,
      icon: (
        <svg
          className="w-6 h-6 text-yellow-500"
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
      ),
      color: "text-yellow-600",
    },
    {
      title: "Improving",
      value: patients.filter((p) => p.trend === "IMPROVING").length,
      icon: (
        <svg
          className="w-6 h-6 text-green-500"
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
      ),
      color: "text-green-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white shadow-card rounded-lg p-4 flex items-center space-x-3"
        >
          <div className="p-3 bg-gray-50 rounded-lg">{stat.icon}</div>
          <div>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

// Silent Deterioration Alerts Component
const SilentDeteriorationAlerts = ({ patients, onPatientClick }) => {
  const silentDeteriorationPatients = patients.filter(
    (p) => p.silentDeterioration
  );

  return (
    <div className="bg-white shadow-card rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <svg
            className="w-5 h-5 text-yellow-500 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          Silent Deterioration Alerts
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Patients reporting "No issues" but showing risk signals
        </p>
      </div>

      <div className="p-4">
        {silentDeteriorationPatients.length === 0 ? (
          <div className="text-center py-6">
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
              No silent deterioration detected
            </p>
            <p className="text-xs text-gray-500 mt-1">
              All patients showing consistent recovery patterns
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {silentDeteriorationPatients.map((patient) => (
              <div
                key={patient.id}
                className="bg-yellow-50 rounded-lg p-3 border border-yellow-200 cursor-pointer hover:bg-yellow-100 transition-colors"
                onClick={() => onPatientClick(patient.id)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-yellow-800">
                      {patient.username}
                    </p>
                    <p className="text-xs text-yellow-600">
                      ⚠️ Silent deterioration suspected
                    </p>
                  </div>
                  <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-yellow-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const DashboardRedesigned = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [disclaimer, setDisclaimer] = useState("");
  const [useMockData, setUseMockData] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      const token = localStorage.getItem("doctorToken");
      if (!token) {
        navigate("/");
        return;
      }

      try {
        if (useMockData) {
          setPatients(mockPatients);
          setDisclaimer(mockDisclaimer);
        } else {
          const data = await getDoctorDashboard(token);
          setPatients(data.patients || []);
          setDisclaimer(data.disclaimer || "");
        }
      } catch (err) {
        setError(err.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate, useMockData]);

  const handlePatientClick = async (patientId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("doctorToken");
      let data;

      if (useMockData) {
        data = getMockPatientDetails(patientId);
      } else {
        data = await getPatientSummary(token, patientId);
      }

      setSelectedPatient(data);
    } catch (err) {
      setError(err.message || "Failed to load patient details");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("doctorToken");
    navigate("/");
  };

  const handleBackToOverview = () => {
    setSelectedPatient(null);
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
            <Sidebar />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Header */}
            <Header
              onLogout={handleLogout}
              useMockData={useMockData}
              toggleMockData={() => setUseMockData(!useMockData)}
            />

            {/* Disclaimer */}
            <DisclaimerBanner disclaimer={disclaimer} />

            {/* Quick Stats */}
            <QuickStats patients={patients} />

            {/* Silent Deterioration Alerts */}
            <SilentDeteriorationAlerts
              patients={patients}
              onPatientClick={handlePatientClick}
            />

            {/* Main Content Area */}
            <div className="bg-white shadow-card rounded-lg">
              {selectedPatient ? (
                <PatientDetailViewRedesigned
                  patient={selectedPatient}
                  onBack={handleBackToOverview}
                />
              ) : (
                <PatientOverviewTableRedesigned
                  patients={patients}
                  onPatientClick={handlePatientClick}
                />
              )}
            </div>

            {/* Ethics & Safety Footer */}
            <div className="bg-white shadow-card rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600">
                <strong>Ethics & Safety Notice:</strong> This dashboard provides
                recovery trends and risk indicators only. It does not provide
                diagnoses or treatment recommendations. All medical decisions
                should be made by qualified healthcare professionals.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
