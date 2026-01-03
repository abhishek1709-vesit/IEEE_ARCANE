import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDoctorDashboard, getPatientSummary } from "../services/api";
import { PatientOverviewTable } from "./PatientOverviewTable";
import { PatientDetailView } from "./PatientDetailView";
import {
  mockPatients,
  getMockPatientDetails,
  mockDisclaimer,
} from "../data/mockData";

export const Dashboard = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [disclaimer, setDisclaimer] = useState("");
  const [useMockData, setUseMockData] = useState(true); // For demo purposes
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
          // Use mock data for demo
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium">{error}</p>
              <p className="text-sm mt-1">
                Please check your internet connection and try again.
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="ml-4 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Count patients by risk level for silent deterioration panel
  const silentDeteriorationPatients = patients.filter(
    (patient) => patient.silentDeterioration
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Doctor Dashboard
            </h1>
            <p className="text-gray-600">
              Post-Discharge Patient Monitoring System
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm"
            >
              Logout
            </button>
            <button
              onClick={() => setUseMockData(!useMockData)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded-md text-sm font-medium transition-colors shadow-sm"
            >
              {useMockData ? "Use Real Data" : "Use Mock Data"}
            </button>
          </div>
        </div>

        {/* Disclaimer */}
        {disclaimer && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-md shadow-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400 mt-0.5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.493-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-4a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">{disclaimer}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Silent Deterioration Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Silent Deterioration Alerts Panel */}
            <div className="bg-white shadow-card rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  🔍 Silent Deterioration Alerts
                </h2>
                <p className="text-sm text-gray-500">
                  Patients reporting "No issues" but showing risk signals
                </p>
              </div>
              <div className="p-6">
                {silentDeteriorationPatients.length === 0 ? (
                  <div className="text-center py-4">
                    <svg
                      className="mx-auto h-8 w-8 text-green-400"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-green-600 font-medium mt-2">
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
                        className="p-3 bg-yellow-50 rounded-lg border border-yellow-200 cursor-pointer hover:bg-yellow-100"
                        onClick={() => handlePatientClick(patient.id)}
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
                          <span className="text-yellow-500">→</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white shadow-card rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                📊 Quick Stats
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {patients.length}
                  </p>
                  <p className="text-sm text-gray-500">Total Patients</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {
                      patients.filter((p) => p.trend === "NEEDS_ATTENTION")
                        .length
                    }
                  </p>
                  <p className="text-sm text-gray-500">Needs Attention</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">
                    {patients.filter((p) => p.trend === "STABLE").length}
                  </p>
                  <p className="text-sm text-gray-500">Stable</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {patients.filter((p) => p.trend === "IMPROVING").length}
                  </p>
                  <p className="text-sm text-gray-500">Improving</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {selectedPatient ? (
              <PatientDetailView
                patient={selectedPatient}
                onBack={handleBackToOverview}
              />
            ) : (
              <PatientOverviewTable
                patients={patients}
                onPatientClick={handlePatientClick}
              />
            )}
          </div>
        </div>

        {/* Ethics & Safety Footer */}
        <div className="mt-12 pt-6 border-t border-gray-200">
          <div className="bg-white shadow-card rounded-lg p-6 text-center">
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
  );
};
