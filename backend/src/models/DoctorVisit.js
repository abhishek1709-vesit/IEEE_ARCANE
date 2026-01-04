import mongoose from "mongoose";

const doctorVisitSchema = new mongoose.Schema(
  {
    doctorName: {
      type: String,
      required: [true, "Doctor name is required"],
      trim: true,
    },
    dateOfVisit: {
      type: Date,
      required: [true, "Date of visit is required"],
    },
    timeOfVisit: {
      type: String,
      required: [true, "Time of visit is required"],
      // Validate 24-hour format HH:MM
      validate: {
        validator: function(v) {
          return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: props => `${props.value} is not a valid time format! Please use 24-hour format (HH:MM)`
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

const DoctorVisit = mongoose.model("DoctorVisit", doctorVisitSchema);

export default DoctorVisit;
