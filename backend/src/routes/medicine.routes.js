import express from "express";
import { verifyJWT } from "../middlewares/verifyJWT.js";
import {
  createMedicineReminder,
  getUserMedicines,
  updateMedicineReminder,
  deleteMedicineReminder
} from "../controllers/medicine.controller.js";

const router = express.Router();

// Protected routes - require JWT authentication
router.use(verifyJWT);

router.post("/reminder/create", createMedicineReminder);
router.get("/reminders", getUserMedicines);
router.put("/reminder/:id", updateMedicineReminder);
router.delete("/reminder/:id", deleteMedicineReminder);

export default router;
