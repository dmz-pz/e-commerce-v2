import { Router } from "express";
import { authController } from "../controllers/authController.ts";

const router = Router();

// Endpoint para iniciar sesión
router.post("/login", authController.login);
router.post("/register", authController.register);

export default router;
