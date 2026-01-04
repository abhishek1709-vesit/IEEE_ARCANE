import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPatientSummary, createBill, getPatientBills } from "../services/api";
import { Sidebar } from "./Sidebar";

export const PatientDetailPage = () => {
  const { patientId } = useParams();
  const [patient, setPatient] = useState(null);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showBillForm, setShowBillForm] = useState(false);
  const [billDescription, setBillDescription] = useState("");
  const [billAmount, setBillAmount] = useState("");
  const [billLoading, setBillLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const token = localStorage.getItem("doctorToken");
        if (!token) {
          navigate("/");
          return;
        }

        console.log("Fetching patient summary for ID:", patientId);

        // Fetch patient summary
        const summaryData = await getPatientSummary(token, patientId);
        console.log("Patient summary data received:", summaryData);
        setPatient(summaryData);

        // Fetch patient bills
        const billsData = await getPatientBills(token, patientId);
        setBills(billsData.data || []);

      } catch (err) {
        console.error("Error fetching patient data:", err);
        setError(err.message || "Failed to load patient data");
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [patientId, navigate]);

  const handleGenerateBill = async (e) => {
    e.preventDefault();
    if (!billDescription.trim() || !billAmount) {
      setError("Please fill in all bill fields");
      return;
    }

    setBillLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("doctorToken");
      const amount = parseFloat(billAmount);

      if (isNaN(amount) || amount <= 0) {
        setError("Please enter a valid positive amount");
        return;
      }

      const result = await createBill(token, patientId, billDescription, amount);

      // Refresh bills list
      const billsData = await getPatientBills(token, patientId);
      setBills(billsData.data || []);

      // Reset form
      setBillDescription("");
      setBillAmount("");
      setShowBillForm(false);

    } catch (err) {
      setError(err.message || "Failed to generate bill");
    } finally {
      setBillLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("doctorToken");
    navigate("/");
  };

  const handleBackToPatients = () => {
    navigate("/patients");
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
                <h1 className="text-2xl font-bold text-gray-900">Patient Details</h1>
                <p className="text-sm text-gray-500">
                  Comprehensive patient information and billing
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleBackToPatients}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                  Back to Patients
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                  Logout
                </button>
              </div>
            </div>

            {/* Patient Information */}
            <div className="bg-white shadow-card rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Patient Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-1">Name</p>
                    <p className="text-lg font-medium text-gray-900">{patient?.patient?.username}</p>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-1">Email</p>
                    <p className="text-lg font-medium text-gray-900">{patient?.patient?.email}</p>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-1">Recovery Trend</p>
                    <p className={`text-lg font-medium ${getTrendColor(patient?.trend)}`}>
                      {patient?.trend?.replace("_", " ")}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-1">Missed Check-Ins</p>
                    <p className="text-lg font-medium text-gray-900">{patient?.missedCheckIns}</p>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-1">Risk Flags</p>
                    <div className="flex flex-wrap gap-2">
                      {patient?.riskFlags?.map((flag, index) => (
                        <span key={index} className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                          {flag}
                        </span>
                      )) || <span className="text-gray-500">No risk flags</span>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-sm text-gray-500 mb-1">AI Summary</p>
                <p className="text-gray-700">{patient?.aiSummary}</p>
              </div>
            </div>

            {/* Reports Section */}
            <div className="bg-white shadow-card rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Reports</h2>

              {patient?.reports?.length > 0 ? (
                <div className="space-y-4">
                  {patient.reports.map((report, index) => (
                    <div key={index} className="border border-gray-100 rounded-lg p-4">
                      <p className="text-sm text-gray-500 mb-1">
                        {new Date(report.createdAt).toLocaleString()}
                      </p>
                      <p className="text-gray-700">{report.content || "No content available"}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No reports available</p>
              )}
            </div>

            {/* Medicines Section */}
            <div className="bg-white shadow-card rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Medicines</h2>

              {patient?.medicines?.length > 0 ? (
                <div className="space-y-4">
                  {patient.medicines.map((medicine, index) => (
                    <div key={index} className="border border-gray-100 rounded-lg p-4">
                      <p className="text-sm text-gray-500 mb-1">
                        {new Date(medicine.createdAt).toLocaleString()}
                      </p>
                      <p className="font-medium text-gray-900">{medicine.name}</p>
                      <p className="text-gray-700">{medicine.notes || "No notes"}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No medicine records available</p>
              )}
            </div>

            {/* Billing Section */}
            <div className="bg-white shadow-card rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Billing History</h2>
                <button
                  onClick={() => setShowBillForm(!showBillForm)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {showBillForm ? "Cancel" : "Generate Bill"}
                </button>
              </div>

              {showBillForm && (
                <div className="border border-blue-100 rounded-lg p-4 mb-6 bg-blue-50">
                  <h3 className="text-lg font-medium text-blue-800 mb-4">Generate New Bill</h3>
                  <form onSubmit={handleGenerateBill} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={billDescription}
                        onChange={(e) => setBillDescription(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                        placeholder="Enter bill description"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Amount ($)
                      </label>
                      <input
                        type="number"
                        value={billAmount}
                        onChange={(e) => setBillAmount(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter amount"
                        min="0.01"
                        step="0.01"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={billLoading}
                      className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      {billLoading ? "Generating..." : "Generate Bill"}
                    </button>
                  </form>
                </div>
              )}

              {bills.length > 0 ? (
                <div className="space-y-4">
                  {bills.map((bill) => (
                    <div key={bill._id} className="border border-gray-100 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{bill.description}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(bill.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold text-lg ${bill.status === "PAID" ? "text-green-600" : "text-red-600"}`}>
                            ${bill.amount.toFixed(2)}
                          </p>
                          <span className={`text-xs px-2 py-1 rounded-full ${bill.status === "PAID" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                            {bill.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No bills generated yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function for trend colors
const getTrendColor = (trend) => {
  switch (trend) {
    case "IMPROVING":
      return "text-green-600";
    case "STABLE":
      return "text-yellow-600";
    case "NEEDS_ATTENTION":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
};
