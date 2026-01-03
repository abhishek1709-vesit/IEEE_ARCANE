export const mockPatients = [
  {
    id: "1",
    username: "John Smith",
    email: "john.smith@example.com",
    trend: "NEEDS_ATTENTION",
    missedCheckIns: 3,
    daysSinceDischarge: 14,
    lastUpdate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    riskFlags: ["Low reporting activity", "Irregular medication adherence"],
    silentDeterioration: true,
    conditions: ["Hypertension", "Type 2 Diabetes"],
    pastDiseases: ["Pneumonia (2020)"],
    dischargeDiagnosis: "Post-operative recovery from appendectomy",
    medicines: [
      { name: "Amoxicillin", times: ["Morning", "Evening"] },
      { name: "Ibuprofen", times: ["As needed"] },
    ],
    followUpStatus: "Needs Follow-Up",
  },
  {
    id: "2",
    username: "Sarah Johnson",
    email: "sarah.j@example.com",
    trend: "STABLE",
    missedCheckIns: 1,
    daysSinceDischarge: 8,
    lastUpdate: new Date(Date.now() - 6 * 60 * 60 * 1000),
    riskFlags: ["Irregular medication adherence"],
    silentDeterioration: false,
    conditions: ["Asthma"],
    pastDiseases: ["None"],
    dischargeDiagnosis: "Recovery from bronchitis",
    medicines: [
      { name: "Albuterol", times: ["As needed"] },
      { name: "Fluticasone", times: ["Morning"] },
    ],
    followUpStatus: "Monitoring",
  },
  {
    id: "3",
    username: "Michael Brown",
    email: "michael.b@example.com",
    trend: "IMPROVING",
    missedCheckIns: 0,
    daysSinceDischarge: 5,
    lastUpdate: new Date(Date.now() - 2 * 60 * 60 * 1000),
    riskFlags: [],
    silentDeterioration: false,
    conditions: ["None"],
    pastDiseases: ["None"],
    dischargeDiagnosis: "Recovery from minor surgery",
    medicines: [{ name: "Acetaminophen", times: ["As needed"] }],
    followUpStatus: "Stable",
  },
  {
    id: "4",
    username: "Emily Davis",
    email: "emily.d@example.com",
    trend: "NEEDS_ATTENTION",
    missedCheckIns: 4,
    daysSinceDischarge: 10,
    lastUpdate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    riskFlags: [
      "Low reporting activity",
      "Irregular medication adherence",
      "Worsening symptoms",
    ],
    silentDeterioration: true,
    conditions: ["Chronic Obstructive Pulmonary Disease"],
    pastDiseases: ["Pneumonia (2021)", "Influenza (2022)"],
    dischargeDiagnosis: "Recovery from pneumonia",
    medicines: [
      { name: "Prednisone", times: ["Morning"] },
      { name: "Azithromycin", times: ["Morning"] },
    ],
    followUpStatus: "Needs Follow-Up",
  },
  {
    id: "5",
    username: "Robert Wilson",
    email: "robert.w@example.com",
    trend: "STABLE",
    missedCheckIns: 0,
    daysSinceDischarge: 3,
    lastUpdate: new Date(Date.now() - 1 * 60 * 60 * 1000),
    riskFlags: [],
    silentDeterioration: false,
    conditions: ["None"],
    pastDiseases: ["None"],
    dischargeDiagnosis: "Recovery from minor procedure",
    medicines: [{ name: "Ibuprofen", times: ["As needed"] }],
    followUpStatus: "Stable",
  },
];

export const getMockPatientDetails = (patientId) => {
  const basePatient =
    mockPatients.find((p) => p.id === patientId) || mockPatients[0];

  return {
    patient: basePatient,
    trend: basePatient.trend,
    missedCheckIns: basePatient.missedCheckIns,
    riskFlags: basePatient.riskFlags,
    aiSummary: `Patient ${
      basePatient.username
    } shows ${basePatient.trend.toLowerCase()} recovery trend based on system analysis. ${
      basePatient.riskFlags.length > 0
        ? `Key concerns: ${basePatient.riskFlags.join(", ")}.`
        : "No significant risk factors detected."
    }`,
    reports: [
      {
        _id: "1",
        title: "Post-discharge check-up",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        content: "Patient reports feeling better, no major complaints.",
      },
      {
        _id: "2",
        title: "Follow-up assessment",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        content: "Vital signs stable, wound healing properly.",
      },
    ],
    medicines: basePatient.medicines || [],
  };
};

export const mockDisclaimer =
  "This dashboard provides recovery trends and risk indicators only. It does not provide diagnoses or treatment recommendations.";
