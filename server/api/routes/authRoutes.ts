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

const router = Router();

// Endpoint para iniciar sesión
router.post("/login", validateResource(loginSchema), authController.login);
router.post(
  "/register",
  validateResource(registerSchema),
  authController.register,
);
router.post("/forgot-password", validateResource(forgotPasswordSchema), authController.forgotPassword);
router.post("/reset-password", validateResource(resetPasswordSchema), authController.resetPassword);

router.get("/me", verifyToken, authController.getMe);
router.post("/logout", authController.logout);

export default router;
