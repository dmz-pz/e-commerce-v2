import { Request, Response } from "express";
import { authService } from "../services/authService";
import { AppError } from "../utils/appErrors.ts";

export class AuthController {
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const { token, user } = await authService.authenticateUser(
        email,
        password,
      );

      res.cookie("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 2 * 60 * 60 * 1000,
      });

      res.status(200).json({
        status: "success",
        message: "Inicio de sesión exitoso",
        user,
      });
    } catch (e: unknown) {
      const error = e as Error;
      if (error.message === "Credenciales incorrectas") {
        throw new AppError(error.message, 401);
      }
      throw error;
    }
  }

  async register(req: Request, res: Response) {
    try {
      const newUser = await authService.registerUser(req.body);

      res.status(201).json({
        status: "success",
        message: "Usuario registrado con éxito",
        user: newUser,
      });
    } catch (e: unknown) {
      const error = e as Error;
      if (error.message === "El correo electrónico ya está en uso") {
        throw new AppError(error.message, 400);
      }
      throw error;
    }
  }

  async logout(_req: Request, res: Response) {
    res.clearCookie("access_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    res.status(200).json({
      status: "success",
      message: "Sesión cerrada correctamente",
    });
  }

  async getProfile(req: Request, res: Response) {
    const currentUser = req.user;

    if (!currentUser) {
      throw new AppError("No autenticado", 401);
    }

    res.status(200).json({
      status: "success",
      user: currentUser,
    });
  }

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
