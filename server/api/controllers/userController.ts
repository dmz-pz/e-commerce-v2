import type { Request, Response, NextFunction } from "express";
import { userService } from "../services/userService.ts";

export const checkAvailability = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cedula = req.query.cedula as string | undefined;
    const phone = req.query.phone as string | undefined;
    const email = req.query.email as string | undefined;

    const issues = await userService.checkAvailability(cedula, phone, email);

    if (issues.length > 0) {
      // Return formatting similar to Zod error for consistent frontend handling
      res.status(400).json({
        status: "fail",
        message: "Datos ya registrados",
        issues,
      });
      return;
    }

    res.status(200).json({ status: "success", message: "Disponible" });
  } catch (error) {
    next(error);
  }
};

export const getUserByCedula = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cedula = req.params.cedula;
    if (!cedula) {
      res.status(400).json({ error: "La cédula es requerida." });
      return;
    }
    const user = await userService.getUserByCedula(cedula);
    if (!user) {
      res.status(404).json({ error: "Usuario no encontrado." });
      return;
    }
    res.json({ name: user.name, phone: user.phone, cedula: user.cedula });
  } catch (error) {
    next(error);
  }
};
