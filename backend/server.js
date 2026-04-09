import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";

const app = express();

// --- security & parsing ---
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// --- CORS (frontend origin only) ---
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.get("/", (_req, res) => res.send("Talent Matching API is running"));

// routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

// central error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error("Unhandled Error:", err);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Internal server error" });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(process.env.PORT || 5050, "0.0.0.0", () =>
      console.log(`Server running on port ${process.env.PORT || 5050}`)
    );
  })
  .catch((err) => console.error("MongoDB connection error:", err));
