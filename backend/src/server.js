import express from "express";
import cors from "cors";
import helmet from "helmet";
import ENV from "./config/env.config.js";
import cookieParser from "cookie-parser";
import dotenv from "dotenv" ; 
import path from "path" ; 

dotenv.config() ; 
// Import routers
import authRouter from "./routers/auth.router.js";
import productRouter from "./routers/product.router.js";
import cartRouter from "./routers/cart.router.js";
import favoritesRouter from "./routers/favorites.router.js";
import checkoutRouter from "./routers/checkout.router.js";
import categoryRouter from "./routers/category.router.js";

// Import middleware
import {
  generalRateLimit,
  logRequests,
  getRecentLogs,
} from "./middleware/security.middleware.js";
import prisma from "./prisma/client.js";

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.NODE_ENV === "production" 
        ? process.env.FRONTEND_URL 
        : "http://localhost:5173",
    credentials: true
}))

// General rate limiting (disabled for testing)
// app.use(generalRateLimit);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
const __dirname = path.resolve();
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Request logging middleware
app.use(logRequests);

// Debug middleware (only in development)
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url} - Body:`, req.body);
    next();
  });
}

// API routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/favorites", favoritesRouter);
app.use("/api/v1", checkoutRouter);
app.use("/api/v1/categories", categoryRouter);

// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      database: "disconnected",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// healthz router 
app.get("/:IEC2024058/healthz", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: "healthy",
      rollno: req.params.IEC2024058,
      database: "connected",
      timestamp: new Date().toISOString(),
      assignmentSeed: "GHW25-058",
    });
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      rollno: req.params.IEC2024058,
      database: "disconnected",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Recent logs endpoint (redacted)
app.get("/logs/recent", (req, res) => {
  try {
    const logs = getRecentLogs();
    res.status(200).json({
      logs,
      count: logs.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch logs",
      timestamp: new Date().toISOString(),
    });
  }
});

app.use("/", (req, res) => {
  res.json({
    message: "Marketplace API is live",
    version: "1.0.0",
    assignmentSeed: "GHW25-058",
  });
});

// Production setup
if(process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")))

    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"))
    })
}

// Test database connection
async function testDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully!");

    // Test a simple query
    const userCount = await prisma.user.count();
    console.log(`Total users in database: ${userCount}`);
  } catch (error) {
    console.error("Database connection failed:", error.message);
  }
}



const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
