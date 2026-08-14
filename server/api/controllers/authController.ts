import { Request, Response } from "express";
import { authService } from "../services/authService";
import { AppError } from "../utils/appErrors.ts";

export class AuthController {
  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      const result = await authService.requestPasswordReset(email);
      res.status(200).json({
        status: "success",
        ...result,
      });
    } catch (e: unknown) {
      const error = e as Error;
      throw new AppError(error.message || "Error al solicitar recuperación de contraseña", 400);
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const { email, code, newPassword } = req.body;
      const result = await authService.resetPassword(email, code, newPassword);
      res.status(200).json({
        status: "success",
        ...result,
      });
    } catch (e: unknown) {
      const error = e as Error;
      throw new AppError(error.message || "Error al restablecer la contraseña", 400);
    }
  }
}

export const authController = new AuthController();
