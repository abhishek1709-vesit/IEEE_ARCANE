import Medicine from "../models/Medicine.js";

export const createMedicineReminder = async (req, res) => {
  try {
    const { name, times } = req.body;
    const userId = req.user.userId;

    // Validate input
    if (!name || !times || !Array.isArray(times) || times.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Medicine name and at least one time are required"
      });
    }

    // Validate time format (24-hour format HH:MM)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    for (const time of times) {
      if (!timeRegex.test(time)) {
        return res.status(400).json({
          success: false,
          message: `Invalid time format: ${time}. Please use 24-hour format (HH:MM)`
        });
      }
    }

    // Create medicine reminder
    const medicine = new Medicine({
      name,
      times,
      user: userId
    });

    await medicine.save();

    res.status(201).json({
      success: true,
      message: "Medicine reminder created successfully",
      data: medicine
    });

  } catch (error) {
    console.error("Error creating medicine reminder:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

export const getUserMedicines = async (req, res) => {
  try {
    const userId = req.user.userId;

    const medicines = await Medicine.find({ user: userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: medicines
    });

  } catch (error) {
    console.error("Error fetching medicines:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

export const updateMedicineReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, times } = req.body;
    const userId = req.user.userId;

    // Validate input
    if (!name || !times || !Array.isArray(times) || times.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Medicine name and at least one time are required"
      });
    }

    // Validate time format (24-hour format HH:MM)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    for (const time of times) {
      if (!timeRegex.test(time)) {
        return res.status(400).json({
          success: false,
          message: `Invalid time format: ${time}. Please use 24-hour format (HH:MM)`
        });
      }
    }

    // Find and update the medicine reminder
    const medicine = await Medicine.findOneAndUpdate(
      { _id: id, user: userId },
      { name, times },
      { new: true, runValidators: true }
    );

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine reminder not found or you don't have permission to update it"
      });
    }

    res.status(200).json({
      success: true,
      message: "Medicine reminder updated successfully",
      data: medicine
    });

  } catch (error) {
    console.error("Error updating medicine reminder:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

export const deleteMedicineReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Find and delete the medicine reminder
    const medicine = await Medicine.findOneAndDelete({ _id: id, user: userId });

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine reminder not found or you don't have permission to delete it"
      });
    }

    res.status(200).json({
      success: true,
      message: "Medicine reminder deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting medicine reminder:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};
