import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { shutdownDatabase } from "./server/api/db.ts";

import productRoutes from "./server/api/routes/productRoutes.ts";
import orderRoutes from "./server/api/routes/orderRoutes.ts";
import inventoryRoutes from "./server/api/routes/inventoryRoutes.ts";
import deliveryRoutes from "./server/api/routes/deliveryRoutes.ts";
import adminRoutes from "./server/api/routes/adminRoutes.ts";
import categoryRoutes from "./server/api/routes/categoryRoutes.ts";

import { toNodeHandler, fromNodeHeaders } from "better-auth/node";
import { auth } from "./server/api/lib/auth.ts";
import { globalErrorHandler } from "./server/api/middlewares/errorMiddleware.ts";

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Middlewares Globales:
  if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
  }

  app.use(
    helmet({
      contentSecurityPolicy: process.env.NODE_ENV === "production" ? {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          imgSrc: ["'self'", "data:", "blob:", "https://images.minegociosup.com"],
          fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
          connectSrc: ["'self'"],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: [],
        },
      } : false,
    })
  );

  const allowedOrigins = [
    process.env.APP_URL,
    ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",").map(o => o.trim()) : [])
  ].filter(Boolean);

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (process.env.NODE_ENV !== "production") {
        if (/^https?:\/\/localhost(:\d+)?$/.test(origin) || /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) {
          return callback(null, true);
        }
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      callback(new Error(`Origen ${origin} no permitido por CORS`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    maxAge: 86400,
  }));
  app.all("/api/auth/*", toNodeHandler(auth));
  app.use(express.json());
  app.use(cookieParser());

  // API Layers
  app.use("/api/products", productRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/inventory", inventoryRoutes);
  app.use("/api/delivery", deliveryRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/categories", categoryRoutes);

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "SuperMercado Express API is running" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.use(globalErrorHandler);
  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  const gracefulShutdown = async () => {
    console.log("Shutting down gracefully...");
    server.close(async (err) => {
      if (err) {
        console.error("Error closing server:", err);
        process.exit(1);
      }
      await shutdownDatabase();
      process.exit(0);
    });
  };

  process.on("SIGINT", gracefulShutdown);
  process.on("SIGTERM", gracefulShutdown);
}

startServer();
