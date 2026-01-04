import DoctorVisit from "../models/DoctorVisit.js";
import TestVisit from "../models/TestVisit.js";

// Doctor Visit Controller Functions
export const createDoctorVisit = async (req, res) => {
  try {
    const { doctorName, dateOfVisit, timeOfVisit } = req.body;
    const userId = req.user.userId;

    // Validate input
    if (!doctorName || !dateOfVisit || !timeOfVisit) {
      return res.status(400).json({
        success: false,
        message: "Doctor name, date of visit, and time of visit are required"
      });
    }

    // Validate date format
    const visitDate = new Date(dateOfVisit);
    if (isNaN(visitDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Please use a valid date"
      });
    }

    // Create doctor visit
    const doctorVisit = new DoctorVisit({
      doctorName,
      dateOfVisit: visitDate,
      timeOfVisit,
      user: userId
    });

    await doctorVisit.save();

    res.status(201).json({
      success: true,
      message: "Doctor visit reminder created successfully",
      data: doctorVisit
    });

  } catch (error) {
    console.error("Error creating doctor visit:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

export const getUserDoctorVisits = async (req, res) => {
  try {
    const userId = req.user.userId;

    const doctorVisits = await DoctorVisit.find({ user: userId })
      .sort({ dateOfVisit: 1, timeOfVisit: 1 });

    res.status(200).json({
      success: true,
      data: doctorVisits
    });

  } catch (error) {
    console.error("Error fetching doctor visits:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

export const deleteDoctorVisit = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Find and delete the doctor visit
    const doctorVisit = await DoctorVisit.findOneAndDelete({ _id: id, user: userId });

    if (!doctorVisit) {
      return res.status(404).json({
        success: false,
        message: "Doctor visit not found or you don't have permission to delete it"
      });
    }

    res.status(200).json({
      success: true,
      message: "Doctor visit reminder deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting doctor visit:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// Test Visit Controller Functions
export const createTestVisit = async (req, res) => {
  try {
    const { testName, dateOfTest, timeOfTest } = req.body;
    const userId = req.user.userId;

    // Validate input
    if (!testName || !dateOfTest || !timeOfTest) {
      return res.status(400).json({
        success: false,
        message: "Test name, date of test, and time of test are required"
      });
    }

    // Validate date format
    const testDate = new Date(dateOfTest);
    if (isNaN(testDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Please use a valid date"
      });
    }

    // Create test visit
    const testVisit = new TestVisit({
      testName,
      dateOfTest: testDate,
      timeOfTest,
      user: userId
    });

    await testVisit.save();

    res.status(201).json({
      success: true,
      message: "Test visit reminder created successfully",
      data: testVisit
    });

  } catch (error) {
    console.error("Error creating test visit:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

export const getUserTestVisits = async (req, res) => {
  try {
    const userId = req.user.userId;

    const testVisits = await TestVisit.find({ user: userId })
      .sort({ dateOfTest: 1, timeOfTest: 1 });

    res.status(200).json({
      success: true,
      data: testVisits
    });

  } catch (error) {
    console.error("Error fetching test visits:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

export const deleteTestVisit = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Find and delete the test visit
    const testVisit = await TestVisit.findOneAndDelete({ _id: id, user: userId });

    if (!testVisit) {
      return res.status(404).json({
        success: false,
        message: "Test visit not found or you don't have permission to delete it"
      });
    }

    res.status(200).json({
      success: true,
      message: "Test visit reminder deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting test visit:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};
