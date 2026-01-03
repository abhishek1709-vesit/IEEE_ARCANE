import Report from "../models/Report.js";
import cloudinary from "../lib/cloudinary.js";
import fs from 'fs';

export const createReport = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file uploaded"
      });
    }

    const userId = req.user.userId;
    const { title, description } = req.body;

    // Upload image to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(req.file.path, {
      folder: 'patient_reports',
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' },
        { quality: 'auto:good' }
      ]
    });

    // Remove the temporary file after upload
    fs.unlinkSync(req.file.path);

    // Create report in database
    const report = new Report({
      title: title || "Untitled Report",
      description: description || "No description provided",
      image: uploadResponse.secure_url,
      user: userId
    });

    await report.save();

    res.status(201).json({
      success: true,
      message: "Report created successfully",
      data: {
        id: report._id,
        title: report.title,
        description: report.description,
        image: report.image,
        createdAt: report.createdAt
      }
    });

  } catch (error) {
    console.error("Error creating report:", error);

    // Clean up: remove temporary file if upload failed
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error("Error cleaning up temporary file:", cleanupError);
      }
    }

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

export const getUserReports = async (req, res) => {
  try {
    const userId = req.user.userId;

    const reports = await Report.find({ user: userId })
      .sort({ createdAt: -1 })
      .select('title description image createdAt');

    res.status(200).json({
      success: true,
      data: reports
    });

  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

export const deleteReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const userId = req.user.userId;

    // Find and delete the report
    const report = await Report.findOneAndDelete({
      _id: reportId,
      user: userId
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found or not authorized"
      });
    }

    // Extract public ID from Cloudinary URL to delete the image
    const publicId = report.image.split('/').pop().split('.')[0];

    try {
      // Delete image from Cloudinary
      await cloudinary.uploader.destroy(`patient_reports/${publicId}`);
    } catch (cloudinaryError) {
      console.error("Error deleting image from Cloudinary:", cloudinaryError);
      // Continue even if Cloudinary deletion fails
    }

    res.status(200).json({
      success: true,
      message: "Report deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting report:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};
