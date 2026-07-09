import { Request, Response } from "express";
import { authService } from "../services/authService";

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
        secure: false,
        sameSite: "lax",
        maxAge: 2 * 60 * 60 * 1000,
      });

      res.status(200).json({
        status: "success",
        message: "Inicio de sesión exitoso",
        user,
      });
    } catch (error: any) {
      if (error.message === "Credenciales incorrectas") {
        res.status(401).json({ status: "fail", message: error.message });
        return;
      }

      res
        .status(500)
        .json({ status: "error", message: "Error interno del servidor" });
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
    } catch (error: any) {
      if (error.message === "El correo electrónico ya está en uso") {
        res.status(400).json({ status: "fail", message: error.message });
        return;
      }

      res.status(500).json({
        status: "error",
        message: `Error interno al registrar usuario: ${error.message}`,
      });
    }
  }

  async logout(req: Request, res: Response) {
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

  async getMe(req: Request, res: Response) {
    try {
      const currentUser = req.user;

      if (!currentUser) {
        res.status(401).json({ status: "fail", message: "No autenticado" });
        return;
      }

      res.status(200).json({
        status: "success",
        user: currentUser,
      });
    } catch (error: any) {
      res.status(500).json({
        status: "error",
        message: "Error al obtener la sesión del usuario",
      });
    }
  }
}

export const authController = new AuthController();
