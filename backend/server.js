import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger.js";


import authRoutes      from "./routes/auth.js";
import userRoutes      from "./routes/user.js";
import candidateRoutes from "./routes/candidate.js";
import employerRoutes  from "./routes/employer.js";
import jobRoutes             from "./routes/jobs.js";
import recommendationRoutes  from "./routes/recommendations.js";
import candidatesRoutes      from "./routes/candidates.js";

// --- Fail fast if critical environment variables are missing ---
const REQUIRED_ENV = ["MONGO_URI", "JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`[server] Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

const app = express();

// --- Security & parsing ---
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

// --- Health check ---
app.get("/", (_req, res) => res.json({ message: "Talent Matching API is running" }));

// --- API routes ---
app.use("/api/auth",      authRoutes);
app.use("/api/user",      userRoutes);
app.use("/api/candidate", candidateRoutes);
app.use("/api/employer",  employerRoutes);
app.use("/api/jobs",            jobRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/candidates",      candidatesRoutes);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- 404 handler (must come after all routes) ---
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// --- Global error handler (must have 4 parameters for Express to treat it as error middleware) ---
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error("[server] Unhandled error:", err);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

// --- Connect to MongoDB then start server ---
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("[server] Connected to MongoDB");
    const PORT = process.env.PORT || 5050;
    app.listen(PORT, "0.0.0.0", () =>
      console.log(`[server] Running on port ${PORT}`)
    );
  })
  .catch((err) => {
    console.error("[server] MongoDB connection error:", err.message);
    process.exit(1);
  });
