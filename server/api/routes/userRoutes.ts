import { Router } from "express";
import { checkAvailability } from "../controllers/userController.ts";

const router = Router();

// Endpoint público para verificar disponibilidad de cédula, email y teléfono
router.get("/check", checkAvailability);

export default router;
