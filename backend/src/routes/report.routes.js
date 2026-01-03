import express from "express";
import { verifyJWT } from "../middlewares/verifyJWT.js";
import upload from "../middlewares/multer.js";
import { createReport, getUserReports, deleteReport } from "../controllers/report.controller.js";

const router = express.Router();

// Protected routes - require JWT authentication
router.use(verifyJWT);

// Create report with image upload
router.post(
  "/create",
  upload.single('image'),
  createReport
);

// Get user's reports
router.get("/my-reports", getUserReports);

// Delete a report
router.delete("/:reportId", deleteReport);

export default router;
