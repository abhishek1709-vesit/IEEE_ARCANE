import React from "react";
import { Link } from "react-router-dom";

const RiskBadge = ({ status }) => {
  const getStatusStyles = () => {
    switch (status) {
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

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyles()}`}
    >
      {status === "IMPROVING"
        ? "🟢 Improving"
        : status === "STABLE"
        ? "🟡 Stable"
        : status === "NEEDS_ATTENTION"
        ? "🔴 Needs Attention"
        : "Unknown"}
    </span>
  );
};

const FollowUpIndicator = ({ status }) => {
  const getIndicatorStyles = () => {
    switch (status) {
      case "Needs Follow-Up":
        return "bg-red-100 text-red-800";
      case "Monitoring":
        return "bg-yellow-100 text-yellow-800";
      case "Stable":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <span
      className={`px-2 py-1 rounded text-xs font-medium ${getIndicatorStyles()}`}
    >
      {status}
    </span>
  );
};

export const PatientOverviewTable = ({ patients, onPatientClick }) => {
  // Sort patients by risk: Needs Attention first, then Stable, then Improving
  const sortedPatients = [...patients].sort((a, b) => {
    const riskOrder = {
      NEEDS_ATTENTION: 1,
      STABLE: 2,
      IMPROVING: 3,
    };
    return riskOrder[a.trend] - riskOrder[b.trend];
  });

  return (
    <div className="bg-white shadow-card rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Patient Overview
        </h2>
        <p className="text-sm text-gray-500">
          Post-Discharge Patient Monitoring
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Patient Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Days Since Discharge
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Recovery Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Missed Check-Ins
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Last Update
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedPatients.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  No patients assigned
                </td>
              </tr>
            ) : (
              sortedPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-indigo-600 font-medium">
                          {patient.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {patient.username}
                        </div>
                        <div className="text-sm text-gray-500">
                          {patient.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {patient.daysSinceDischarge || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <RiskBadge status={patient.trend} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {patient.missedCheckIns || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {patient.lastUpdate
                        ? new Date(patient.lastUpdate).toLocaleString()
                        : "Never"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => onPatientClick(patient.id)}
                      className="text-primary-600 hover:text-primary-900 font-medium transition-colors"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
