const API_BASE_URL = "http://localhost:5000/api/doctor";

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
  const response = await fetch(`${API_BASE_URL}/patient/${patientId}/summary`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch patient summary");
  }

  return await response.json();
};
