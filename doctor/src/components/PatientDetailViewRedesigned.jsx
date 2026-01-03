import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import BillCreationModal from "./BillCreationModal";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Trend Indicator Component (unchanged logic, improved UI)
const TrendIndicator = ({ trend }) => {
  if (trend === "up") {
    return <span className="text-red-500">↑ Worsening</span>;
  } else if (trend === "down") {
    return <span className="text-green-500">↓ Improving</span>;
  } else {
    return <span className="text-yellow-500">→ Stable</span>;
  }
};

// Check-In Timeline Component (unchanged logic, improved UI)
const CheckInTimeline = ({ checkIns }) => {
  return (
    <div className="flex space-x-1 mb-2">
      {checkIns.map((checkIn, index) => (
        <div
          key={index}
          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
            checkIn.status === "completed"
              ? "bg-green-100 text-green-800"
              : checkIn.status === "late"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}
          title={
            checkIn.status === "completed"
              ? "Completed"
              : checkIn.status === "late"
              ? "Late"
              : "Missed"
          }
        >
          {checkIn.day}
        </div>
      ))}
    </div>
  );
};

// Alert Item Component (unchanged logic, improved UI)
const AlertItem = ({ alert }) => {
  return (
    <div className="p-3 bg-red-50 rounded-lg border-l-4 border-red-400 mb-2">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium text-red-800">{alert.type}</p>
          <p className="text-sm text-red-600">{alert.reason}</p>
        </div>
        <p className="text-xs text-gray-500 whitespace-nowrap">
          {new Date(alert.timestamp).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

// Silent Deterioration Alert Component (unchanged logic, improved UI)
const SilentDeteriorationAlert = ({ patient }) => {
  if (!patient.silentDeterioration) return null;

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-yellow-400"
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
          <p className="text-sm font-medium text-yellow-800">
            ⚠️ Silent deterioration suspected
          </p>
          <p className="text-sm text-yellow-600">
            Patient reports "No issues" but system detects worsening trends and
            reduced engagement.
          </p>
        </div>
      </div>
    </div>
  );
};

// Symptom Trend Chart Component (unchanged logic, improved UI)
const SymptomTrendChart = ({ data }) => {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis
            dataKey="day"
            stroke="#6b7280"
            tick={{ fontSize: 12 }}
            tickLine={false}
          />
          <YAxis
            stroke="#6b7280"
            tick={{ fontSize: 12 }}
            tickLine={false}
            domain={[0, 10]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
          />
          <Line
            type="monotone"
            dataKey="pain"
            stroke="#ef4444"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            name="Pain"
          />
          <Line
            type="monotone"
            dataKey="fever"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            name="Fever"
          />
          <Line
            type="monotone"
            dataKey="breathlessness"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            name="Breathlessness"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Patient Detail Card Component
const PatientDetailCard = ({ title, icon, children }) => {
  return (
    <div className="bg-white shadow-card rounded-lg p-6 mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
        {icon} {title}
      </h3>
      {children}
    </div>
  );
};

export const PatientDetailViewRedesigned = ({ patient, onBack, token }) => {
  const [showBillModal, setShowBillModal] = useState(false);

  if (!patient) return null;

  const handleBillSuccess = () => {
    toast.success("Bill generated successfully", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  // Generate mock symptom trend data (unchanged logic)
  const symptomData = Array.from({ length: 7 }, (_, i) => ({
    day: `Day ${i + 1}`,
    pain: Math.max(0, 5 - i * 0.5 + Math.random() * 1),
    fever: Math.max(0, 3 - i * 0.3 + Math.random() * 0.5),
    breathlessness: Math.max(0, 4 - i * 0.4 + Math.random() * 0.5),
  }));

  // Generate mock check-in data (unchanged logic)
  const checkInData = Array.from({ length: 7 }, (_, i) => {
    const statuses = ["completed", "completed", "late", "missed"];
    return {
      day: i + 1,
      status: statuses[Math.floor(Math.random() * statuses.length)],
    };
  });

  // Generate mock alerts (unchanged logic)
  const alerts = [
    {
      type: "High Risk Alert",
      reason:
        "Alert triggered due to increasing pain trend + missed medication for 2 days.",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      type: "Medication Alert",
      reason: "Patient missed antibiotic dose on Day 3 and Day 5.",
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  ];

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Patient Details: {patient.username}
          </h2>
          <p className="text-sm text-gray-500">
            Comprehensive post-discharge monitoring
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onBack}
            className="text-primary-600 hover:text-primary-900 text-sm font-medium transition-colors"
          >
            ← Back to Overview
          </button>
          <button
            onClick={() => setShowBillModal(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
          >
            Generate Bill
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Silent Deterioration Alert */}
        <SilentDeteriorationAlert patient={patient} />

        {/* Patient Medical Background */}
        <PatientDetailCard
          title="Patient Medical Background"
          icon={<span className="mr-2">🏥</span>}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Known Conditions</p>
              <p className="text-gray-900">
                {patient.conditions?.join(", ") || "None reported"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Past Diseases</p>
              <p className="text-gray-900">
                {patient.pastDiseases?.join(", ") || "None reported"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Discharge Diagnosis</p>
              <p className="text-gray-900">
                {patient.dischargeDiagnosis || "Not specified"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Prescribed Medicines</p>
              <ul className="list-disc list-inside text-gray-900">
                {patient.medicines?.map((med, index) => (
                  <li key={index}>
                    {med.name} ({med.times.join(", ")})
                  </li>
                )) || <li>None prescribed</li>}
              </ul>
            </div>
          </div>
        </PatientDetailCard>

        {/* 7-Day Symptom Trend */}
        <PatientDetailCard
          title="7-Day Symptom Trend"
          icon={<span className="mr-2">📈</span>}
        >
          <div className="mb-4">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                <span>Pain</span>
                <TrendIndicator trend="down" />
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                <span>Fever</span>
                <TrendIndicator trend="stable" />
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <span>Breathlessness</span>
                <TrendIndicator trend="down" />
              </div>
            </div>
          </div>
          <SymptomTrendChart data={symptomData} />
        </PatientDetailCard>

        {/* Medication Adherence */}
        <PatientDetailCard
          title="Medication Adherence Summary"
          icon={<span className="mr-2">💊</span>}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Adherence Rate</p>
              <p className="text-3xl font-bold text-gray-900">85%</p>
              <p className="text-sm text-gray-500">of days medication taken</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Missed Doses</p>
              <p className="text-3xl font-bold text-red-600">2</p>
              <p className="text-sm text-gray-500">in last 7 days</p>
            </div>
          </div>
          <div className="flex items-center">
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
              Irregular
            </span>
            <span className="ml-2 text-sm text-gray-600">
              Antibiotics missed on 2 of last 7 days
            </span>
          </div>
        </PatientDetailCard>

        {/* Missed Check-Ins Timeline */}
        <PatientDetailCard
          title="Missed Check-Ins Timeline"
          icon={<span className="mr-2">📅</span>}
        >
          <p className="text-sm text-gray-500 mb-3">
            🟢 Completed | 🟡 Late | 🔴 Missed
          </p>
          <p className="text-xs text-gray-400 mb-3">
            Missed check-ins are treated as risk signals.
          </p>
          <CheckInTimeline checkIns={checkInData} />
        </PatientDetailCard>

        {/* Alerts History */}
        <PatientDetailCard
          title="Alerts History"
          icon={<span className="mr-2">🚨</span>}
        >
          {alerts.length === 0 ? (
            <p className="text-gray-500">No alerts for this patient</p>
          ) : (
            <div className="space-y-2">
              {alerts.map((alert, index) => (
                <AlertItem key={index} alert={alert} />
              ))}
            </div>
          )}
        </PatientDetailCard>
      </div>

      {/* Bill Creation Modal */}
      {showBillModal && (
        <BillCreationModal
          patient={patient}
          token={token}
          onClose={() => setShowBillModal(false)}
          onSuccess={handleBillSuccess}
        />
      )}
    </div>
  );
};
