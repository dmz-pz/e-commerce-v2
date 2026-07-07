import { Router } from "express";
import { authController } from "../controllers/authController.ts";
import { validateResource } from "../middlewares/validate.middleware.ts";
import { loginSchema, registerSchema } from "../schemas/authSchema.ts";

const router = Router();

// Endpoint para iniciar sesión
router.post("/login", validateResource(loginSchema), authController.login);
router.post(
  "/register",
  validateResource(registerSchema),
  authController.register,
);

export default router;
