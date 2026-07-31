import { Router } from "express";
import { authController } from "../controllers/authController.ts";
import { validateResource } from "../middlewares/validate.middleware.ts";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} from "../schemas/authSchema.ts";
import { verifyToken } from "../middlewares/auth.middleware.ts";
import { catchAsync } from "../utils/catchAsync.ts";

const router = Router();

// Endpoint para iniciar sesión
router.post("/login", validateResource(loginSchema), catchAsync(authController.login));
router.post(
  "/register",
  validateResource(registerSchema),
  catchAsync(authController.register),
);
router.post("/forgot-password", validateResource(forgotPasswordSchema), catchAsync(authController.forgotPassword));
router.post("/reset-password", validateResource(resetPasswordSchema), catchAsync(authController.resetPassword));

router.get("/me", verifyToken, catchAsync(authController.getProfile));
router.post("/logout", catchAsync(authController.logout));

export default router;
