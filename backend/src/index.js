import express from "express";
import "dotenv/config";
import connectDB from "./lib/db.js";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import medicineRoutes from "./routes/medicine.routes.js";
import reportRoutes from "./routes/report.routes.js";
import checkinRoutes from "./routes/checkin.routes.js";
import doctorRoutes from "./routes/doctor.routes.js";

const app = express();

// Configure CORS middleware
const corsOptions = {
  origin: function (origin, callback) {
    // Allow all origins in development for easier testing
    // In production, you should restrict this to specific domains
    if (!origin || origin.startsWith("http://localhost") || origin.startsWith("http://127.0.0.1") || origin.includes("exp://")) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins for development
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept", "Origin"],
  exposedHeaders: ["Content-Length", "X-Kuma-Revision"],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 200,
};

// Add CORS middleware
app.use(cors(corsOptions));
app.use(express.json());

// Serve static files from uploads directory
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/medicine", medicineRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/checkin", checkinRoutes);
app.use("/api/doctor", doctorRoutes);

connectDB();

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
