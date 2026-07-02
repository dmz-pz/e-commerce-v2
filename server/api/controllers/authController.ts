import { Request, Response } from "express";
import { authService } from "../services/authService";

export class AuthController {
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const result = await authService.authenticateUser(email, password);

      res.status(200).json({
        status: "success",
        message: "Inicio de sesión exitoso",
        ...result,
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
}

export const authController = new AuthController();
