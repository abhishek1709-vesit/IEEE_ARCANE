import bcryptjs from "bcryptjs";
import Doctor from "../models/Doctor.js";
import User from "../models/User.js";
import Medicine from "../models/Medicine.js";
import Report from "../models/Report.js";
import jwt from "jsonwebtoken";

const generateDoctorToken = (doctorId) => {
  return jwt.sign({ doctorId, role: "DOCTOR" }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });
};

export const signup = async (req, res) => {
  try {
    const { name, email, password, specialization, hospitalName } = req.body;

    if (!name || !email || !password || !specialization || !hospitalName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    // Check if doctor already exists
    const existingEmail = await Doctor.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // Create new doctor
    const newDoctor = new Doctor({
      name,
      email,
      password: hashedPassword,
      specialization,
      hospitalName,
    });

    await newDoctor.save();

    const token = generateDoctorToken(newDoctor._id);

    res.status(201).json({
      token,
      message: "Doctor registered successfully",
      doctor: {
        id: newDoctor._id,
        name: newDoctor.name,
        email: newDoctor.email,
        specialization: newDoctor.specialization,
        hospitalName: newDoctor.hospitalName,
      },
    });
  } catch (error) {
    console.log("Error in doctor signup", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Fill all fields" });
    }

    // Find doctor by email
    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcryptjs.compare(password, doctor.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateDoctorToken(doctor._id);

    res.status(200).json({
      token,
      message: "Doctor login successful",
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        specialization: doctor.specialization,
        hospitalName: doctor.hospitalName,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Helper function to calculate recovery trend
const calculateRecoveryTrend = (reports, medicines) => {
  // Simple logic: if recent reports exist, mock trend
  // In real app, more complex analysis
  const recentReports = reports.filter(
    (r) =>
      new Date(r.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // last 7 days
  );
  if (recentReports.length > 5) return "IMPROVING";
  if (recentReports.length > 2) return "STABLE";
  return "NEEDS_ATTENTION";
};

// Helper for missed check-ins - assume daily check-ins via reports
const calculateMissedCheckIns = (reports) => {
  // Mock: if less than 5 reports in last week, calculate as missed daily
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentReports = reports.filter((r) => r.createdAt > weekAgo);
  const missed = 7 - recentReports.length;
  return Math.max(0, missed);
};

// Helper for risk flags
const calculateRiskFlags = (reports, medicines) => {
  const flags = [];
  if (reports.length < 3) flags.push("Low reporting activity");
  const recentMedicines = medicines.filter(
    (m) => m.createdAt > Date.now() - 7 * 24 * 60 * 60 * 1000
  );
  if (recentMedicines.length < 5) flags.push("Irregular medication adherence");
  return flags;
};

export const getDashboard = async (req, res) => {
  try {
    const doctorId = req.user.doctorId;

    // Get assigned patients
    const patients = await User.find({ doctorId }).populate("doctorId", "name");

    const patientSummaries = [];

    for (const patient of patients) {
      const reports = await Report.find({ user: patient._id });
      const medicines = await Medicine.find({ user: patient._id });

      const trend = calculateRecoveryTrend(reports, medicines);
      const missedCount = calculateMissedCheckIns(reports);
      const riskFlags = calculateRiskFlags(reports, medicines);
      const aiSummary = `Patient has ${
        reports.length
      } reports and is ${trend.toLowerCase()}.`;

      patientSummaries.push({
        id: patient._id,
        username: patient.username,
        email: patient.email,
        trend,
        missedCheckIns: missedCount,
        riskFlags,
        aiSummary,
      });
    }

    res.status(200).json({
      disclaimer:
        "This is for informational purposes only and does not constitute medical advice.",
      patients: patientSummaries,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getPatients = async (req, res) => {
  try {
    const doctorId = req.user.doctorId;

    const patients = await User.find({ doctorId }).select("username email _id");

    res.status(200).json({
      patients,
      disclaimer:
        "This is for informational purposes only and does not constitute medical advice.",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getPatientSummary = async (req, res) => {
  try {
    const { id } = req.params;
    const doctorId = req.user.doctorId;

    // Verify patient is assigned to this doctor
    const patient = await User.findOne({ _id: id, doctorId });
    if (!patient) {
      return res
        .status(404)
        .json({ message: "Patient not found or not assigned to you" });
    }

    const reports = await Report.find({ user: id }).sort({ createdAt: -1 });
    const medicines = await Medicine.find({ user: id }).sort({ createdAt: -1 });

    const trend = calculateRecoveryTrend(reports, medicines);
    const missedCount = calculateMissedCheckIns(reports);
    const riskFlags = calculateRiskFlags(reports, medicines);
    const aiSummary = `Patient ${
      patient.username
    } shows ${trend.toLowerCase()} recovery trend based on ${
      reports.length
    } reports.`;

    res.status(200).json({
      patient: {
        username: patient.username,
        email: patient.email,
      },
      trend,
      missedCheckIns: missedCount,
      riskFlags,
      aiSummary,
      reports: reports.slice(0, 10), // last 10
      medicines: medicines.slice(0, 10),
      disclaimer:
        "This is for informational purposes only and does not constitute medical advice.",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
