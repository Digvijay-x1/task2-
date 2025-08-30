import express from "express";
import ENV from "./config/env.config.js";
import cookieParser from "cookie-parser";
import userRouter from "./routers/auth.router.js";
import prisma from "./prisma/client.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - Body:`, req.body);
  next();
});

app.use("/api/v1", userRouter);

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

app.use("/", (req, res) => {
  res.json("The server is live");
});

// Test database connection
async function testDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully!");

    // Test a simple query
    const userCount = await prisma.user.count();
    console.log(`📊 Total users in database: ${userCount}`);
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
  }
}

app.listen(ENV.PORT, async () => {
  console.log(`Server is running on port ${ENV.PORT}`);
  await testDatabaseConnection();
});
