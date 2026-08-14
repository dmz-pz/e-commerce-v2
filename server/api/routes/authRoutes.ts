import { Router } from "express";
import { authController } from "../controllers/authController.ts";
import { validateResource } from "../middlewares/validate.middleware.ts";
import {
  forgotPasswordSchema,
  resetPasswordSchema
} from "../schemas/authSchema.ts";
import { catchAsync } from "../utils/catchAsync.ts";

const router = Router();

router.post("/forgot-password", validateResource(forgotPasswordSchema), catchAsync(authController.forgotPassword));
router.post("/reset-password", validateResource(resetPasswordSchema), catchAsync(authController.resetPassword));

export default router;
