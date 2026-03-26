const express = require("express");
const { randomUUID } = require("crypto");
require("dotenv").config();
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { getAllFeedback, insertFeedback, checkDatabaseHealth } = require("./db");

const parsedFrontendUrls = (process.env.FRONTEND_URLS || "http://localhost:5173")
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);
const CORS_ORIGIN =
  parsedFrontendUrls.length === 1 && parsedFrontendUrls[0] === "*" ? true : parsedFrontendUrls;

const app = express();

app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  })
);

app.get("/", (_req, res) => {
  res.json({
    service: "sample-backend",
    status: "ok",
    endpoints: ["/api/health", "/api/feedback"],
  });
});

app.get("/api/health", async (_req, res) => {
  try {
    await checkDatabaseHealth();
    res.json({ status: "ok", database: "up", timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ status: "degraded", database: "down", error: error.message });
  }
});

app.get("/api/feedback", async (_req, res) => {
  try {
    const feedback = await getAllFeedback();
    res.json(feedback);
  } catch (_error) {
    res.status(500).json({ error: "Failed to fetch feedback" });
  }
});

app.post("/api/feedback", async (req, res) => {
  const { name, message, rating } = req.body || {};

  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "message is required" });
  }

  const numericRating = Number(rating);
  if (rating !== undefined && (Number.isNaN(numericRating) || numericRating < 1 || numericRating > 5)) {
    return res.status(400).json({ error: "rating must be between 1 and 5" });
  }

  const feedback = {
    id: randomUUID(),
    name: typeof name === "string" && name.trim() ? name.trim() : "Anonymous",
    message: message.trim(),
    rating: rating === undefined ? null : numericRating,
    createdAt: new Date().toISOString(),
  };

  try {
    const savedFeedback = await insertFeedback(feedback);
    return res.status(201).json(savedFeedback);
  } catch (_error) {
    return res.status(500).json({ error: "Failed to save feedback" });
  }
});

module.exports = app;
