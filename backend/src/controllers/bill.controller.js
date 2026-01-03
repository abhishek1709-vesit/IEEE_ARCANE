import Bill from "../models/Bill.js";
import User from "../models/User.js";

export const createBill = async (req, res) => {
  try {
    const { patientId, description, amount } = req.body;
    const doctorId = req.user.doctorId;

    // Validate required fields
    if (!patientId || !description || !amount) {
      return res.status(400).json({
        message: "Patient ID, description, and amount are required",
      });
    }

    // Validate amount is a positive number
    if (typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({
        message: "Amount must be a positive number",
      });
    }

    // Verify patient exists and belongs to this doctor
    const patient = await User.findOne({ _id: patientId, doctorId });
    if (!patient) {
      return res.status(404).json({
        message: "Patient not found or not assigned to you",
      });
    }

    // Create the bill
    const newBill = new Bill({
      patientId,
      doctorId,
      description,
      amount,
      status: "UNPAID",
    });

    await newBill.save();

    res.status(201).json({
      message: "Bill generated successfully",
      bill: {
        id: newBill._id,
        patientId: newBill.patientId,
        doctorId: newBill.doctorId,
        description: newBill.description,
        amount: newBill.amount,
        status: newBill.status,
        createdAt: newBill.createdAt,
      },
    });
  } catch (error) {
    console.error("Error creating bill:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
