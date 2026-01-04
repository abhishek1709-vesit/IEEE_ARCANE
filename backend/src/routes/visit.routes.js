import express from "express";
import { verifyJWT } from "../middlewares/verifyJWT.js";
import {
  createDoctorVisit,
  getUserDoctorVisits,
  deleteDoctorVisit,
  createTestVisit,
  getUserTestVisits,
  deleteTestVisit
} from "../controllers/visit.controller.js";

const router = express.Router();

// Protected routes - require JWT authentication
router.use(verifyJWT);

// Doctor Visit Routes
router.post("/doctor-visit/create", createDoctorVisit);
router.get("/doctor-visits", getUserDoctorVisits);
router.delete("/doctor-visit/:id", deleteDoctorVisit);

// Test Visit Routes
router.post("/test-visit/create", createTestVisit);
router.get("/test-visits", getUserTestVisits);
router.delete("/test-visit/:id", deleteTestVisit);

export default router;
