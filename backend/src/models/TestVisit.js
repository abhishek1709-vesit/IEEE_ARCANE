import mongoose from "mongoose";

const testVisitSchema = new mongoose.Schema(
  {
    testName: {
      type: String,
      required: [true, "Test name is required"],
      trim: true,
    },
    dateOfTest: {
      type: Date,
      required: [true, "Date of test is required"],
    },
    timeOfTest: {
      type: String,
      required: [true, "Time of test is required"],
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

const TestVisit = mongoose.model("TestVisit", testVisitSchema);

export default TestVisit;
