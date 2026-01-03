import express from "express";
import {
  signup,
  login,
  getDashboard,
  getPatients,
  getPatientSummary,
} from "../controllers/doctor.controller.js";
import { requireDoctor } from "../middlewares/requireDoctor.js";

const router = express.Router();

// Auth routes
router.post("/signup", signup);
router.post("/login", login);

// Protected routes
router.get("/dashboard", requireDoctor, getDashboard);
router.get("/patients", requireDoctor, getPatients);
router.get("/patient/:id/summary", requireDoctor, getPatientSummary);

export default router;
