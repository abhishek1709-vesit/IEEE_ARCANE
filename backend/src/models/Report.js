import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      default: "Untitled Report"
    },
    description: {
      type: String,
      trim: true,
      default: "No description provided"
    },
    image: {
      type: String,
      required: [true, "Image URL is required"]
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Report = mongoose.model("Report", reportSchema);

export default Report;
