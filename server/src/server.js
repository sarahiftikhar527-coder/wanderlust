require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");
const config = require("./config");

const {
  notFound,
  errorHandler,
} = require("./middleware/error");

const authRoutes = require("./routes/authRoutes");
const experienceRoutes = require("./routes/experienceRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const loginActivityRoutes = require("./routes/loginActivityRoutes");
const contactRoutes = require("./routes/contactRoutes");

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
    contentSecurityPolicy:
      config.app.env === "production",
  })
);

app.use(
  cors({
    origin: config.app.clientUrl,
    credentials: true,
    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

app.use(compression());

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

if (config.app.env !== "test") {
  app.use(
    morgan(
      config.app.env === "production"
        ? "combined"
        : "dev"
    )
  );
}

const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many requests, please try again later.",
  },
});

app.use("/api", apiLimiter);

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Wanderlust API 🚀",
    version: "1.0.0",
    environment: config.app.env,
    api: "/api",
    health: "/api/health",
  });
});

app.get("/api", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Wanderlust API 🚀",
    version: "1.0.0",
    environment: config.app.env,
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      experiences: "/api/experiences",
      categories: "/api/categories",
      bookings: "/api/bookings",
      notifications: "/api/notifications",
      admin: "/api/admin",
      loginActivities: "/api/login-activities",
      contacts: "/api/contacts",
    },
  });
});

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Wanderlust API is running",
    timestamp: new Date().toISOString(),
    environment: config.app.env,
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/experiences", experienceRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/login-activities", loginActivityRoutes);
app.use("/api/contacts", contactRoutes);

app.use(notFound);
app.use(errorHandler);

let server;

const startServer = async () => {
  try {
    await connectDB();

    console.log("MongoDB connected successfully");

    const PORT = process.env.PORT || config.app.port || 5000;

    server = app.listen(PORT, "0.0.0.0", () => {
      console.log(
        `Wanderlust API running on port ${PORT} in ${config.app.env} mode`
      );

      console.log(
        `API: http://localhost:${PORT}/api`
      );

      console.log(
        `Health: http://localhost:${PORT}/api/health`
      );
    });
  } catch (error) {
    console.error(
      "Failed to start Wanderlust server:",
      error
    );

    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

const shutdown = (signal) => {
  console.log(
    `${signal} received. Shutting down gracefully...`
  );

  if (!server) {
    process.exit(0);
  }

  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
};

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

module.exports = app;