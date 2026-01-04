// Use absolute URL to directly target the backend server
const API_BASE_URL = "https://patientmanagement-backend-lce0.onrender.com/api/doctor";

export const doctorSignup = async (doctorData) => {
  const response = await fetch(`${API_BASE_URL}/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(doctorData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Signup failed");
  }

  return await response.json();
};

export const doctorLogin = async (credentials) => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Login failed");
  }

  return await response.json();
};

export const getDoctorDashboard = async (token) => {
  const response = await fetch(`${API_BASE_URL}/dashboard`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch dashboard");
  }

  return await response.json();
};

export const getDoctorPatients = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/patients`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch patients");
    }

    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw new Error(`Failed to fetch patients: ${error.message}. Please ensure the backend server is running and accessible.`);
  }
};

export const getPatientSummary = async (token, patientId) => {
  console.log(`Fetching patient summary for ID: ${patientId}`);
  console.log(`Request URL: ${API_BASE_URL}/patient/${patientId}/summary`);

  const response = await fetch(`${API_BASE_URL}/patient/${patientId}/summary`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  console.log(`Response status: ${response.status}`);

  if (!response.ok) {
    try {
      const errorData = await response.json();
      console.error("API Error response:", errorData);
      throw new Error(errorData.message || "Failed to fetch patient summary");
    } catch (jsonError) {
      console.error("Failed to parse error response:", jsonError);
      throw new Error(`Failed to fetch patient summary: HTTP ${response.status}`);
    }
  }

  const data = await response.json();
  console.log("API Response data:", data);
  return data;
};

export const createBill = async (token, patientId, description, amount) => {
  const response = await fetch(`${API_BASE_URL}/bills/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      patientId,
      description,
      amount,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to create bill");
  }

  return await response.json();
};

export const getPatientBills = async (token, patientId) => {
  console.log(`Fetching bills for patient ID: ${patientId}`);
  console.log(`Request URL: ${API_BASE_URL}/bills/patient/${patientId}`);

  const response = await fetch(`${API_BASE_URL}/bills/patient/${patientId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  console.log(`Bills response status: ${response.status}`);

  if (!response.ok) {
    try {
      const errorData = await response.json();
      console.error("Bills API Error response:", errorData);
      throw new Error(errorData.message || "Failed to fetch patient bills");
    } catch (jsonError) {
      console.error("Failed to parse bills error response:", jsonError);
      throw new Error(`Failed to fetch patient bills: HTTP ${response.status}`);
    }
  }

  const data = await response.json();
  console.log("Bills API Response data:", data);
  return data;
};
