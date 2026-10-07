import { Router } from "express";
import { checkAvailability, getUserByCedula } from "../controllers/userController.ts";
import { verifyToken } from "../middlewares/auth.middleware.ts";

const router = Router();

// Endpoint público para verificar disponibilidad de cédula, email y teléfono
router.get("/check", checkAvailability);

// Endpoint privado para autocompletado en toma de pedidos
router.get("/by-cedula/:cedula", verifyToken, getUserByCedula);

export default router;
