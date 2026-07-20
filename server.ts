import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import cookieParser from "cookie-parser";
import { shutdownDatabase } from "./server/api/db.ts";

import authRoutes from "./server/api/routes/authRoutes.ts";
import productRoutes from "./server/api/routes/productRoutes.ts";
import orderRoutes from "./server/api/routes/orderRoutes.ts";
import inventoryRoutes from "./server/api/routes/inventoryRoutes.ts";
import deliveryRoutes from "./server/api/routes/deliveryRoutes.ts";
import adminRoutes from "./server/api/routes/adminRoutes.ts";
import categoryRoutes from "./server/api/routes/categoryRoutes.ts";

import { globalErrorHandler } from "./server/api/middlewares/errorMiddleware.ts";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middlewares Globales:
  app.use(cors());
  app.use(express.json());
  app.use(cookieParser());

  // API Layers
  app.use("/api/auth", authRoutes);
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
