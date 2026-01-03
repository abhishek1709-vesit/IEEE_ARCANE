/**
 * Transforms backend patient data to match frontend expected format
 * Handles missing fields and provides sensible defaults
 */
export const transformPatientData = (backendPatient) => {
  // Map backend fields to frontend expected format
  const transformed = {
    id: backendPatient.id || backendPatient._id,
    username: backendPatient.username || 'Unknown Patient',
    email: backendPatient.email || 'No email provided',
    trend: backendPatient.trend || 'STABLE', // Default to STABLE if not provided
    missedCheckIns: backendPatient.missedCheckIns || 0,
    daysSinceDischarge: backendPatient.daysSinceDischarge || 7, // Default to 7 days
    lastUpdate: backendPatient.lastUpdate || new Date(),
    riskFlags: backendPatient.riskFlags || [],
    silentDeterioration: backendPatient.silentDeterioration || false,
    conditions: backendPatient.conditions || ['None'],
    pastDiseases: backendPatient.pastDiseases || ['None'],
    dischargeDiagnosis: backendPatient.dischargeDiagnosis || 'Not specified',
    medicines: backendPatient.medicines || [],
    followUpStatus: determineFollowUpStatus(backendPatient),
  };

  // Remove fields that don't exist in backend data
  // The frontend will handle missing fields gracefully
  return transformed;
};

/**
 * Determines follow-up status based on patient data
 */
const determineFollowUpStatus = (patient) => {
  if (patient.trend === 'NEEDS_ATTENTION' || patient.missedCheckIns > 2) {
    return 'Needs Follow-Up';
  }
  if (patient.trend === 'STABLE' && patient.missedCheckIns <= 1) {
    return 'Monitoring';
  }
  return 'Stable';
};

/**
 * Transforms backend patient summary data for detail view
 */
export const transformPatientSummary = (backendSummary) => {
  const patient = backendSummary.patient || {};
  const reports = backendSummary.reports || [];
  const medicines = backendSummary.medicines || [];

  return {
    id: patient._id || 'unknown',
    username: patient.username || 'Unknown Patient',
    email: patient.email || 'No email provided',
    trend: backendSummary.trend || 'STABLE',
    missedCheckIns: backendSummary.missedCheckIns || 0,
    riskFlags: backendSummary.riskFlags || [],
    silentDeterioration: backendSummary.riskFlags?.includes('Silent deterioration') || false,
    conditions: ['Not specified'], // Would need to be added to backend
    pastDiseases: ['Not specified'], // Would need to be added to backend
    dischargeDiagnosis: 'Not specified', // Would need to be added to backend
    medicines: medicines.map(med => ({
      name: med.name || 'Unknown medication',
      times: med.schedule || ['As needed']
    })),
    followUpStatus: determineFollowUpStatus(backendSummary),
    reports: reports.map(report => ({
      _id: report._id,
      title: report.title || 'Patient report',
      createdAt: report.createdAt || new Date(),
      content: report.content || 'No content available'
    })),
    aiSummary: backendSummary.aiSummary || 'No AI summary available'
  };
};
