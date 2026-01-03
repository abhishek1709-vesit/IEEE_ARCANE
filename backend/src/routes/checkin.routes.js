import express from "express";
import { verifyJWT } from "../middlewares/verifyJWT.js";
import {
    checkTodayCheckIn,
    submitCheckIn,
    generateCheckInSummary
} from "../controllers/checkin.controller.js";

const router = express.Router();

// All routes are protected with JWT authentication
router.use(verifyJWT);

// Check if today's check-in exists
router.get("/today", checkTodayCheckIn);

// Submit daily check-in
router.post("/", submitCheckIn);

// Generate check-in summary
router.post("/summary", generateCheckInSummary);

export default router;
