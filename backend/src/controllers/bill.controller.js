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

    // Verify patient exists
    const patient = await User.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        message: "Patient not found",
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

export const getPatientBills = async (req, res) => {
  try {
    const { patientId, id } = req.params;
    const patientIdToUse = patientId || id;
    const doctorId = req.user.doctorId;

    console.log(`Fetching bills for patient ID: ${patientIdToUse}`);

    if (!patientIdToUse) {
      return res.status(400).json({ message: "Patient ID is required" });
    }

    // Verify patient exists (removed doctorId check)
    const patient = await User.findById(patientIdToUse);
    if (!patient) {
      console.log(`Patient with ID ${patientIdToUse} not found`);
      return res.status(404).json({
        message: "Patient not found",
      });
    }

    console.log(`Found patient: ${patient.username}, fetching bills`);

    // Get all bills for this patient
    const bills = await Bill.find({ patientId: patientIdToUse }).sort({ createdAt: -1 });

    console.log(`Found ${bills.length} bills for patient`);

    res.status(200).json({
      success: true,
      data: bills,
    });
  } catch (error) {
    console.error("Error fetching patient bills:", error);
    console.error("Full error stack:", error.stack);
    res.status(500).json({
      message: "Server error",
      error: error.message,
      details: "Please check server logs for more information"
    });
  }
};

export const getBillById = async (req, res) => {
  try {
    const { billId } = req.params;
    const doctorId = req.user.doctorId;

    // Get the specific bill
    const bill = await Bill.findById(billId);

    if (!bill) {
      return res.status(404).json({
        message: "Bill not found or you don't have permission to access it",
      });
    }

    res.status(200).json({
      success: true,
      data: bill,
    });
  } catch (error) {
    console.error("Error fetching bill:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Patient endpoint to fetch their own bills
export const getPatientOwnBills = async (req, res) => {
  try {
    const userId = req.user.userId;

    console.log(`Patient ${userId} fetching their bills`);

    // Get all bills for this patient
    const bills = await Bill.find({ patientId: userId })
      .populate('doctorId', 'name email')
      .sort({ createdAt: -1 });

    console.log(`Found ${bills.length} bills for patient ${userId}`);

    res.status(200).json({
      success: true,
      bills: bills,
    });
  } catch (error) {
    console.error("Error fetching patient's own bills:", error);
    console.error("Full error stack:", error.stack);
    res.status(500).json({
      message: "Server error",
      error: error.message,
      details: "Please check server logs for more information"
    });
  }
};

// Endpoint to mark a bill as paid
export const markBillAsPaid = async (req, res) => {
  try {
    const { billId } = req.params;
    const userId = req.user.userId;

    console.log(`Patient ${userId} marking bill ${billId} as paid`);

    // Find the bill and verify it belongs to the patient
    const bill = await Bill.findOne({ _id: billId, patientId: userId });

    if (!bill) {
      console.log(`Bill ${billId} not found or doesn't belong to patient ${userId}`);
      return res.status(404).json({
        success: false,
        message: "Bill not found or you don't have permission to modify it",
      });
    }

    // Update the bill status to PAID
    bill.status = 'PAID';
    bill.paidAt = new Date();

    await bill.save();

    console.log(`Bill ${billId} successfully marked as paid`);

    res.status(200).json({
      success: true,
      message: "Bill marked as paid successfully",
      bill: bill,
    });
  } catch (error) {
    console.error("Error marking bill as paid:", error);
    console.error("Full error stack:", error.stack);
    res.status(500).json({
      message: "Server error",
      error: error.message,
      details: "Please check server logs for more information"
    });
  }
};
