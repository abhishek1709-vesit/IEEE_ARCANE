import express from "express";
import {
  signup,
  login,
  getDashboard,
  getPatients,
  getPatientSummary,
} from "../controllers/doctor.controller.js";
import {
  createBill,
  getPatientBills,
  getBillById
} from "../controllers/bill.controller.js";
import { requireDoctor } from "../middlewares/requireDoctor.js";

const router = express.Router();

// Auth routes
router.post("/signup", signup);
router.post("/login", login);

// Protected routes
router.get("/dashboard", requireDoctor, getDashboard);
router.get("/patients", requireDoctor, getPatients);
router.get("/patient/:id/summary", requireDoctor, getPatientSummary);
router.get("/patient/:patientId/summary", requireDoctor, getPatientSummary);

// Bill routes
router.post("/bills/create", requireDoctor, createBill);
router.get("/bills/patient/:patientId", requireDoctor, getPatientBills);
router.get("/bills/patient/:id", requireDoctor, getPatientBills);
router.get("/bills/:billId", requireDoctor, getBillById);

export default router;
