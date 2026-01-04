import express from "express";
import { getPatientOwnBills, getBillById, markBillAsPaid } from "../controllers/bill.controller.js";
import { verifyJWT } from "../middlewares/verifyJWT.js";

const router = express.Router();

// Patient routes for bills
router.get("/patient", verifyJWT, getPatientOwnBills);
router.get("/:billId", verifyJWT, getBillById);
router.patch("/:billId/pay", verifyJWT, markBillAsPaid);

export default router;
