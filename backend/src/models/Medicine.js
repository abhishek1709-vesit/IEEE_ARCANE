import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Medicine name is required"],
      trim: true,
    },
    times: {
      type: [String],
      required: [true, "At least one time is required"],
      validate: {
        validator: function(v) {
          return v.length > 0;
        },
        message: "At least one time must be provided"
      }
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

const Medicine = mongoose.model("Medicine", medicineSchema);

export default Medicine;
