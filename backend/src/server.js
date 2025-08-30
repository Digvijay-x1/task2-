import express from "express";
import ENV from "./config/env.config.js";
import cookieParser from "cookie-parser";
import userRouter from "./routers/user.router.js";
const app = express();

app.use(express.json());
app.use(cookieParser());

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - Body:`, req.body);
  next();
});

app.use("/api/v1", userRouter);
app.use("/", (req, res) => {
  res.json("The server is live");
});

app.listen(ENV.PORT, () => {
  console.log(`Server is running on port ${ENV.PORT}`);
});
