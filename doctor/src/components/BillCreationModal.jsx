import React, { useState } from "react";
import { createBill } from "../services/api";

const BillCreationModal = ({ patient, token, onClose, onSuccess }) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [patientName, setPatientName] = useState(patient?.username || patient?.name || "");
  const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Debug: Log the patient object structure
      console.log("Patient object received:", patient);

      // Handle case where patient might be nested in a response object
      const actualPatient = patient.patient || patient;
      console.log("Actual patient object:", actualPatient);
      console.log("Patient ID fields:", { _id: actualPatient._id, id: actualPatient.id });

      // Validate amount is a positive number
      const amountValue = parseFloat(amount);
      if (isNaN(amountValue) || amountValue <= 0) {
        setError("Please enter a valid positive amount");
        setIsLoading(false);
        return;
      }

      // Validate description
      if (!description || description.trim() === "") {
        setError("Please enter a bill description");
        setIsLoading(false);
        return;
      }

      // Get patient ID - handle both mock and real data structures
      const patientId = actualPatient._id || actualPatient.id;
      console.log("Extracted patientId:", patientId, "Type:", typeof patientId);

      if (!patientId) {
        setError("Invalid patient data - no ID found");
        setIsLoading(false);
        return;
      }

      // For mock data, we need to handle the case where patientId is a simple string
      // The backend expects MongoDB ObjectId format for real data
      const isMockData = typeof patientId === 'string' && patientId.length <= 2;

      // If using mock data, we'll simulate a successful bill creation
      // without actually calling the backend
      if (isMockData) {
        console.log("Mock bill creation for patient:", patientId);
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log("Mock bill created successfully");
        onSuccess();
        onClose();
        return;
      }

      console.log("Creating bill with:", {
        token,
        patientId,
        description,
        amountValue
      });

      // Call API to create bill
      await createBill(token, patientId, description, amountValue);

      // Success - close modal and show toast
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error creating bill:", err);
      setError(err.message || "Failed to create bill");
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Generate Bill</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isLoading}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Patient Name - Editable */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Patient Name
              </label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter patient name"
              />
            </div>

            {/* Bill Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bill Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={3}
                placeholder="Enter bill description"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min="0.01"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter amount"
              />
            </div>

            {/* Date - Editable */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={billDate}
                onChange={(e) => setBillDate(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:bg-primary-400 disabled:cursor-not-allowed"
              >
                {isLoading ? "Generating..." : "Generate Bill"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BillCreationModal;
