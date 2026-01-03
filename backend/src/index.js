import express from "express";
import "dotenv/config";
import connectDB from "./lib/db.js";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import medicineRoutes from "./routes/medicine.routes.js";
import reportRoutes from "./routes/report.routes.js";
import checkinRoutes from "./routes/checkin.routes.js";

const app = express();

app.use(
    cors({
        origin: [
            "http://localhost:3000", // React web
            "http://localhost:5173", // Vite
            "http://localhost:19006", // Expo web
            "exp://", // Expo Go,
            "*"
        ],
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    })
);
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/medicine", medicineRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/checkin", checkinRoutes);

connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
